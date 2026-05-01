'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please try again.');
        return;
      }

      // Save token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard (or home for now)
      router.push('/');
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
              "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200')",
          }}
        />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <h2>Welcome to Planova</h2>
          <p>
            Your journey to seamless travel planning begins here. Discover, plan,
            and explore with confidence.
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
            <span className="auth-tab active">LOGIN</span>
            <Link href="/signup" className="auth-tab">SIGN UP</Link>
          </div>

          {/* Error */}
          {error && <div className="error-msg">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
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

            <div className="form-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#" className="forgot-link">FORGOT PASSWORD?</a>
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>

          <Link href="/" className="back-home">← BACK TO HOME</Link>

          <p className="auth-switch">
            DON&apos;T HAVE AN ACCOUNT?{' '}
            <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}