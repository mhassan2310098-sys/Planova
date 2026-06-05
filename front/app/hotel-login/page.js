'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HotelLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotel-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('hotel', JSON.stringify(data.hotel));
      localStorage.setItem('role', 'hotel');

      router.push('/HotelDashboard');
    } catch (err) {
      setError('Network error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left side */}
      <div className="auth-left">
        <div
          className="auth-left-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200')",
          }}
        />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <h2>Hotel Manager Portal</h2>
          <p>
            Manage your property listings, bookings, and guest experiences all
            in one place.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          {/* Logo */}
          <div className="auth-logo">
            <svg className="auth-logo-icon" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="1.5">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <h1>PLANOVA</h1>
            <span>HOTEL MANAGER PORTAL</span>
          </div>

          {/* Badge */}
          <div className="hotel-badge">🏨 HOTEL MANAGER LOGIN</div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Hotel Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="hotel@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN AS HOTEL MANAGER'}
            </button>
          </form>

          <Link href="/login" className="back-home">← BACK TO USER LOGIN</Link>

          <p className="auth-switch">
            NOT REGISTERED YET?{' '}
            <Link href="/signup?role=hotel">Register your hotel</Link>
          </p>
        </div>
      </div>
    </div>
  );
}