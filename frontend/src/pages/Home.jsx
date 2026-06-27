import React, { useState, useEffect } from 'react';
import ParticleCanvas from '../components/ParticleCanvas';
import CustomCursor from '../components/CustomCursor';
import { Heart, Phone, Mail, MapPin, Clock, Calendar, MapPin as MapPinIcon, Clock as ClockIcon, X, CheckCircle } from 'lucide-react';

const API_BASE = '/api';

const DEFAULT_SETTINGS = {
  heroTitleLine1: "Where Compassion",
  heroTitleLine2: "Meets Action",
  heroSubtitle: "Caring Hands Charitable Trust uplifts our beloved elders through dedicated care, healthcare, and love — building a world where no one ages alone.",
  heroImage: "/images/hero_banner.png",
  logoImage: "/images/logo.png",
  foundedYear: 2010,
  stats: { eldersCaredFor: 250, yearsOfService: 15, volunteers: 5000, eventsOrganised: 120 },
  contact: {
    address: "Bada Banda, Mustaid Pura, Hyderabad, Telangana, 500006",
    phone: "+91 95020 51489",
    email: "info@caringhands.in",
    officeHours: "Monday – Saturday, 9:00 AM – 6:00 PM IST"
  },
  socials: { facebook: "#", twitter: "#", linkedin: "#", instagram: "#", youtube: "#" }
};

