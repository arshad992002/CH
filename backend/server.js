const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React dev server can query this backend
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Serve the static images directory at '/images'
app.use('/images', express.static(path.join(__dirname, 'images')));


// Authentication Helper Middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'staff123';
const VOLUNTEER_PASSWORD = process.env.VOLUNTEER_PASSWORD || 'volunteer123';

const ADMIN_TOKEN = 'secret-caring-hands-token-2026';
const STAFF_TOKEN = 'secret-caring-hands-staff-2026';
const VOLUNTEER_TOKEN = 'secret-caring-hands-volunteer-2026';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    
    // Check dynamic users database
    const users = db.getUsers();
    const dynamicUser = users.find(u => token === `caring-hands-token-${u.role}-${u.username}-${u.id}`);
    if (dynamicUser) {
      req.userRole = dynamicUser.role;
      req.userId = dynamicUser.id;
      req.username = dynamicUser.username;
      return next();
    }

    // For backward compatibility
    if (token === ADMIN_TOKEN || token === STAFF_TOKEN || token === VOLUNTEER_TOKEN) {
      req.userRole = token === ADMIN_TOKEN ? 'admin' : (token === STAFF_TOKEN ? 'staff' : 'volunteer');
      return next();
    }
  }
  res.status(401).json({ error: 'Unauthorized: Valid token required.' });
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.userRole === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Unauthorized: Admin access required.' });
    }
  });
}

// ------------------- PUBLIC ENDPOINTS -------------------

// Root endpoint redirecting to the React frontend in dev, or serving build in prod
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production' || (req.hostname !== 'localhost' && req.hostname !== '127.0.0.1')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.redirect('http://localhost:5173');
  }
});


// Get general settings
app.get('/api/settings', (req, res) => {
  res.json(db.getSettings());
});

// Get events list
app.get('/api/events', (req, res) => {
  res.json(db.getEvents());
});

// Get gallery images
app.get('/api/gallery', (req, res) => {
  res.json(db.getGallery());
});

// Get partners list
app.get('/api/partners', (req, res) => {
  res.json(db.getPartners());
});

// Get homepage banner slides
app.get('/api/banners', (req, res) => {
  res.json(db.getBanners());
});

// Submit a message (contact form)
app.post('/api/messages', (req, res) => {
  const { name, email, phone, purpose, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const messages = db.getMessages();
  const newMessage = {
    id: `msg_${Date.now()}`,
    name,
    email,
    phone: phone || '',
    purpose: purpose || 'General enquiry',
    message,
    createdAt: new Date().toISOString(),
    status: 'unread'
  };

  messages.unshift(newMessage); // Add to the top
  db.saveMessages(messages);
  res.status(201).json(newMessage);
});

// Get menu items list
app.get('/api/menu', (req, res) => {
  res.json(db.getMenu());
});


// ------------------- ADMIN AUTHENTICATION -------------------

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Search dynamic users
  const users = db.getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    const token = `caring-hands-token-${user.role}-${user.username}-${user.id}`;
    return res.json({ token, role: user.role, success: true });
  }

  // Fallback for environment variables
  if (username === 'admin' && password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN, role: 'admin', success: true });
  } else if (username === 'staff' && password === STAFF_PASSWORD) {
    return res.json({ token: STAFF_TOKEN, role: 'staff', success: true });
  } else if (username === 'volunteer' && password === VOLUNTEER_PASSWORD) {
    return res.json({ token: VOLUNTEER_TOKEN, role: 'volunteer', success: true });
  }

  res.status(401).json({ error: 'Invalid username or password.' });
});

// Get list of users (Admin only)
app.get('/api/users', requireAdmin, (req, res) => {
  res.json(db.getUsers());
});

// Create new user (Admin only)
app.post('/api/users', requireAdmin, (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required.' });
  }

  const users = db.getUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    username,
    password,
    role
  };

  users.push(newUser);
  db.saveUsers(users);
  res.status(201).json(newUser);
});

// Delete user (Admin only)
app.delete('/api/users/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (id === 'user_admin') {
    return res.status(400).json({ error: 'Cannot delete the primary administrator account.' });
  }

  let users = db.getUsers();
  const exists = users.find(u => u.id === id);
  if (!exists) {
    return res.status(404).json({ error: 'User not found.' });
  }

  users = users.filter(u => u.id !== id);
  db.saveUsers(users);
  res.json({ success: true, message: 'User deleted successfully.' });
});


// ------------------- SECURED ADMIN ENDPOINTS -------------------

// Upload an image (Admin/Staff/Volunteer)
app.post('/api/upload', requireAuth, async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  // Expecting format: data:image/png;base64,... or data:image/jpeg;base64,...
  const matches = image.match(/^data:image\/([A-Za-z+-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ error: 'Invalid base64 image data' });
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const filename = `upload_${Date.now()}.${ext}`;

  // Try uploading to Supabase Storage first if connected
  const supabase = db.getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filename, buffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          cacheControl: '3600',
          upsert: true
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('images')
          .getPublicUrl(filename);
        if (publicUrlData && publicUrlData.publicUrl) {
          console.log('Image successfully uploaded to Supabase Storage:', publicUrlData.publicUrl);
          return res.json({ url: publicUrlData.publicUrl });
        }
      } else {
        console.warn('Supabase storage upload failed, falling back to local storage:', error.message);
      }
    } catch (err) {
      console.error('Failed to upload image to Supabase, trying local fallback:', err);
    }
  }

  // Local storage fallback
  const uploadDir = path.join(__dirname, 'images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving uploaded file locally:', err);
      return res.status(500).json({ error: 'Failed to save image' });
    }
    res.json({ url: `/images/${filename}` });
  });
});

