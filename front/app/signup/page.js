'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isHotel = searchParams.get('role') === 'hotel';

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isHotel ? '/hotel-auth/register' : '/auth/register';

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      localStorage.setItem('token', data.token);

      if (isHotel) {
        localStorage.setItem('hotel', JSON.stringify(data.hotel));
        localStorage.setItem('role', 'hotel');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Account created! Redirecting...');
      setTimeout(() => router.push(isHotel ? '/HotelDashboard' : '/'), 1500);
    } catch (err) {
      setError('Network error. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left side — image */}
      <div className="auth-left">
        <div
          className="auth-left-bg"
          style={{
            backgroundImage: isHotel
              ? "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200')"
              : "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200')",
          }}
        />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          {isHotel ? (
            <>
              <h2>Register Your Hotel</h2>
              <p>
                Join Planova as a hotel partner and reach thousands of travellers
                looking for their perfect stay.
              </p>
            </>
          ) : (
            <>
              <h2>Start Your Adventure</h2>
              <p>
                Create your free account and unlock intelligent travel planning,
                personalized itineraries, and real-time travel insights.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right side — form */}
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
            <span>{isHotel ? 'HOTEL MANAGER PORTAL' : 'SMART TRAVEL PLANNER'}</span>
          </div>

          {/* Tabs — only show for regular signup */}
          {!isHotel && (
            <div className="auth-tabs">
              <Link href="/login" className="auth-tab">LOGIN</Link>
              <span className="auth-tab active">SIGN UP</span>
            </div>
          )}

          {/* Hotel badge */}
          {isHotel && (
            <div className="hotel-badge">🏨 HOTEL REGISTRATION</div>
          )}

          {/* Messages */}
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{isHotel ? 'Hotel Name' : 'Full Name'}</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder={isHotel ? 'Grand Hotel Dhaka' : 'John Doe'}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isHotel ? 'Hotel Email' : 'Email Address'}</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder={isHotel ? 'hotel@example.com' : 'your@email.com'}
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-input"
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button className="submit-btn" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading
                ? 'CREATING ACCOUNT...'
                : isHotel ? 'REGISTER HOTEL' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <Link href={isHotel ? '/hotel-login' : '/'} className="back-home">
            {isHotel ? '← BACK TO HOTEL LOGIN' : '← BACK TO HOME'}
          </Link>

          <p className="auth-switch">
            {isHotel ? (
              <>
                ALREADY REGISTERED?{' '}
                <Link href="/hotel-login">Hotel login</Link>
              </>
            ) : (
              <>
                ALREADY HAVE AN ACCOUNT?{' '}
                <Link href="/login">Log in</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// useSearchParams requires Suspense boundary in Next.js
export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}