const Home = ({ onNavigateToAdmin }) => {
  // Preloader State
  const [loading, setLoading] = useState(true);
  
  // API Data States
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  
  const [events, setEvents] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [partners, setPartners] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [menu, setMenu] = useState([]);

  // Local UI States
  const [navSolid, setNavSolid] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [activeModalImage, setActiveModalImage] = useState('');
  const [activeMenuTab, setActiveMenuTab] = useState('');
  const [showEmailSim, setShowEmailSim] = useState(null); // { name, email }

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

  // Form Fields
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    purpose: 'Volunteer with Caring Hands',
    message: ''
  });
  const [submittingContact, setSubmittingContact] = useState(false);



  // Stats Counters
  const [countedStats, setCountedStats] = useState({
    eldersCaredFor: 0,
    yearsOfService: 0,
    volunteers: 0,
    eventsOrganised: 0
  });

  // Fetch all dynamic data from server
  useEffect(() => {
    // Hide preloader after 2.2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    const fetchData = async () => {
      try {
        const [settingsRes, eventsRes, galleryRes, partnersRes, bannersRes, menuRes] = await Promise.all([
          fetch(`${API_BASE}/settings`).then(r => r.json()),
          fetch(`${API_BASE}/events`).then(r => r.json()),
          fetch(`${API_BASE}/gallery`).then(r => r.json()),
          fetch(`${API_BASE}/partners`).then(r => r.json()),
          fetch(`${API_BASE}/banners`).then(r => r.json()).catch(() => []),
          fetch(`${API_BASE}/menu`).then(r => r.json()).catch(() => [])
        ]);
        
        setSettings({
          ...DEFAULT_SETTINGS,
          ...settingsRes,
          stats: { ...DEFAULT_SETTINGS.stats, ...(settingsRes?.stats || {}) },
          contact: { ...DEFAULT_SETTINGS.contact, ...(settingsRes?.contact || {}) },
          socials: { ...DEFAULT_SETTINGS.socials, ...(settingsRes?.socials || {}) }
        });
        setEvents(eventsRes);
        setGallery(galleryRes);
        setPartners(partnersRes);
        setBanners(bannersRes || []);
        setMenu(menuRes || []);
        if (menuRes && menuRes.length > 0) {
          // Find unique categories and set the first one as active
          const categories = [...new Set(menuRes.map(m => m.category))];
          if (categories.length > 0) {
            setActiveMenuTab(categories[0]);
          }
        }
      } catch (err) {
        console.warn('Backend offline or failing. Falling back to default seeded data.', err);
        // Fallback mockup data
        setEvents([
          {
            id: "event_1",
            title: "Annual Elders Celebration",
            description: "A grand celebration honoring our elders with music, dance, cultural performances, and a feast of love.",
            time: "10:00 AM – 4:00 PM",
            location: "Main Hall",
            day: "28",
            month: "Jul",
            category: "Upcoming",
            image: "/images/event_1.png"
          },
          {
            id: "event_2",
            title: "Art & Craft Therapy Workshop",
            description: "Creative sessions where our elders express themselves through painting, pottery, and other wonderful crafts.",
            time: "Every Wednesday",
            location: "Activity Room",
            day: "05",
            month: "Aug",
            category: "Ongoing",
            image: "/images/event_2.png"
          },
          {
            id: "event_3",
            title: "Free Health Check-up Camp",
            description: "Comprehensive health screenings, consultations, and wellness guidance for our senior residents and community.",
            time: "9:00 AM – 2:00 PM",
            location: "Medical Wing",
            day: "12",
            month: "Aug",
            category: "Upcoming",
            image: "/images/event_3.png"
          }
        ]);
        setGallery([
          { id: "gal_1", image: "/images/gallery_1.png", caption: "Shared Meals, Shared Love" },
          { id: "gal_2", image: "/images/gallery_2.png", caption: "Peaceful Moments" },
          { id: "gal_3", image: "/images/gallery_3.png", caption: "Active & Healthy Living" },
          { id: "gal_4", image: "/images/gallery_4.png", caption: "Green Thumbs at Work" },
          { id: "gal_5", image: "/images/gallery_5.png", caption: "Volunteers Spreading Joy" },
          { id: "gal_6", image: "/images/gallery_6.png", caption: "Birthday Celebrations" }
        ]);
        setPartners([
          { id: "partner_1", name: "HealthFirst India", icon: "🏥" },
          { id: "partner_2", name: "Tata Trusts", icon: "🏛️" },
          { id: "partner_3", name: "Rotary International", icon: "🔄" },
          { id: "partner_4", name: "Lions Club", icon: "🦁" },
          { id: "partner_5", name: "HelpAge India", icon: "🤝" },
          { id: "partner_6", name: "Red Cross Society", icon: "❤️" }
        ]);
        setBanners([
          {
            id: "banner_1",
            image: "/images/hero_banner.png",
            title: "Where Compassion Meets Action",
            subtitle: "Caring Hands Charitable Trust uplifts our beloved elders through dedicated care, healthcare, and love."
          },
          {
            id: "banner_2",
            image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1920",
            title: "Restoring Dignity & Care",
            subtitle: "Providing comprehensive medical checkups, nutritious food, and shelter for senior citizens."
          }
        ]);
        const fallbackMenu = [
          { id: "menu_1", category: "Daily Meals", title: "Nourishing Breakfast", description: "Hot ragi malt, oatmeal, and fresh organic fruits.", time: "8:00 AM – 9:00 AM" },
          { id: "menu_2", category: "Daily Meals", title: "Healthy Balanced Lunch", description: "Full Indian thali with wheat rotis, dal, mixed vegetables, rice, and fresh curd.", time: "12:30 PM – 2:00 PM" },
          { id: "menu_3", category: "Daily Meals", title: "Evening Tea & Snacks", description: "Warm herbal tea served with digestive biscuits or light puffed rice.", time: "4:30 PM – 5:15 PM" },
          { id: "menu_4", category: "Medical Care", title: "Daily Vitals Screening", description: "Monitoring blood pressure, glucose levels, and temperature.", time: "Daily (Morning)" },
          { id: "menu_5", category: "Medical Care", title: "Physiotherapy & Mobility", description: "Guided sessions with certified physiotherapists.", time: "Mon, Wed, Fri" },
          { id: "menu_6", category: "Medical Care", title: "Doctor Consultations", description: "Visits by senior geriatric physicians for comprehensive checkups.", time: "Every Thursday" },
          { id: "menu_7", category: "Recreation", title: "Yoga & Meditation", description: "Chair yoga and guided mindfulness sessions for mental peace.", time: "7:00 AM – 7:45 AM" },
          { id: "menu_8", category: "Recreation", title: "Interactive Board Games", description: "Playing chess, carrom, and memory puzzles.", time: "3:00 PM – 4:30 PM" }
        ];
        setMenu(fallbackMenu);
        setActiveMenuTab("Daily Meals");
      }
    };

    fetchData();
    return () => clearTimeout(timer);
  }, []);

  // Window scroll hook for Nav solid state & parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setNavSolid(window.scrollY > 60);

      // Simple Parallax for Hero Background
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatic banner slideshow
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // Stats Scroll Count Animation
  useEffect(() => {
    if (loading) return;

    const statsElement = document.getElementById('statsSection');
    if (!statsElement) return;

    let counted = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counted) {
          counted = true;
          const duration = 1800; // ms
          const startTimestamp = performance.now();

          const animate = (now) => {
            const progress = Math.min((now - startTimestamp) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart

            setCountedStats({
              eldersCaredFor: Math.floor(ease * settings.stats.eldersCaredFor),
              yearsOfService: Math.floor(ease * settings.stats.yearsOfService),
              volunteers: Math.floor(ease * settings.stats.volunteers),
              eventsOrganised: Math.floor(ease * settings.stats.eventsOrganised)
            });

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(statsElement);
    return () => observer.disconnect();
  }, [loading, settings]);

  // Scroll Reveal Observer
  useEffect(() => {
    if (loading) return;

    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('up');
          }
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, events, gallery, partners]);

  // Form Submissions
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.email || !contactForm.message) {
      alert('Please fill out Name, Email and Message.');
      return;
    }

    setSubmittingContact(true);
    const fullName = `${contactForm.firstName} ${contactForm.lastName}`.trim();
    
    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: contactForm.email,
          phone: contactForm.phone,
          purpose: contactForm.purpose,
          message: contactForm.message
        })
      });

      if (response.ok) {
        // Show simulated outbox modal
        setShowEmailSim({ name: fullName, email: contactForm.email });
        // Reset form
        setContactForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          purpose: 'Volunteer with Caring Hands',
          message: ''
        });
      } else {
        alert('Server returned an error. Please try again.');
      }
    } catch (err) {
      console.error(err);
      // Fallback local simulation in case backend is offline
      setShowEmailSim({ name: fullName, email: contactForm.email });
      setContactForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        purpose: 'Volunteer with Caring Hands',
        message: ''
      });
    } finally {
      setSubmittingContact(false);
    }
  };



  return (
    <>
      <CustomCursor />

      {/* ── PRELOADER ── */}
      {loading && (
        <div id="preloader">
          <div className="pre-logo">
            <img src={settings.logoImage || "/images/logo.png"} alt="Logo" className="pre-logo-img" onError={(e) => {
              e.target.src = 'https://placehold.co/180x80/b5232a/white?text=Caring+Hands';
            }} />
          </div>
          <div className="pre-bar-wrap">
            <div className="pre-bar"></div>
          </div>
          <div className="pre-tagline">Changing Lives With Love</div>
        </div>
      )}

      {/* ── NAVIGATION BAR ── */}
      <nav className={navSolid ? 'solid' : ''}>
        <a className="nav-logo" href="#">
          <img src={settings.logoImage || "/images/logo.png"} alt="Caring Hands" className="nav-logo-img" onError={(e) => {
            e.target.src = 'https://placehold.co/180x80/b5232a/white?text=Caring+Hands';
          }} />
        </a>
        <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li><a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a></li>
          <li><a href="#menu-page" onClick={() => setMobileMenuOpen(false)}>Daily Care</a></li>
          <li><a href="#events-page" onClick={() => setMobileMenuOpen(false)}>Events</a></li>
          <li><a href="#gallery-page" onClick={() => setMobileMenuOpen(false)}>Gallery</a></li>
          <li><a href="#partners" onClick={() => setMobileMenuOpen(false)}>Partners</a></li>
          <li><a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a></li>
        </ul>
        <div className="nav-actions">
          <button className="nav-donate" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact Us ✦</button>
          <button className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <section className="hero" id="home">
        <div className="hero-bg">
          {banners.length > 0 ? (
            banners.map((slide, idx) => (
              <img 
                key={slide.id || idx}
                src={slide.image} 
                alt="Banner slide" 
                className={`hero-img ${idx === activeBannerIndex ? 'active' : ''}`}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1920';
                }}
              />
            ))
          ) : (
            <img src={settings.heroImage || "/images/hero_banner.png"} alt="Elders" className="hero-img active" onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=1920';
            }} />
          )}
          <div className="hero-gradient" style={{ zIndex: 2 }}></div>
        </div>
        <ParticleCanvas />
        <div className="hero-content" style={{ zIndex: 3 }}>
          <div className="hero-eyebrow">
            <span className="eyebrow-dot"></span>
            Serving Humanity Since {settings.foundedYear}
          </div>
          {banners.length > 0 && banners[activeBannerIndex] ? (
            <>
              <h1 className="hero-h1">
                {banners[activeBannerIndex].title || settings.heroTitleLine1}
              </h1>
              <p className="hero-p">{banners[activeBannerIndex].subtitle || settings.heroSubtitle}</p>
            </>
          ) : (
            <>
              <h1 className="hero-h1">
                {settings.heroTitleLine1} <span className="italic">{settings.heroTitleLine2}</span>
              </h1>
              <p className="hero-p">{settings.heroSubtitle}</p>
            </>
          )}
          <div className="hero-actions">
            <button className="btn-gold" onClick={() => {
              setContactForm(prev => ({
                ...prev,
                purpose: 'Make a donation',
                message: 'Hello, I would like to support Caring Hands. Please contact me with details on how I can contribute.'
              }));
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}><span>Get Involved</span></button>
            <a className="btn-ghost" href="#events">Our Events</a>
          </div>

          {/* Banner Dot Indicators */}
          {banners.length > 1 && (
            <div className="banner-dots" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: '2.5rem' }}>
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  style={{
                    width: idx === activeBannerIndex ? '28px' : '10px',
                    height: '10px',
                    borderRadius: '50px',
                    background: idx === activeBannerIndex ? 'var(--primary)' : 'rgba(181, 35, 42, 0.25)',
                    border: '1px solid rgba(181, 35, 42, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        <div className="hero-scroll-cue" style={{ zIndex: 3 }}>
          <div className="scroll-line"></div>
          <div className="scroll-text">Scroll</div>
        </div>
      </section>

      {/* ── SCROLLING MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {Array(4).fill([
            "Elder Care", "Healthcare Outreach", "Daily Nutrition", 
            "Community Building", "Mental Wellness", "Volunteer Programs", 
            "Dignity in Aging", "Love & Compassion"
          ]).flat().map((item, idx) => (
            <span key={idx} className="marquee-item">
              {item} <span className="marquee-sep">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS SECTION ── */}
      <div className="stats-belt" id="statsSection">
        <div className="stat-item reveal">
          <span className="stat-icon">🌍</span>
          <span className="stat-num">{countedStats.eldersCaredFor.toLocaleString('en-IN')}+</span>
          <span className="stat-lbl">Elders Cared For</span>
        </div>
        <div className="stat-item reveal">
          <span className="stat-icon">🏠</span>
          <span className="stat-num">{countedStats.yearsOfService}+</span>
          <span className="stat-lbl">Years of Service</span>
        </div>
        <div className="stat-item reveal">
          <span className="stat-icon">🙌</span>
          <span className="stat-num">{countedStats.volunteers.toLocaleString('en-IN')}+</span>
          <span className="stat-lbl">Volunteers Registered</span>
        </div>
        <div className="stat-item reveal">
          <span className="stat-icon">✅</span>
          <span className="stat-num">{countedStats.eventsOrganised}+</span>
          <span className="stat-lbl">Events Organised</span>
        </div>
      </div>

      {/* ── DYNAMIC MENU SECTION ── */}
      <section className="menu-section" id="menu">
        <div className="menu-header reveal">
          <div className="s-tag">Daily Care &amp; Programs</div>
          <h2 className="s-title">Daily Life <span className="ital">at Caring Hands</span></h2>
          <p className="s-body" style={{ margin: '0 auto', maxWidth: '520px' }}>
            We provide structured daily routines, nutritional meals, healthcare support, and recreational programs tailored for the happiness of our elders.
          </p>
        </div>

        {/* Dynamic Category Tabs */}
        {menu.length > 0 && (
          <div className="menu-tabs-container reveal">
            {[...new Set(menu.map(item => item.category))].map((category) => (
              <button
                key={category}
                className={`menu-tab-btn ${activeMenuTab === category ? 'active' : ''}`}
                onClick={() => setActiveMenuTab(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Menu Cards List Grid */}
        <div className="menu-grid reveal">
          {menu
            .filter((item) => item.category === activeMenuTab)
            .map((item) => (
              <div className="menu-card" key={item.id}>
                <div className="menu-card-header">
                  <h3>{item.title}</h3>
                  {item.time && <span className="menu-card-time">🕐 {item.time}</span>}
                </div>
                <p className="menu-card-desc">{item.description}</p>
                <div className="menu-card-footer">
                  <span className="menu-heart-icon">❤️ Caring Hands</span>
                  <a className="menu-inquire-link" href="#contact" onClick={() => {
                    setContactForm(prev => ({
                      ...prev,
                      purpose: 'General enquiry',
                      message: `Hi Caring Hands, I am interested in sponsoring or learning more about the program: "${item.title}" under "${item.category}". Please contact me.`
                    }));
                  }}>
                    Inquire ➔
                  </a>
                </div>
              </div>
            ))}
          {menu.filter((item) => item.category === activeMenuTab).length === 0 && (
            <div className="menu-empty-state">
              <p>No items found for this category.</p>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <a href="#menu-page" className="btn-gold" style={{ display: 'inline-flex' }}>
            <span>Explore Full Care Schedule &amp; Menu ➔</span>
          </a>
        </div>
      </section>

      {/* ── EVENTS SECTION ── */}
      <section className="events-section" id="events">
        <div className="events-header reveal">
          <div className="s-tag">Upcoming & Ongoing Programs</div>
          <h2 class="s-title">Join Us in Making <span className="ital">a Difference</span></h2>
          <p className="s-body" style={{ margin: '0 auto', maxWidth: '520px' }}>
            Participate in our heartfelt events and bring smiles to the faces of our beloved elders.
          </p>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <div className="event-card reveal" key={event.id}>
              <div className="ev-img-wrap">
                <img src={event.image} alt={event.title} onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600';
                }} />
                <span className={`ev-cat ${event.category.toLowerCase() === 'ongoing' ? 'ev-ongoing' : ''}`}>{event.category}</span>
                <div className="ev-date">
                  <span className="ev-day">{event.day}</span>
                  <span className="ev-month">{event.month}</span>
                </div>
              </div>
              <div className="ev-body">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className="ev-meta">
                  <span>🕐 {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
                <a className="ev-btn" href="#contact" onClick={() => {
                  setContactForm(prev => ({
                    ...prev,
                    purpose: 'Volunteer with Caring Hands',
                    message: `Hi Caring Hands, I am interested in volunteering or supporting the event: "${event.title}". Please let me know how I can contribute.`
                  }));
                }}>
                  Register Interest
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <a href="#events-page" className="btn-gold" style={{ display: 'inline-flex' }}>
            <span>View All Campaigns &amp; Events ➔</span>
          </a>
        </div>
      </section>

      {/* ── GALLERY MOSAIC SECTION ── */}
      <section className="gallery-section" id="gallery">
        <div className="gal-header reveal">
          <div className="s-tag">Photo Stories</div>
          <h2 className="s-title">Moments of <span class="ital">Joy &amp; Togetherness</span></h2>
          <p className="s-body" style={{ margin: '0 auto', maxWidth: '500px' }}>
            A glimpse into the daily life, celebrations, and heartwarming moments at Caring Hands.
          </p>
        </div>
        <div className="gallery-mosaic" style={{ marginTop: '3rem' }}>
          {gallery.map((item) => (
            <div className="gm reveal" key={item.id} onClick={() => {
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
        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <a href="#gallery-page" className="btn-gold" style={{ display: 'inline-flex' }}>
            <span>Explore Full Photo Gallery ➔</span>
          </a>
        </div>
      </section>

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
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
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
                  href="#contact" 
                  className="btn-gold" 
                  style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.85rem' }}
                  onClick={() => {
                    setSelectedGalleryItem(null);
                    setContactForm(prev => ({
                      ...prev,
                      purpose: 'Support Caring Hands NGO',
                      message: `Hi, I am deeply moved by the gallery story: "${selectedGalleryItem.caption}". I would love to connect and see how I can support your efforts.`
                    }));
                  }}
                >
                  <span>Connect / Sponsor Cause</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PARTNERS SECTION ── */}
      <section className="partners-section" id="partners">
        <div className="partners-header reveal">
          <div className="s-tag">Trusted & Supported By</div>
          <h2 className="s-title">Our <span class="ital">Partners</span></h2>
          <p className="s-body" style={{ margin: '0 auto', maxWidth: '520px' }}>
            We are grateful to work alongside amazing organisations who share our vision of compassionate elder care.
          </p>
        </div>
        <div className="partners-grid">
          {partners.map((partner) => (
            <div className="partner-card reveal" key={partner.id}>
              <div className="partner-icon">
                {partner.icon && (partner.icon.startsWith('http') || partner.icon.startsWith('/') || partner.icon.startsWith('data:')) ? (
                  <img src={partner.icon} alt={partner.name} />
                ) : (
                  partner.icon || '🤝'
                )}
              </div>
              <div className="partner-name">{partner.name}</div>
            </div>
          ))}
        </div>
        <div className="partners-marquee reveal">
          <div className="p-marquee-inner">
            {Array(4).fill(partners).flat().map((p, idx) => (
              <React.Fragment key={idx}>
                <span>{p.name}</span>
                <span>✦</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section className="contact-section" id="contact">
        <div className="contact-grid">
          <div className="reveal-left">
            <div className="s-tag">Get In Touch</div>
            <h2 className="s-title">Let's Talk About<br /><span class="ital">Making a Difference</span></h2>
            <p className="s-body">
              Whether you want to volunteer, partner, or simply say hello — we would love to hear from you.
            </p>
            <div className="c-info-items">
              <div className="c-info-item">
                <div className="c-ico">📍</div>
                <div>
                  <strong>Visit Us</strong>
                  <span>{settings.contact.address}</span>
                </div>
              </div>
              <div className="c-info-item">
                <div className="c-ico">📞</div>
                <div>
                  <strong>Call Us</strong>
                  <span>{settings.contact.phone}</span>
                </div>
              </div>
              <div className="c-info-item">
                <div className="c-ico">📧</div>
                <div>
                  <strong>Email Us</strong>
                  <span>{settings.contact.email}</span>
                </div>
              </div>
              <div className="c-info-item">
                <div className="c-ico">🕐</div>
                <div>
                  <strong>Office Hours</strong>
                  <span>{settings.contact.officeHours}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="c-form-wrap reveal-right">
            <h3 className="form-title">Send a Message</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="f-row">
                <div className="f-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Your first name" required value={contactForm.firstName} onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })} />
                </div>
                <div className="f-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Your last name" value={contactForm.lastName} onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })} />
                </div>
              </div>
              <div className="f-group">
                <label>Email Address</label>
                <input type="email" placeholder="your@email.com" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
              </div>
              <div className="f-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
              </div>
              <div className="f-group">
                <label>I want to</label>
                <select value={contactForm.purpose} onChange={(e) => setContactForm({ ...contactForm, purpose: e.target.value })}>
                  <option value="Volunteer with Caring Hands">Volunteer with Caring Hands</option>
                  <option value="Make a donation">Make a donation</option>
                  <option value="Corporate CSR partnership">Corporate CSR partnership</option>
                  <option value="Schedule a visit">Schedule a visit</option>
                  <option value="General enquiry">General enquiry</option>
                </select>
              </div>
              <div className="f-group">
                <label>Message</label>
                <textarea placeholder="Tell us how you'd like to help…" required value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}></textarea>
              </div>
              <button type="submit" className="f-submit" disabled={submittingContact}>
                {submittingContact ? 'Sending Message...' : 'Send Message ✦'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div>
            <img src={settings.logoImage || "/images/logo.png"} alt="Caring Hands" className="footer-logo-img" onError={(e) => {
              e.target.src = 'https://placehold.co/180x80/b5232a/white?text=Caring+Hands';
            }} />
            <p className="footer-desc">
              Empowering our elders with compassion, healthcare, and dignity. Together we build a world where no one ages alone.
            </p>
            <div className="f-socials">
              <a className="f-soc" href={settings.socials.facebook}>f</a>
              <a className="f-soc" href={settings.socials.twitter}>𝕏</a>
              <a className="f-soc" href={settings.socials.linkedin}>in</a>
              <a className="f-soc" href={settings.socials.instagram}>📷</a>
              <a className="f-soc" href={settings.socials.youtube}>▶</a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Navigate</h5>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#menu">Daily Care</a></li>
              <li><a href="#events">Events</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#partners">Partners</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Programs</h5>
            <ul>
              <li><a href="#">Elder Care</a></li>
              <li><a href="#">Healthcare Outreach</a></li>
              <li><a href="#">Daily Nutrition</a></li>
              <li><a href="#">Mental Wellness</a></li>
              <li><a href="#">Volunteer Programs</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Get Involved</h5>
            <ul>
              <li><a href="#">Volunteer</a></li>
              <li><a href="#">Corporate CSR</a></li>
              <li><a href="#">Monthly Giving</a></li>
              <li><a href="#">Sponsor an Elder</a></li>
              <li><a href="#">Annual Reports</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Caring Hands Charitable Trust · Reg. NGO · FCRA Approved · 80G Tax Exemption</span>
          <div className="footer-trust">
            <span>🤝 Corporate CSR</span>
            <span>✅ Transparent Operations</span>
            <span>❤️ Built for Humanity</span>
          </div>
        </div>
      </footer>

      {/* ── EMAIL OUTBOX SIMULATOR MODAL ── */}
      {showEmailSim && (
        <div className="email-modal active">
          <div className="email-modal-card">
            <div className="email-modal-header">
              <span className="email-badge-indicator">📧 SMTP Loopback Simulation</span>
              <button className="email-modal-close" onClick={() => setShowEmailSim(null)}>&times;</button>
            </div>
            <div className="email-modal-meta">
              <p><strong>From:</strong> info@caringhands.in</p>
              <p><strong>To:</strong> {showEmailSim.email}</p>
              <p><strong>Subject:</strong> We received your Caring Hands Inquiry!</p>
            </div>
            <div className="email-modal-body">
              <p>Dear {showEmailSim.name},</p>
              <p>Thank you for reaching out to <strong>Caring Hands Charitable Trust</strong>. We have successfully received your message and our administrators are already reviewing it.</p>
              <p>One of our team members will get in touch with you shortly. If you need immediate assistance, please call us directly at <strong>+91 95020 51489</strong>.</p>
              <br />
              <p>Warm regards,</p>
              <p><strong>Caring Hands Charitable Trust Team</strong><br />Hyderabad, India</p>
            </div>
            <div className="email-modal-footer">
              <span>✓ Automated verification mail dispatched successfully to {showEmailSim.email}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
