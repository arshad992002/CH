const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const DATA_DIR = path.join(__dirname, 'data');

// In-memory cache for synchronous operations
let cache = {
  settings: {},
  events: [],
  gallery: [],
  partners: [],
  messages: [],
  donations: [],
  banners: [],
  menu: [],
  users: []
};

// Supabase Credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_API_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  console.log('Supabase credentials detected. Connecting to Supabase...');
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    loadFromSupabase();
  } catch (err) {
    console.error('Failed to initialize Supabase client, falling back to local JSON:', err);
    loadFromJson();
  }
} else {
  console.log('Supabase credentials not set. Using local JSON files.');
  loadFromJson();
}

function loadFromJson() {
  cache.settings = readJsonFile('settings.json', {});
  cache.events = readJsonFile('events.json', []);
  cache.gallery = readJsonFile('gallery.json', []);
  cache.partners = readJsonFile('partners.json', []);
  cache.messages = readJsonFile('messages.json', []);
  cache.donations = readJsonFile('donations.json', []);
  cache.banners = readJsonFile('banners.json', []);
  cache.menu = readJsonFile('menu.json', []);
  cache.users = readJsonFile('users.json', []);
}

function readJsonFile(fileName, defaultValue) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || JSON.stringify(defaultValue));
  } catch (err) {
    return defaultValue;
  }
}

function writeJsonFile(fileName, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(path.join(DATA_DIR, fileName), JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving ${fileName} to JSON:`, err);
  }
}

async function loadFromSupabase() {
  try {
    // Attempt to select from charity_store table
    const { data, error } = await supabase
      .from('charity_store')
      .select('*');

    if (error) {
      console.warn('Table "charity_store" not found or error. Attempting to seed data to Supabase...', error.message);
      console.warn('Please make sure you have created a table named "charity_store" in your Supabase SQL Editor.');
      loadFromJson();
      
      // Attempt to seed initial values (will succeed if table is created later)
      const keys = ['settings', 'events', 'gallery', 'partners', 'messages', 'donations', 'banners', 'menu', 'users'];
      for (const key of keys) {
        const fileDefault = key === 'settings' ? 'settings.json' : `${key}.json`;
        const defaultVal = key === 'settings' ? {} : [];
        const localData = readJsonFile(fileDefault, defaultVal);
        await saveToSupabase(key, localData);
      }
      return;
    }

    // Populate cache with data from Supabase
    const dbData = {};
    data.forEach(row => {
      dbData[row.key_name] = row.data_content;
    });

    const keys = ['settings', 'events', 'gallery', 'partners', 'messages', 'donations', 'banners', 'menu', 'users'];
    for (const key of keys) {
      if (dbData[key] !== undefined) {
        cache[key] = dbData[key];
      } else {
        const fileDefault = key === 'settings' ? 'settings.json' : `${key}.json`;
        const defaultVal = key === 'settings' ? {} : [];
        cache[key] = readJsonFile(fileDefault, defaultVal);
        await saveToSupabase(key, cache[key]);
      }
    }
    console.log('Supabase data successfully loaded and cached.');
  } catch (err) {
    console.error('Error synchronizing data with Supabase, using cached values:', err);
    loadFromJson();
  }
}

async function saveToSupabase(key, data) {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('charity_store')
      .upsert({ key_name: key, data_content: data });

    if (error) {
      console.error(`Error saving ${key} to Supabase:`, error.message);
    }
  } catch (err) {
    console.error(`Error writing ${key} to Supabase:`, err);
  }
}

module.exports = {
  getSettings: () => cache.settings,
  saveSettings: (data) => {
    cache.settings = data;
    writeJsonFile('settings.json', data);
    saveToSupabase('settings', data);
    return data;
  },
  
  getEvents: () => cache.events,
  saveEvents: (data) => {
    cache.events = data;
    writeJsonFile('events.json', data);
    saveToSupabase('events', data);
    return data;
  },
  
  getGallery: () => cache.gallery,
  saveGallery: (data) => {
    cache.gallery = data;
    writeJsonFile('gallery.json', data);
    saveToSupabase('gallery', data);
    return data;
  },
  
  getPartners: () => cache.partners,
  savePartners: (data) => {
    cache.partners = data;
    writeJsonFile('partners.json', data);
    saveToSupabase('partners', data);
    return data;
  },
  
  getMessages: () => cache.messages,
  saveMessages: (data) => {
    cache.messages = data;
    writeJsonFile('messages.json', data);
    saveToSupabase('messages', data);
    return data;
  },
  
  getDonations: () => cache.donations,
  saveDonations: (data) => {
    cache.donations = data;
    writeJsonFile('donations.json', data);
    saveToSupabase('donations', data);
    return data;
  },
  
  getBanners: () => cache.banners,
  saveBanners: (data) => {
    cache.banners = data;
    writeJsonFile('banners.json', data);
    saveToSupabase('banners', data);
    return data;
  },

  getMenu: () => cache.menu,
  saveMenu: (data) => {
    cache.menu = data;
    writeJsonFile('menu.json', data);
    saveToSupabase('menu', data);
    return data;
  },

  getUsers: () => cache.users || [],
  saveUsers: (data) => {
    cache.users = data;
    writeJsonFile('users.json', data);
    saveToSupabase('users', data);
    return data;
  },
  getSupabase: () => supabase
};
