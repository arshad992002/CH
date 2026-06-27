import React, { useState, useEffect } from 'react';
import CustomCursor from '../components/CustomCursor';
import { ArrowLeft, Phone, Mail, MapPin, Check } from 'lucide-react';

const API_BASE = '/api';

const GalleryPage = ({ onNavigateToAdmin }) => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      // Fallback seed
      setGallery([
        { id: '1', caption: 'Joyful Gardening Session', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600' },
        { id: '2', caption: 'Daily Meal Distribution Drive', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600' },
        { id: '3', caption: 'Weekly Physiotherapy Session', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600' },
        { id: '4', caption: 'Evening Devotional Satsang', image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getGalleryPhotos = (item) => {
    if (!item) return [];
    const list = [item.image];
    if (item.subImages && item.subImages.length > 0) {
      item.subImages.forEach(img => {
        if (!list.includes(img)) list.push(img);
      });
    } else {
      list.push(
        'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=600'
      );
    }
    return list;
  };

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
          <li><a href="#events-page" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
          <li><a href="#gallery-page" className="active" onClick={() => setMobileMenuOpen(false)}>Gallery</a></li>
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
            src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=1920" 
            alt="Gallery Banner" 
            className="hero-img active" 
            style={{ filter: 'brightness(0.55)' }}
          />
          <div className="hero-gradient"></div>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow" style={{ borderColor: 'var(--gold-lt)', color: 'var(--gold-lt)' }}>
            <span className="eyebrow-dot" style={{ backgroundColor: 'var(--gold-lt)' }}></span>
            Caring Hands Visuals
          </div>
          <h1 className="hero-h1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Moments of <span className="italic">Joy &amp; Dignity</span>
          </h1>
          <p className="hero-p" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Browse through our photo albums documenting real stories and smiles from our elder-care home.
          </p>
        </div>
      </header>

      {/* ── GALLERY MOSAIC ── */}
      <main className="gallery-section" style={{ padding: '5rem 6vw' }}>
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)' }}>
              <p>Loading gallery items...</p>
            </div>
          ) : (
            <div className="gallery-mosaic">
              {gallery.map((item) => (
                <div className="gm reveal up" key={item.id} onClick={() => {
                  setSelectedGalleryItem(item);
                  setActiveModalImage(item.image);
                }}>
                  <img src={item.image} alt={item.caption} onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600';
                  }} />
                  <div className="gm-ov">
                    <span>{item.caption}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Grid Story Detail Modal Overlay */}
      {selectedGalleryItem !== null && (
        <div className="modal-overlay" onClick={() => setSelectedGalleryItem(null)} style={{ background: 'rgba(11, 11, 14, 0.93)', backdropFilter: 'blur(10px)', zIndex: 10000 }}>
          <div className="gallery-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.2rem',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#fff',
              fontSize: '1.5rem',
              cursor: 'pointer',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }} onClick={() => setSelectedGalleryItem(null)}>&times;</button>
            
            {/* Left Side: Large Active Image */}
            <div className="gdm-left-col">
              <div className="gdm-img-container">
                <img 
                  src={activeModalImage} 
                  alt={selectedGalleryItem.caption} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600';
                  }}
                />
              </div>
            </div>
            
            {/* Right Side: Description and Gallery Sub-grid */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyStyle: 'space-between', height: '100%' }}>
              <div>
                <span style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.78rem', fontWeight: '700' }}>Photo Album Explorer</span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: '1.2', color: '#fff' }}>{selectedGalleryItem.caption}</h3>
                <p style={{ color: '#8d8d9b', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  This gallery captures real, unfiltered moments from Caring Hands initiatives. Through these dedicated drives, we ensure security, nutrition, and companionship for our elders.
                </p>
                
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: '#fff', fontWeight: '600' }}>Album Grid ({getGalleryPhotos(selectedGalleryItem).length} Photos)</h4>
                
                {/* Sub-grid of Photos */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.6rem'
                }}>
                  {getGalleryPhotos(selectedGalleryItem).map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveModalImage(img)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '65px',
                        border: activeModalImage === img ? '2px solid var(--primary)' : '1px solid var(--dark-border)',
                        transform: activeModalImage === img ? 'scale(1.03)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <a 
                  href="/#contact" 
                  className="btn-gold" 
                  style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.85rem' }}
                  onClick={() => {
                    setSelectedGalleryItem(null);
                  }}
                >
                  <span>Connect / Sponsor Cause</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default GalleryPage;
