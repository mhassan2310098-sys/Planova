'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess('Account created! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
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
            backgroundImage:
              "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200')",
          }}
        />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <h2>Start Your Adventure</h2>
          <p>
            Create your free account and unlock intelligent travel planning, personalized
            itineraries, and real-time travel insights.
          </p>
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
            <span>SMART TRAVEL PLANNER</span>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <Link href="/login" className="auth-tab">LOGIN</Link>
            <span className="auth-tab active">SIGN UP</span>
          </div>

          {/* Messages */}
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="your@email.com"
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
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <Link href="/" className="back-home">← BACK TO HOME</Link>

          <p className="auth-switch">
            ALREADY HAVE AN ACCOUNT?{' '}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}