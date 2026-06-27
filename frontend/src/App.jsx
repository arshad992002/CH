import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MenuPage from './pages/MenuPage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';

function App() {
  const [view, setView] = useState('home'); // 'home' | 'admin' | 'menu-page' | 'events-page' | 'gallery-page'
  const [adminToken, setAdminToken] = useState(null);
  const [adminRole, setAdminRole] = useState('admin');

  // Restore token and view from localStorage/URL hash on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole') || 'admin';
    if (token) {
      setAdminToken(token);
      setAdminRole(role);
    }

    // Direct url routing via hash
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setView('admin');
      } else if (hash === '#menu-page') {
        setView('menu-page');
      } else if (hash === '#events-page') {
        setView('events-page');
      } else if (hash === '#gallery-page') {
        setView('gallery-page');
      } else {
        setView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = (token, role) => {
    setAdminToken(token);
    setAdminRole(role);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminRole', role);
    window.location.hash = '#admin';
    setView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    setAdminToken(null);
    setAdminRole('admin');
    window.location.hash = '';
    setView('home');
  };

  const handleNavigateToAdmin = () => {
    window.location.hash = '#admin';
    setView('admin');
  };

  const handleBackToHome = () => {
    window.location.hash = '';
    setView('home');
  };

  if (view === 'admin') {
    if (adminToken) {
      return (
        <AdminDashboard 
          token={adminToken} 
          role={adminRole}
          onLogout={handleLogout} 
        />
      );
    } else {
      return (
        <AdminLogin 
          onLoginSuccess={handleLoginSuccess} 
          onBackToHome={handleBackToHome} 
        />
      );
    }
  }

  if (view === 'menu-page') {
    return <MenuPage onNavigateToAdmin={handleNavigateToAdmin} />;
  }

  if (view === 'events-page') {
    return <EventsPage onNavigateToAdmin={handleNavigateToAdmin} />;
  }

  if (view === 'gallery-page') {
    return <GalleryPage onNavigateToAdmin={handleNavigateToAdmin} />;
  }

  return (
    <Home 
      onNavigateToAdmin={handleNavigateToAdmin} 
    />
  );
}

export default App;
