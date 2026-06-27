import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Image as ImageIcon, Users, Mail, Heart, 
  Settings, LogOut, Plus, Trash2, Edit, Check, Eye, RefreshCw, Images 
} from 'lucide-react';

const API_BASE = '/api';

const AdminDashboard = ({ token, role = 'admin', onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const hasAccess = (tab) => {
    if (role === 'admin') return true;
    if (role === 'staff') {
      return ['overview', 'menu', 'gallery', 'banners', 'events'].includes(tab);
    }
    if (role === 'volunteer') {
      return ['overview', 'events', 'messages'].includes(tab);
    }
    return false;
  };
  
  // Dashboard Data State
  const [settings, setSettings] = useState(null);
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [partners, setPartners] = useState([]);
  const [messages, setMessages] = useState([]);
  const [menu, setMenu] = useState([]);
  const [banners, setBanners] = useState([]);
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'staff' });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'event_add' | 'event_edit' | 'message_view'
  const [selectedItem, setSelectedItem] = useState(null); // stores active editing/viewing item

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '', description: '', time: '', location: '',
    day: '', month: '', category: 'Upcoming', image: '/images/event_1.png'
  });
  
  const [galleryForm, setGalleryForm] = useState({
    image: '', caption: '', subImages: []
  });

  const [partnerForm, setPartnerForm] = useState({
    name: '', icon: '🤝'
  });

  const [bannerForm, setBannerForm] = useState({
    image: '', title: '', subtitle: ''
  });

  const [menuForm, setMenuForm] = useState({
    category: 'Daily Meals',
    customCategory: '',
    title: '',
    description: '',
    time: ''
  });

  // Load all dashboard contents
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [settingsRes, eventsRes, galleryRes, partnersRes, messagesRes, menuRes, bannersRes] = await Promise.all([
        fetch(`${API_BASE}/settings`).then(r => r.json()),
        fetch(`${API_BASE}/events`).then(r => r.json()),
        fetch(`${API_BASE}/gallery`).then(r => r.json()),
        fetch(`${API_BASE}/partners`).then(r => r.json()),
        fetch(`${API_BASE}/messages`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/menu`).then(r => r.json()),
        fetch(`${API_BASE}/banners`).then(r => r.json())
      ]);

      setSettings(settingsRes);
      setEvents(eventsRes);
      setGallery(galleryRes);
      setPartners(partnersRes);
      setMessages(messagesRes);
      setMenu(menuRes || []);
      setBanners(bannersRes || []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (role !== 'admin') return;
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    if (role === 'admin') {
      fetchUsers();
    }
  }, [token, role]);

  // Headers helper
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const handleFileUpload = async (file) => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return null;
    }
    
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ image: base64 })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        const errData = await response.json();
        alert(`Upload failed: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Error uploading file.');
    } finally {
      setUploading(false);
    }
    return null;
  };

  // Settings Actions
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        alert('Settings updated successfully!');
      } else {
        alert('Failed to update settings.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Events Actions
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const isEdit = modalType === 'event_edit';
    const url = isEdit ? `${API_BASE}/events/${selectedItem.id}` : `${API_BASE}/events`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        setModalType(null);
        fetchAllData();
      } else {
        alert('Error saving event.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`${API_BASE}/events/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Gallery Actions
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.image) {
      alert('Please upload an image first.');
      return;
    }
    if (!galleryForm.caption) return;
    try {
      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(galleryForm)
      });
      if (response.ok) {
        setGalleryForm({ image: '', caption: '', subImages: [] });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Partners Actions
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!partnerForm.name) return;
    try {
      const response = await fetch(`${API_BASE}/partners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(partnerForm)
      });
      if (response.ok) {
        setPartnerForm({ name: '', icon: '🤝' });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePartner = async (id) => {
    try {
      await fetch(`${API_BASE}/partners/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Banners Actions
  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.image) {
      alert('Please upload a banner image.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/banners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bannerForm)
      });
      if (response.ok) {
        setBannerForm({ image: '', title: '', subtitle: '' });
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Delete this banner slide?')) return;
    try {
      const response = await fetch(`${API_BASE}/banners/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (response.ok) fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Messages Inbox Actions
  const handleMarkMessageRead = async (id) => {
    try {
      await fetch(`${API_BASE}/messages/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: 'read' })
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete message submission?')) return;
    try {
      await fetch(`${API_BASE}/messages/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Menu Actions
  const handleDeleteMenu = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchAllData();
      } else {
        alert('Failed to delete menu item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMenu = async (e) => {
    e.preventDefault();
    const finalCategory = menuForm.category === 'Custom' ? menuForm.customCategory : menuForm.category;
    if (!finalCategory || !menuForm.title || !menuForm.description) {
      alert('Please fill out Category, Title, and Description.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          category: finalCategory,
          title: menuForm.title,
          description: menuForm.description,
          time: menuForm.time
        })
      });

      if (res.ok) {
        setMenuForm({
          category: 'Daily Meals',
          customCategory: '',
          title: '',
          description: '',
          time: ''
        });
        fetchAllData();
      } else {
        alert('Failed to add menu item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.username || !userForm.password) {
      setUserError('Username and password are required.');
      return;
    }
    setUserError('');
    setUserSuccess('');
    
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setUserSuccess('User account created successfully!');
        setUserForm({ username: '', password: '', role: 'staff' });
        fetchUsers();
      } else {
        const err = await res.json();
        setUserError(err.error || 'Failed to create user.');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setUserError('Network error. Failed to create user.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === 'user_admin') {
      alert('Cannot delete the primary administrator.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Network error. Failed to delete user.');
    }
  };

  // Statistics summaries
  const totalMenuItems = menu.length;
  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;

  if (loading && !settings) {
    return (
      <div className="admin-login-container">
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="animate-spin" size={32} style={{ color: '#C8953A', animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#8d8d9b' }}>Loading dashboard assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* ── SIDEBAR NAV ── */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <span>Caring Hands</span>
          </div>
          <span className="admin-sidebar-tag">Portal Admin</span>
        </div>
        <div className="admin-nav">
          {hasAccess('overview') && (
            <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
          )}
          {hasAccess('events') && (
            <button className={`admin-nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
              <Calendar size={18} />
              <span>Manage Events</span>
            </button>
          )}
          {hasAccess('gallery') && (
            <button className={`admin-nav-item ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
              <ImageIcon size={18} />
              <span>Manage Gallery</span>
            </button>
          )}
          {hasAccess('banners') && (
            <button className={`admin-nav-item ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => setActiveTab('banners')}>
              <Images size={18} />
              <span>Manage Banners</span>
            </button>
          )}
          {hasAccess('partners') && (
            <button className={`admin-nav-item ${activeTab === 'partners' ? 'active' : ''}`} onClick={() => setActiveTab('partners')}>
              <Users size={18} />
              <span>Manage Sponsors</span>
            </button>
          )}
          {hasAccess('messages') && (
            <button className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              <Mail size={18} />
              <span>Inquiry Messages {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</span>
            </button>
          )}
          {hasAccess('menu') && (
            <button className={`admin-nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
              <Heart size={18} />
              <span>Care &amp; Menu</span>
            </button>
          )}
          {hasAccess('users') && (
            <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              <Users size={18} />
              <span>Users Manager</span>
            </button>
          )}
          {hasAccess('settings') && (
            <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={18} />
              <span>Web Settings</span>
            </button>
          )}
        </div>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="admin-main-content">
        <div className="admin-header">
          <div>
            <h1>Dashboard Management</h1>
            <p>Welcome back, {role === 'admin' ? 'Administrator' : (role === 'staff' ? 'Staff Caregiver' : 'Volunteer Coordinator')}. Update website content on the fly.</p>
          </div>
          <div className="admin-user-pill">
            <div className="admin-user-avatar" style={{
              background: role === 'admin' ? 'var(--primary)' : (role === 'staff' ? 'var(--gold)' : 'var(--green-logo)')
            }}>
              {role.charAt(0).toUpperCase()}
            </div>
            <span className="admin-user-name" style={{ textTransform: 'capitalize' }}>{role} Portal</span>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <span className="admin-stat-title">Care &amp; Routine Items</span>
                  <div className="admin-stat-icon-wrap"><Heart size={18} /></div>
                </div>
                <span className="admin-stat-val">{totalMenuItems}</span>
                <span className="admin-stat-footer">✓ Dynamic care routine programs</span>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <span className="admin-stat-title">Active Events</span>
                  <div className="admin-stat-icon-wrap"><Calendar size={18} /></div>
                </div>
                <span className="admin-stat-val">{events.length}</span>
                <span className="admin-stat-footer">Dynamic marquee feeds</span>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <span className="admin-stat-title">Unread Mail</span>
                  <div className="admin-stat-icon-wrap"><Mail size={18} /></div>
                </div>
                <span className="admin-stat-val">{unreadMessagesCount}</span>
                <span className="admin-stat-footer">Requires review</span>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-header">
                  <span className="admin-stat-title">Elders Aided</span>
                  <div className="admin-stat-icon-wrap"><Users size={18} /></div>
                </div>
                <span className="admin-stat-val">{settings?.stats?.eldersCaredFor || 0}</span>
                <span className="admin-stat-footer">Home counter total</span>
              </div>
            </div>

            {/* Quick Summary Tables */}
            <div className="admin-split-grid">
              <div className="admin-panel">
                <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Recent Message Submissions</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender Name</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.slice(0, 4).map(msg => (
                        <tr key={msg.id}>
                          <td>{msg.name}</td>
                          <td>{msg.purpose}</td>
                          <td>
                            <span className={`admin-badge ${msg.status === 'unread' ? 'admin-badge-unread' : 'admin-badge-read'}`}>
                              {msg.status}
                            </span>
                          </td>
                          <td>
                            <button className="admin-action-btn" onClick={() => { setSelectedItem(msg); setModalType('message_view'); }}><Eye size={14} /></button>
                            {msg.status === 'unread' && (
                              <button className="admin-action-btn" onClick={() => handleMarkMessageRead(msg.id)} style={{ color: '#5eff8b' }}><Check size={14} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {messages.length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#8d8d9b' }}>Inbox is clean!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-panel">
                <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Care Menu Items</h3>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menu.slice(0, 5).map(item => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td style={{ color: '#C8953A', fontWeight: '700' }}>{item.category}</td>
                        </tr>
                      ))}
                      {menu.length === 0 && (
                        <tr><td colSpan="2" style={{ textAlign: 'center', color: '#8d8d9b' }}>No items seeded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── EVENTS TAB ── */}
        {activeTab === 'events' && (
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">Active NGO Programs & Events</h3>
              <button className="admin-btn-primary" onClick={() => {
                setEventForm({ title: '', description: '', time: '', location: '', day: '', month: '', category: 'Upcoming', image: '/images/event_1.png' });
                setModalType('event_add');
              }}>
                <Plus size={16} /> Add Program
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Event Info</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}>
                      <td><strong style={{ color: '#C8953A' }}>{ev.day} {ev.month}</strong></td>
                      <td>
                        <strong>{ev.title}</strong>
                        <p style={{ fontSize: '0.8rem', color: '#8d8d9b', marginTop: '0.2rem' }}>
                          {ev.description.substring(0, 75)}...
                        </p>
                      </td>
                      <td>
                        <span className={`admin-badge ${ev.category.toLowerCase() === 'ongoing' ? 'admin-badge-read' : 'admin-badge-unread'}`}>
                          {ev.category}
                        </span>
                      </td>
                      <td>{ev.location}</td>
                      <td>
                        <button className="admin-action-btn" onClick={() => {
                          setSelectedItem(ev);
                          setEventForm(ev);
                          setModalType('event_edit');
                        }}><Edit size={14} /></button>
                        <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleDeleteEvent(ev.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <>
            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Publish New Photo Story</h3>
              <form onSubmit={handleAddGallery} className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Photo Caption</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Joyful Gardening Session"
                    value={galleryForm.caption}
                    onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Primary Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-control"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        setGalleryForm({ ...galleryForm, image: url });
                      }
                    }}
                  />
                  {uploading && <div style={{ color: '#C8953A', fontSize: '0.8rem', marginTop: '0.3rem' }}>Uploading image...</div>}
                  {!uploading && galleryForm.image && (
                    <div style={{ marginTop: '0.5rem', color: '#5eff8b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={14} /> Image ready
                    </div>
                  )}
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: '#fff' }}>Additional Grid Photos (Multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="admin-form-control"
                    disabled={uploading}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      const urls = [];
                      for (const file of files) {
                        const url = await handleFileUpload(file);
                        if (url) urls.push(url);
                      }
                      if (urls.length > 0) {
                        setGalleryForm(prev => ({
                          ...prev,
                          subImages: [...prev.subImages, ...urls]
                        }));
                      }
                    }}
                  />
                  {galleryForm.subImages && galleryForm.subImages.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                      {galleryForm.subImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => {
                              setGalleryForm(prev => ({
                                ...prev,
                                subImages: prev.subImages.filter((_, idx) => idx !== i)
                              }));
                            }}
                            style={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: '#ff5f5f',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                  <button type="submit" className="admin-btn-primary" style={{ display: 'inline-flex' }}>Add Photo Story</button>
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Gallery Grid</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                {gallery.map(item => (
                  <div key={item.id} style={{ position: 'relative', border: '1px solid var(--dark-border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={item.image.startsWith('http') || item.image.startsWith('/') ? item.image : `/${item.image}`} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    <div style={{ padding: '0.8rem', fontSize: '0.8rem' }}>
                      <p style={{ fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.caption}</p>
                      <button
                        className="admin-action-btn admin-action-btn-delete"
                        style={{ marginTop: '0.5rem', width: '100%', display: 'flex', gap: '0.3rem', height: 'auto', padding: '0.4rem' }}
                        onClick={() => handleDeleteGallery(item.id)}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PARTNERS TAB ── */}
        {activeTab === 'partners' && (
          <>
            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Add Trust Sponsor</h3>
              <form onSubmit={handleAddPartner}>
                <div className="admin-grid-2" style={{ gap: '2rem' }}>
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Organisation Name</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. WHO India"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Sponsor Logo / Image</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--dark-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        overflow: 'hidden'
                      }}>
                        {partnerForm.icon && (partnerForm.icon.startsWith('http') || partnerForm.icon.startsWith('/') || partnerForm.icon.startsWith('data:')) ? (
                          <img src={partnerForm.icon} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          partnerForm.icon || '🤝'
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="file"
                          accept="image/*"
                          id="partner-file-upload"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = await handleFileUpload(file);
                              if (url) {
                                setPartnerForm(prev => ({ ...prev, icon: url }));
                              }
                            }
                          }}
                        />
                        <label
                          htmlFor="partner-file-upload"
                          className="admin-btn-secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            border: '1px solid var(--dark-border)',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}
                        >
                          Upload Logo Image
                        </label>
                        <button
                          type="button"
                          className="admin-btn-ghost"
                          style={{ marginLeft: '1rem', color: '#b5232a', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          onClick={() => setPartnerForm(prev => ({ ...prev, icon: '🤝' }))}
                        >
                          Reset to Emoji
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                  <button type="submit" className="admin-btn-primary">Add Sponsor</button>
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Active Sponsor List</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Icon / Logo</th>
                      <th>Sponsor Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map(p => (
                      <tr key={p.id}>
                        <td>
                          {p.icon && (p.icon.startsWith('http') || p.icon.startsWith('/') || p.icon.startsWith('data:')) ? (
                            <img src={p.icon} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' }} />
                          ) : (
                            p.icon || '🤝'
                          )}
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td>
                          <button type="button" className="admin-action-btn admin-action-btn-delete" onClick={() => handleDeletePartner(p.id)}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── BANNERS TAB ── */}
        {activeTab === 'banners' && (
          <>
            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Upload Homepage Banner Slide</h3>
              <form onSubmit={handleAddBanner} className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Slide Title (Optional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Hope, Health & Dignity"
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Slide Subtitle (Optional)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Caring Hands uplifts our beloved elders"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  />
                </div>
                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: '#fff' }}>Upload Banner Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-control"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        setBannerForm({ ...bannerForm, image: url });
                      }
                    }}
                  />
                  {uploading && <div style={{ color: '#C8953A', fontSize: '0.8rem', marginTop: '0.3rem' }}>Uploading slide to server...</div>}
                  {!uploading && bannerForm.image && (
                    <div style={{ marginTop: '0.5rem', color: '#5eff8b', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={14} /> Image ready: {bannerForm.image}
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                  <button type="submit" className="admin-btn-primary" style={{ display: 'inline-flex' }}>Add Banner Slide</button>
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Active Hero Slides</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {banners.map((item, index) => (
                  <div key={item.id} style={{ position: 'relative', border: '1px solid var(--dark-border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--card-bg)' }}>
                    <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <div style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#C8953A', fontWeight: 'bold' }}>Slide #{index + 1}</span>
                      <h4 style={{ margin: '0.3rem 0', color: '#fff', fontSize: '1rem' }}>{item.title || '(No Title)'}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#8d8d9b' }}>{item.subtitle || '(No Subtitle)'}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleDeleteBanner(item.id)}
                      style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: 'rgba(239, 68, 68, 0.9)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                      title="Delete Slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {banners.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#8d8d9b', border: '1px dashed var(--dark-border)', borderRadius: '12px' }}>
                    No banner slides configured. The homepage will fallback to the default static hero image.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── MESSAGES TAB ── */}
        {activeTab === 'messages' && (
          <div className="admin-panel">
            <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>User Inquiries Inbox</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sender</th>
                    <th>Subject/Purpose</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id}>
                      <td>{new Date(msg.createdAt).toLocaleString()}</td>
                      <td>
                        <strong>{msg.name}</strong>
                        <p style={{ fontSize: '0.8rem', color: '#8d8d9b' }}>{msg.email}</p>
                      </td>
                      <td>{msg.purpose}</td>
                      <td>
                        <span className={`admin-badge ${msg.status === 'unread' ? 'admin-badge-unread' : 'admin-badge-read'}`}>
                          {msg.status}
                        </span>
                      </td>
                      <td>
                        <button className="admin-action-btn" onClick={() => { setSelectedItem(msg); setModalType('message_view'); }}><Eye size={14} /></button>
                        {msg.status === 'unread' && (
                          <button className="admin-action-btn" onClick={() => handleMarkMessageRead(msg.id)} style={{ color: '#5eff8b' }}><Check size={14} /></button>
                        )}
                        <button className="admin-action-btn admin-action-btn-delete" onClick={() => handleDeleteMessage(msg.id)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', color: '#8d8d9b' }}>Inbox is empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CARE MENU TAB ── */}
        {activeTab === 'menu' && (
          <div className="admin-grid-2" style={{ gap: '2rem' }}>
            {/* Add menu item form */}
            <div className="admin-panel">
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Add Care / Menu Offering</h3>
              <form onSubmit={handleAddMenu}>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Offering Category</label>
                  <select
                    className="admin-form-control"
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  >
                    <option value="Daily Meals">Daily Meals</option>
                    <option value="Medical Care">Medical Care</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Custom">Custom Category...</option>
                  </select>
                </div>

                {menuForm.category === 'Custom' && (
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Custom Category Name</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. Spiritual Care"
                      value={menuForm.customCategory}
                      onChange={(e) => setMenuForm({ ...menuForm, customCategory: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Offering Title</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Physiotherapy Sessions"
                    value={menuForm.title}
                    onChange={(e) => setMenuForm({ ...menuForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Schedule / Time Slot</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Every Monday &amp; Wednesday"
                    value={menuForm.time}
                    onChange={(e) => setMenuForm({ ...menuForm, time: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Description</label>
                  <textarea
                    className="admin-form-control"
                    style={{ minHeight: '100px' }}
                    placeholder="Provide a detailed description of the menu item or program..."
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="admin-btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  <Plus size={16} /> Add to Care Menu
                </button>
              </form>
            </div>

            {/* List of menu items */}
            <div className="admin-panel" style={{ overflowX: 'auto' }}>
              <h3 className="admin-panel-title" style={{ marginBottom: '1.5rem' }}>Active Care Offerings</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Title</th>
                      <th>Schedule</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menu.map((item) => (
                      <tr key={item.id}>
                        <td><span className="admin-badge admin-badge-read">{item.category}</span></td>
                        <td><strong>{item.title}</strong></td>
                        <td style={{ fontSize: '0.85rem' }}>{item.time || 'N/A'}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-action-btn admin-action-btn-delete"
                            onClick={() => handleDeleteMenu(item.id)}
                            title="Delete Offering"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {menu.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', color: '#8d8d9b', padding: '2rem' }}>
                          No offerings set up. The homepage will fall back to defaults.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && settings && (
          <div className="admin-panel">
            <h3 className="admin-panel-title" style={{ marginBottom: '1.8rem' }}>Website General Content Settings</h3>
            <form onSubmit={handleUpdateSettings}>
              
              <h4 style={{ color: '#C8953A', marginBottom: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.4rem' }}>Hero Banner Content</h4>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Title First Line (Regular)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.heroTitleLine1}
                    onChange={(e) => setSettings({ ...settings, heroTitleLine1: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Title Second Line (Italic Accent)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.heroTitleLine2}
                    onChange={(e) => setSettings({ ...settings, heroTitleLine2: e.target.value })}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#fff' }}>Hero Subtitle Paragraph</label>
                <textarea
                  className="admin-form-control"
                  value={settings.heroSubtitle}
                  onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                />
              </div>

              <h4 style={{ color: '#C8953A', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.4rem' }}>Hero Banner & Logo Media</h4>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Hero Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-control"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        setSettings({ ...settings, heroImage: url });
                      }
                    }}
                  />
                  {uploading && <div style={{ color: '#C8953A', fontSize: '0.8rem', marginTop: '0.3rem' }}>Uploading...</div>}
                  {settings.heroImage && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={settings.heroImage} alt="Hero Banner Preview" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ color: '#8d8d9b', fontSize: '0.75rem' }}>Current Image</span>
                    </div>
                  )}
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Logo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-control"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      const url = await handleFileUpload(file);
                      if (url) {
                        setSettings({ ...settings, logoImage: url });
                      }
                    }}
                  />
                  {uploading && <div style={{ color: '#C8953A', fontSize: '0.8rem', marginTop: '0.3rem' }}>Uploading...</div>}
                  {settings.logoImage && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={settings.logoImage} alt="Logo Preview" style={{ height: '30px', objectFit: 'contain', borderRadius: '4px', background: '#222', padding: '2px' }} />
                      <span style={{ color: '#8d8d9b', fontSize: '0.75rem' }}>Current Logo</span>
                    </div>
                  )}
                </div>
              </div>

              <h4 style={{ color: '#C8953A', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.4rem' }}>Homepage Stat Counters</h4>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Elders Cared For</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={settings.stats.eldersCaredFor}
                    onChange={(e) => setSettings({
                      ...settings,
                      stats: { ...settings.stats, eldersCaredFor: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Years of Service</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={settings.stats.yearsOfService}
                    onChange={(e) => setSettings({
                      ...settings,
                      stats: { ...settings.stats, yearsOfService: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Volunteers Counter</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={settings.stats.volunteers}
                    onChange={(e) => setSettings({
                      ...settings,
                      stats: { ...settings.stats, volunteers: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Events Organised</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={settings.stats.eventsOrganised}
                    onChange={(e) => setSettings({
                      ...settings,
                      stats: { ...settings.stats, eventsOrganised: parseInt(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>

              <h4 style={{ color: '#C8953A', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '0.4rem' }}>Office Contact Info</h4>
              <div className="admin-form-group">
                <label style={{ color: '#fff' }}>Postal Address</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.contact.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    contact: { ...settings.contact, address: e.target.value }
                  })}
                />
              </div>
              <div className="admin-grid-2">
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Help Desk Phone</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={settings.contact.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="admin-form-group">
                  <label style={{ color: '#fff' }}>Help Desk Email</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={settings.contact.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      contact: { ...settings.contact, email: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label style={{ color: '#fff' }}>Office Working Hours</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={settings.contact.officeHours}
                  onChange={(e) => setSettings({
                    ...settings,
                    contact: { ...settings.contact, officeHours: e.target.value }
                  })}
                />
              </div>

              <div style={{ marginTop: '2.5rem', textAlign: 'right' }}>
                <button type="submit" className="admin-btn-primary" style={{ padding: '0.9rem 2.5rem' }}>
                  Save All Modifications
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'users' && role === 'admin' && (
          <div className="admin-panel">
            <h3 className="admin-panel-title" style={{ marginBottom: '0.5rem' }}>Users Manager</h3>
            <p style={{ color: '#8d8d9b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Manage login profiles, credentials, and roles for NGO administrators, caregivers, and coordinators.
            </p>

            <div className="admin-split-grid">
              {/* Users List */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--dark-border)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#C8953A', marginBottom: '1.2rem', fontWeight: '600' }}>Active Users</h4>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Access Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.username}</strong></td>
                          <td><span style={{ fontFamily: 'monospace', color: '#8d8d9b' }}>{u.password}</span></td>
                          <td>
                            <span className="admin-badge" style={{
                              background: u.role === 'admin' ? 'rgba(181, 35, 42, 0.15)' : (u.role === 'staff' ? 'rgba(200, 149, 58, 0.15)' : 'rgba(42, 173, 90, 0.15)'),
                              color: u.role === 'admin' ? 'var(--primary)' : (u.role === 'staff' ? 'var(--gold)' : 'var(--green-logo)'),
                              border: 'none',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: '700',
                              textTransform: 'uppercase'
                            }}>
                              {u.role === 'admin' ? 'Administrator' : (u.role === 'staff' ? 'Staff Caregiver' : 'Coordinator')}
                            </span>
                          </td>
                          <td>
                            {u.id !== 'user_admin' ? (
                              <button 
                                className="admin-action-btn admin-action-btn-delete"
                                onClick={() => handleDeleteUser(u.id)}
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#8d8d9b', fontStyle: 'italic' }}>System</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add User Form */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--dark-border)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <h4 style={{ color: '#C8953A', marginBottom: '1.2rem', fontWeight: '600' }}>Create New Profile</h4>
                
                {userError && (
                  <div style={{ padding: '0.8rem 1rem', background: 'rgba(181, 35, 42, 0.15)', border: '1px solid var(--primary)', borderRadius: '8px', color: 'var(--primary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    {userError}
                  </div>
                )}
                {userSuccess && (
                  <div style={{ padding: '0.8rem 1rem', background: 'rgba(42, 173, 90, 0.15)', border: '1px solid var(--green-logo)', borderRadius: '8px', color: 'var(--green-logo)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                    {userSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveUser}>
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Login Username</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      placeholder="e.g. john_caregiver"
                      required
                      value={userForm.username}
                      onChange={e => setUserForm({ ...userForm, username: e.target.value.trim() })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Login Password</label>
                    <input
                      type="password"
                      className="admin-form-control"
                      placeholder="e.g. pass123"
                      required
                      value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label style={{ color: '#fff' }}>Access Role Mapping</label>
                    <select
                      className="admin-form-control"
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      style={{ background: '#111', color: '#fff' }}
                    >
                      <option value="admin">Administrator (Full Access)</option>
                      <option value="staff">Staff Caregiver (Daily Menus, Gallery, Banners)</option>
                      <option value="volunteer">Volunteer Coordinator (Events, Inquiry Inbox)</option>
                    </select>
                  </div>

                  <button type="submit" className="admin-btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Create User Account
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ADMIN MODALS ── */}

      {/* Add / Edit Event Modal */}
      {(modalType === 'event_add' || modalType === 'event_edit') && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modalType === 'event_add' ? 'Add NGO Program' : 'Edit NGO Program'}</h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEvent}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Program Title</label>
                  <input type="text" className="admin-form-control" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Short Description</label>
                  <textarea className="admin-form-control" required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                </div>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Event Date (Day Number)</label>
                    <input type="text" className="admin-form-control" placeholder="e.g. 12" required value={eventForm.day} onChange={e => setEventForm({ ...eventForm, day: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label>Event Month (3-Letter)</label>
                    <input type="text" className="admin-form-control" placeholder="e.g. Aug" required value={eventForm.month} onChange={e => setEventForm({ ...eventForm, month: e.target.value })} />
                  </div>
                </div>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Time / Frequency</label>
                    <input type="text" className="admin-form-control" placeholder="e.g. 9:00 AM – 2:00 PM" value={eventForm.time} onChange={e => setEventForm({ ...eventForm, time: e.target.value })} />
                  </div>
                  <div className="admin-form-group">
                    <label>Location Wing</label>
                    <input type="text" className="admin-form-control" placeholder="e.g. Medical Wing" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                  </div>
                </div>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label>Program Category</label>
                    <select className="admin-form-control" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Thumbnail Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="admin-form-control"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        const url = await handleFileUpload(file);
                        if (url) {
                          setEventForm({ ...eventForm, image: url });
                        }
                      }}
                    />
                    {uploading && <div style={{ color: '#C8953A', fontSize: '0.8rem', marginTop: '0.3rem' }}>Uploading image...</div>}
                    {!uploading && eventForm.image && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={eventForm.image} alt="Event Preview" style={{ width: '50px', height: '30px', objectFit: 'cover', borderRadius: '4px' }} />
                        <span style={{ color: '#5eff8b', fontSize: '0.8rem' }}>✓ Loaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Program</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View message submission Modal */}
      {modalType === 'message_view' && selectedItem && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Inquiry Detail</h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ marginBottom: '1.5rem', background: '#111116', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--dark-border)' }}>
                <p><strong>From:</strong> {selectedItem.name} ({selectedItem.email})</p>
                <p><strong>Phone:</strong> {selectedItem.phone || 'Not provided'}</p>
                <p><strong>Purpose:</strong> {selectedItem.purpose}</p>
                <p><strong>Date:</strong> {new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
              <h4 style={{ color: '#C8953A', marginBottom: '0.5rem' }}>Message:</h4>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#dedee2' }}>{selectedItem.message}</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setModalType(null)}>Close</button>
              {selectedItem.status === 'unread' && (
                <button className="admin-btn-primary" onClick={() => { handleMarkMessageRead(selectedItem.id); setModalType(null); }}>
                  <Check size={16} /> Mark as Read
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
