import React, { useState } from 'react';
import { ArrowLeft, Lock, ShieldAlert, HeartHandshake, CalendarRange, AlertCircle } from 'lucide-react';

const API_BASE = '/api';

const AdminLogin = ({ onLoginSuccess, onBackToHome }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.token, data.role);
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (err) {
      console.error(err);
      // Offline fallback for testing
      const u = username.toLowerCase();
      if (password === 'admin123' && u === 'admin') {
        onLoginSuccess('secret-caring-hands-token-2026', 'admin');
      } else if (password === 'staff123' && u === 'staff') {
        onLoginSuccess('secret-caring-hands-staff-2026', 'staff');
      } else if (password === 'volunteer123' && u === 'volunteer') {
        onLoginSuccess('secret-caring-hands-volunteer-2026', 'volunteer');
      } else {
        setError('Incorrect credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card" style={{ maxWidth: '480px', width: '100%', padding: '3.5rem 2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Caring Hands Portal</h2>
        <p style={{ color: 'var(--dark-text-muted)', marginBottom: '2rem' }}>
          Enter your credentials to log in and manage content.
        </p>

        {error && (
          <div className="admin-login-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#fff', fontSize: '0.9rem' }}>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '1.5rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#8d8d9b' }} />
              <input
                type="password"
                placeholder="Enter password"
                style={{ paddingLeft: '2.8rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading} style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))'
          }}>
            {loading ? 'Authenticating...' : `Sign In`}
          </button>
        </form>

        <a href="#" className="admin-login-back" onClick={(e) => { e.preventDefault(); onBackToHome(); }}>
          <ArrowLeft size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Back to Website
        </a>
      </div>
    </div>
  );
};

export default AdminLogin;