// Update general settings
app.put('/api/settings', requireAdmin, (req, res) => {
  const settings = db.getSettings();
  const updatedSettings = {
    ...settings,
    ...req.body
  };
  db.saveSettings(updatedSettings);
  res.json(updatedSettings);
});

// Events CRUD
app.post('/api/events', requireAuth, (req, res) => {
  const { title, description, time, location, day, month, category, image } = req.body;
  if (!title || !description || !day || !month) {
    return res.status(400).json({ error: 'Title, description, day, and month are required.' });
  }

  const events = db.getEvents();
  const newEvent = {
    id: `event_${Date.now()}`,
    title,
    description,
    time: time || 'TBD',
    location: location || 'TBD',
    day,
    month,
    category: category || 'Upcoming',
    image: image || '/images/event_1.png'
  };

  events.push(newEvent);
  db.saveEvents(events);
  res.status(201).json(newEvent);
});

app.put('/api/events/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const events = db.getEvents();
  const index = events.findIndex(e => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  events[index] = {
    ...events[index],
    ...req.body,
    id // preserve original id
  };

  db.saveEvents(events);
  res.json(events[index]);
});

app.delete('/api/events/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  let events = db.getEvents();
  const initialLength = events.length;
  events = events.filter(e => e.id !== id);

  if (events.length === initialLength) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  db.saveEvents(events);
  res.json({ success: true, message: 'Event deleted successfully.' });
});

// Gallery CRUD
app.post('/api/gallery', requireAuth, (req, res) => {
  const { image, caption, subImages } = req.body;
  if (!image || !caption) {
    return res.status(400).json({ error: 'Image URL and caption are required.' });
  }

  const gallery = db.getGallery();
  const newItem = {
    id: `gal_${Date.now()}`,
    image,
    caption,
    subImages: Array.isArray(subImages) ? subImages : []
  };

  gallery.push(newItem);
  db.saveGallery(gallery);
  res.status(201).json(newItem);
});

app.delete('/api/gallery/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  let gallery = db.getGallery();
  const initialLength = gallery.length;
  gallery = gallery.filter(item => item.id !== id);

  if (gallery.length === initialLength) {
    return res.status(404).json({ error: 'Gallery item not found.' });
  }

  db.saveGallery(gallery);
  res.json({ success: true, message: 'Gallery item deleted successfully.' });
});

// Partners CRUD
app.post('/api/partners', requireAdmin, (req, res) => {
  const { name, icon } = req.body;
  if (!name || !icon) {
    return res.status(400).json({ error: 'Partner name and icon/emoji are required.' });
  }

  const partners = db.getPartners();
  const newPartner = {
    id: `partner_${Date.now()}`,
    name,
    icon
  };

  partners.push(newPartner);
  db.savePartners(partners);
  res.status(201).json(newPartner);
});

app.delete('/api/partners/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  let partners = db.getPartners();
  const initialLength = partners.length;
  partners = partners.filter(p => p.id !== id);

  if (partners.length === initialLength) {
    return res.status(404).json({ error: 'Partner not found.' });
  }

  db.savePartners(partners);
  res.json({ success: true, message: 'Partner deleted successfully.' });
});

// Messages Inbox management (Admin/Volunteer)
app.get('/api/messages', requireAuth, (req, res) => {
  res.json(db.getMessages());
});

app.put('/api/messages/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const messages = db.getMessages();
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  messages[index] = {
    ...messages[index],
    ...req.body,
    id // preserve id
  };

  db.saveMessages(messages);
  res.json(messages[index]);
});

app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  let messages = db.getMessages();
  const initialLength = messages.length;
  messages = messages.filter(m => m.id !== id);

  if (messages.length === initialLength) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  db.saveMessages(messages);
  res.json({ success: true, message: 'Message deleted successfully.' });
});

// Add menu item (Admin/Staff)
app.post('/api/menu', requireAuth, (req, res) => {
  const { category, title, description, time } = req.body;
  if (!category || !title || !description) {
    return res.status(400).json({ error: 'Category, title, and description are required.' });
  }

  const menu = db.getMenu();
  const newItem = {
    id: `menu_${Date.now()}`,
    category,
    title,
    description,
    time: time || ''
  };

  menu.push(newItem);
  db.saveMenu(menu);
  res.status(201).json(newItem);
});

// Delete menu item (Admin only)
app.delete('/api/menu/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  let menu = db.getMenu();
  const initialLength = menu.length;
  menu = menu.filter(item => item.id !== id);

  if (menu.length === initialLength) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  db.saveMenu(menu);
  res.json({ success: true, message: 'Menu item deleted successfully.' });
});


// Add banner slide (Admin/Staff)
app.post('/api/banners', requireAuth, (req, res) => {
  const { image, title, subtitle } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const banners = db.getBanners();
  const newBanner = {
    id: `banner_${Date.now()}`,
    image,
    title: title || '',
    subtitle: subtitle || '',
    createdAt: new Date().toISOString()
  };

  banners.push(newBanner);
  db.saveBanners(banners);
  res.status(201).json(newBanner);
});

// Delete banner slide (Admin/Staff)
app.delete('/api/banners/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  let banners = db.getBanners();
  const initialLength = banners.length;
  banners = banners.filter(b => b.id !== id);

  if (banners.length === initialLength) {
    return res.status(404).json({ error: 'Banner slide not found.' });
  }

  db.saveBanners(banners);
  res.json({ success: true, message: 'Banner slide deleted.' });
});


// Serve frontend static build files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback all routes to index.html (React Router / view state support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
