import React, { useState, useEffect } from 'react';
import CustomCursor from '../components/CustomCursor';
import { Heart, ChevronRight, ArrowLeft, Calendar, ShieldCheck, Mail, MapPin, Phone, Clock } from 'lucide-react';

const API_BASE = '/api';

const MenuPage = ({ onNavigateToAdmin }) => {
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Nav scroll state
  const [navSolid, setNavSolid] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_BASE}/menu`);
      if (res.ok) {
        const data = await res.json();
        setMenu(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
      // Seeded offline fallback
      setMenu([
        { id: '1', category: 'Daily Meals', title: 'Nutritious Morning Breakfast', description: 'Freshly prepared Ragi porridge, idlis, and seasonal fruits designed for digestive health.', time: '08:30 AM' },
        { id: '2', category: 'Daily Meals', title: 'Wholesome Vegetarian Lunch', description: 'Steamed brown rice, mixed dal, seasonal sabzi, curd, and high-protein salad.', time: '01:00 PM' },
        { id: '3', category: 'Medical Care', title: 'Geriatric Health Checkup', description: 'Routine BP, blood sugar tracking, and medication audits supervised by our staff nurse.', time: '10:00 AM' },
        { id: '4', category: 'Medical Care', title: 'Physiotherapy & Mobility', description: 'Assisted movement sessions, joint exercises, and muscle strengthening drills.', time: '04:00 PM' },
        { id: '5', category: 'Recreation', title: 'Satsang & Devotional Music', description: 'Evening community gatherings for peaceful prayers, light bhajans, and storytelling.', time: '05:30 PM' },
        { id: '6', category: 'Recreation', title: 'Interactive Board Games', description: 'Brain exercises, chess, carrom, and laughter clubs for cognitive stimulation.', time: '11:00 AM' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menu.map(item => item.category))];

  const filteredMenu = activeTab === 'all' 
    ? menu 
    : menu.filter(item => item.category === activeTab);

  return (
    <>
      <CustomCursor />
      
      {/* ── NAVIGATION BAR ── */}
      <nav className="solid">
        <a className="nav-logo" href="#">
          <img src="/images/logo.png" alt="Caring Hands" className="nav-logo-img" onError={(e) => {
            e.target.src = 'https://placehold.co/180x80/b5232a/white?text=Caring+Hands';
          }} />
        </a>
        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li><a href="#" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
          <li><a href="#menu-page" className="active" onClick={() => setMobileMenuOpen(false)}>Daily Care</a></li>
          <li><a href="#events-page" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
          <li><a href="#gallery-page" onClick={() => setMobileMenuOpen(false)}>Gallery</a></li>
          <li><a href="/#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          <a href="/#contact" className="nav-donate">Contact Us ✦</a>
          <button className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── HEADER HERO ── */}
      <header className="hero" style={{ height: '55vh', minHeight: '400px' }}>
        <div className="hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1920" 
            alt="Meals" 
            className="hero-img active" 
            style={{ filter: 'brightness(0.55)' }}
          />
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content" style={{ marginTop: '0px' }}>
          <div className="hero-eyebrow" style={{ borderColor: 'var(--gold-lt)', color: 'var(--gold-lt)' }}>
            <span className="eyebrow-dot" style={{ backgroundColor: 'var(--gold-lt)' }}></span>
            Daily Routines &amp; Happiness
          </div>
          <h1 className="hero-h1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Daily Care &amp; <span className="italic">Nutritional Menus</span>
          </h1>
          <p className="hero-p" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Explore our curated meal routines, professional geriatric healthcare tracking, and recreational program calendars.
          </p>
        </div>
      </header>

      {/* ── BACK BUTTON & TAB FILTERS ── */}
      <main className="menu-section" style={{ padding: '5rem 6vw' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <a href="#" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.95rem',
            marginBottom: '3rem',
            transition: 'transform 0.2s'
          }} className="menu-inquire-link">
            <ArrowLeft size={16} /> Back to Homepage
          </a>

          {/* Categories Tab Selector */}
          <div className="menu-tabs-container">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`menu-tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
                style={{ textTransform: 'capitalize' }}
              >
                {cat === 'all' ? 'All Activities' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>
              <p>Loading care offerings...</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map((item) => (
                <div className="menu-card reveal up" key={item.id}>
                  <div className="menu-card-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <span className="menu-card-time">
                        <Clock size={12} style={{ marginRight: '0.4rem', verticalAlign: 'middle', marginTop: '-2px' }} />
                        {item.time || 'All Day'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-dk)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                        {item.category}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="menu-card-desc">{item.description}</p>
                  </div>
                  <div className="menu-card-footer">
                    <span className="menu-heart-icon">
                      <Heart size={14} fill="var(--primary)" style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      Nutritionally Audited
                    </span>
                    <a 
                      href="/#contact" 
                      className="menu-inquire-link"
                    >
                      Inquire Details <ChevronRight size={14} style={{ marginLeft: '0.2rem' }} />
                    </a>
                  </div>
                </div>
              ))}
              {filteredMenu.length === 0 && (
                <div className="menu-empty-state">
                  <p>No offerings found under this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div className="footer-col">
            <img src="/images/logo.png" alt="Logo" className="footer-logo-img" onError={(e) => {
              e.target.src = 'https://placehold.co/180x80/b5232a/white?text=Caring+Hands';
            }} />
            <p className="footer-desc">
              Providing holistic care, nutritional support, and a peaceful sanctuary for our elderly citizens to age with dignity and grace.
            </p>
          </div>
          <div className="footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#menu-page">Daily Care</a></li>
              <li><a href="#events-page">Events</a></li>
              <li><a href="#gallery-page">Gallery</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Office Hours</h5>
            <ul style={{ color: '#8d8d9b', fontSize: '0.92rem' }}>
              <li>Monday – Saturday</li>
              <li>9:00 AM – 6:00 PM IST</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Contact Details</h5>
            <ul style={{ color: '#8d8d9b', fontSize: '0.92rem', gap: '0.7rem' }}>
              <li><Phone size={14} style={{ marginRight: '0.4rem' }} /> +91 95020 51489</li>
              <li><Mail size={14} style={{ marginRight: '0.4rem' }} /> info@caringhands.in</li>
              <li><MapPin size={14} style={{ marginRight: '0.4rem' }} /> Hyderabad, Telangana</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Caring Hands Charitable Trust. All Rights Reserved.</span>
          <div className="footer-trust">
            <span>Reg. NGO</span>
            <span>80G Tax Exemption</span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default MenuPage;
