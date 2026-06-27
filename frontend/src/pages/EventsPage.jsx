import React, { useState, useEffect } from 'react';
import CustomCursor from '../components/CustomCursor';
import { Calendar, MapPin, Clock, ArrowLeft, ChevronRight, Phone, Mail } from 'lucide-react';

const API_BASE = '/api';

const EventsPage = ({ onNavigateToAdmin }) => {
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      // Seeded offline fallback
      setEvents([
        { id: '1', title: 'Monthly Free Health Diagnostic Camp', description: 'Comprehensive medical screening, diabetes checkup, and geriatric eye tests for rural elders.', day: '18', month: 'Jul', time: '09:00 AM - 03:00 PM', location: 'NGO Main Hall', category: 'Upcoming', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600' },
        { id: '2', title: 'Monsoon Care Blanket & Clothes Drive', description: 'Distributing warm blankets, woollens, and sanitization kits to shelterless seniors.', day: '25', month: 'Jun', time: '11:00 AM onwards', location: 'Secunderabad Basti', category: 'Ongoing', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600' },
        { id: '3', title: 'Joy of Art: Water Colour Workshop', description: 'An interactive painting and sketch session to boost creativity and fine motor skills.', day: '12', month: 'Jun', time: '10:30 AM', location: 'Recreation Lounge', category: 'Completed', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(e => e.category.toLowerCase() === activeFilter.toLowerCase());

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
          <li><a href="#menu-page" onClick={() => setMobileMenuOpen(false)}>Daily Care</a></li>
          <li><a href="#events-page" className="active" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
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

      {/* ── HERO HEADER ── */}
      <header className="hero" style={{ height: '55vh', minHeight: '400px' }}>
        <div className="hero-bg">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1920" 
            alt="Events Banner" 
            className="hero-img active" 
            style={{ filter: 'brightness(0.55)' }}
          />
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow" style={{ borderColor: 'var(--gold-lt)', color: 'var(--gold-lt)' }}>
            <span className="eyebrow-dot" style={{ backgroundColor: 'var(--gold-lt)' }}></span>
            Caring Hands Initiatives
          </div>
          <h1 className="hero-h1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            NGO Programs &amp; <span className="italic">Support Drives</span>
          </h1>
          <p className="hero-p" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Check out what is happening next at Caring Hands, or volunteer for our ongoing elder care programs.
          </p>
        </div>
      </header>

      {/* ── EVENTS LISTING ── */}
      <main className="events-section" style={{ padding: '5rem 6vw' }}>
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

          {/* Filter tabs */}
          <div className="menu-tabs-container">
            <button className={`menu-tab-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
              All Campaigns
            </button>
            <button className={`menu-tab-btn ${activeFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveFilter('upcoming')}>
              Upcoming
            </button>
            <button className={`menu-tab-btn ${activeFilter === 'ongoing' ? 'active' : ''}`} onClick={() => setActiveFilter('ongoing')}>
              Ongoing
            </button>
            <button className={`menu-tab-btn ${activeFilter === 'completed' ? 'active' : ''}`} onClick={() => setActiveFilter('completed')}>
              Completed
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>
              <p>Loading programs...</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <div className="event-card reveal up" key={event.id}>
                  <div className="ev-img-wrap">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600';
                      }}
                    />
                    <span className={`ev-cat ${event.category.toLowerCase() === 'ongoing' ? 'ev-ongoing' : ''}`}>
                      {event.category}
                    </span>
                    <div className="ev-date">
                      <span className="ev-day">{event.day}</span>
                      <span className="ev-month">{event.month}</span>
                    </div>
                  </div>
                  <div className="ev-body">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <div className="ev-meta">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={12} /> {event.time}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem' }}>
                        <MapPin size={12} /> {event.location}
                      </span>
                    </div>
                    <a 
                      className="ev-btn" 
                      href="/#contact"
                    >
                      Volunteer Now <ChevronRight size={14} style={{ marginLeft: '0.2rem' }} />
                    </a>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--ink-light)', padding: '4rem', gridColumn: '1/-1' }}>
                  <p>No programs found under this filter.</p>
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

export default EventsPage;
