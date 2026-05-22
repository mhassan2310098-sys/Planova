'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function DashboardNavbar({ user, onLogout }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'white', borderBottom: '1px solid #e5e5e5',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: '60px',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: '#0d1b2a' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.95rem' }}>PLANOVA</span>
      </Link>
      <div style={{ display: 'flex', gap: '2.5rem' }}>
        {['DASHBOARD', 'MY TRIPS', 'FAVORITES', 'EXPLORE'].map((item) => (
          <a key={item} href="#" style={{
            color: item === 'DASHBOARD' ? '#0d1b2a' : '#888',
            textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em',
            borderBottom: item === 'DASHBOARD' ? '2px solid #0d1b2a' : 'none',
            paddingBottom: '2px',
          }}>{item}</a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#e53e3e', borderRadius: '50%' }} />
        </button>
        <button onClick={onLogout} title="Click to logout" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { router.push('/login'); return; }
    setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null;

  const mainCards = [
    {
      route: '/Newtrip',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>
        </svg>
      ),
      title: 'NEW TRIP',
      desc: 'Start planning your next adventure. Search destinations, set your budget, create itinerary, and compare hotels all in one place.',
    },
    {
      route: '/my-trips',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      title: 'MY TRAVEL PLAN',
      desc: 'Access your saved trips, view your full itineraries, hotel details, budget breakdowns and day-by-day plans.',
    },
    {
      route: '/season-recommendations',
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ),
      title: 'SEASON GUIDE',
      desc: 'Get personalized season-based recommendations for the best time to visit your destination based on weather and events.',
    },
  ];

  const destinations = [
    {
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
      name: "Cox's Bazar",
      location: 'Chittagong, Bangladesh',
      price: '৳8,500',
      rating: '4.7',
    },
    {
      img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&q=80',
      name: 'Sundarbans',
      location: 'Khulna, Bangladesh',
      price: '৳12,000',
      rating: '4.8',
    },
    {
      img: 'https://images.unsplash.com/photo-1558618047-f4e60cec3b9f?w=500&q=80',
      name: 'Sylhet',
      location: 'Sylhet, Bangladesh',
      price: '৳6,500',
      rating: '4.6',
    },
    {
      img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80',
      name: 'Maldives',
      location: 'Indian Ocean',
      price: '৳85,000',
      rating: '4.9',
    },
  ];

  const offers = [
    { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80', title: "Cox's Bazar Beach Resort", valid: 'Valid until June 30, 2026', discount: '30% OFF' },
    { img: 'https://images.unsplash.com/photo-1558618047-f4e60cec3b9f?w=500&q=80', title: 'Sylhet Tea Garden Tour', valid: 'Valid until July 15, 2026', discount: '20% OFF' },
    { img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80', title: 'Maldives Luxury Package', valid: 'Valid until August 20, 2026', discount: '25% OFF' },
    { img: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=500&q=80', title: 'Dhaka Food Tour Special', valid: 'Valid until May 31, 2026', discount: '15% OFF' },
  ];

  const trending = [
    { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80', name: "Cox's Bazar", country: 'Bangladesh', trend: '↑ 35%' },
    { img: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&q=80', name: 'Sundarbans', country: 'Bangladesh', trend: '↑ 28%' },
    { img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=100&q=80', name: 'Maldives', country: 'International', trend: '↑ 22%' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        .main-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; transform: translateY(-3px); }
        .main-card { transition: all 0.22s ease !important; }
        .hover-shadow:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10) !important; }
        .hover-shadow { transition: box-shadow 0.2s !important; }
      `}</style>

      <DashboardNavbar user={user} onLogout={handleLogout} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '4rem 2.5rem', textAlign: 'center', color: 'white' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.55, marginBottom: '0.75rem' }}>Welcome back</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
          Your Travel Dashboard
        </h1>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Plan smarter, travel better with Planova</p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* ── 3 Main Cards in same row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
          {mainCards.map((card) => (
            <div
              key={card.title}
              className="main-card"
              onClick={() => router.push(card.route)}
              style={{ background: 'white', padding: '2rem', cursor: 'pointer', border: '1px solid #eee' }}
            >
              <div style={{ marginBottom: '1.25rem' }}>{card.icon}</div>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '0.65rem', color: '#0d1b2a' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.75 }}>{card.desc}</p>
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: '#0d1b2a', letterSpacing: '0.1em' }}>
                GET STARTED
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </div>
            </div>
          ))}
        </div>

        {/* ── Advanced Travel Guide ── */}
        <h2 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.14em', marginBottom: '1.25rem', color: '#0d1b2a', textTransform: 'uppercase' }}>Advanced Travel Guide</h2>
        <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem', marginBottom: '3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'DESTINATION SEARCH', desc: 'Search for specific destinations and display detailed information based on your input preferences.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'SEASON RECOMMENDATIONS', desc: 'Get personalized season-based recommendations for the best time to visit any destination.' },
              { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>, title: 'COMPREHENSIVE INFO', desc: 'Access comprehensive travel information including attractions, culture, weather, and local tips.' },
            ].map((item) => (
              <div key={item.title}>
                <div style={{ width: '48px', height: '48px', background: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>{item.icon}</div>
                <h4 style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem', color: '#0d1b2a' }}>{item.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#666', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Offers ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.14em', color: '#0d1b2a', textTransform: 'uppercase' }}>Offers & Reviews</h2>
          <a href="#" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 600 }}>VIEW ALL →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
          {offers.map((offer) => (
            <div key={offer.title} className="hover-shadow" style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={offer.img} alt={offer.title} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=80'; }} />
                <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#e53e3e', color: 'white', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', letterSpacing: '0.05em' }}>{offer.discount}</span>
              </div>
              <div style={{ padding: '1rem' }}>
                <p style={{ fontSize: '0.83rem', fontWeight: 600, color: '#0d1b2a', marginBottom: '0.3rem' }}>{offer.title}</p>
                <p style={{ fontSize: '0.73rem', color: '#999' }}>{offer.valid}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Popular Destinations ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.14em', color: '#0d1b2a', textTransform: 'uppercase' }}>Popular Destinations</h2>
          <a href="#" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'none', letterSpacing: '0.05em', fontWeight: 600 }}>VIEW ALL →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
          {destinations.map((dest) => (
            <div key={dest.name} className="hover-shadow" style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', cursor: 'pointer' }}>
              <img src={dest.img} alt={dest.name} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=500&q=80'; }} />
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b2a', marginBottom: '0.3rem' }}>{dest.name}</p>
                <p style={{ fontSize: '0.73rem', color: '#888', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {dest.location}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a' }}>From {dest.price}</span>
                  <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>★ {dest.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Activity + Trending ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'white', border: '1px solid #eee', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#0d1b2a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Recent Activity
            </h3>
            {[
              { icon: '✈', action: "Trip to Cox's Bazar", sub: 'Saved itinerary • 2 days ago' },
              { icon: '🏨', action: 'Compared hotels in Sylhet', sub: 'Search • 5 days ago' },
              { icon: '🗺', action: 'Created budget for Maldives Trip', sub: 'Budget plan • 1 week ago' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingBottom: '1rem', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', marginBottom: i < 2 ? '1rem' : 0 }}>
                <div style={{ width: '36px', height: '36px', background: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '0.83rem', color: '#0d1b2a', fontWeight: 500 }}>{item.action}</p>
                  <p style={{ fontSize: '0.73rem', color: '#999', marginTop: '2px' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #eee', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#0d1b2a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Trending Now
            </h3>
            {trending.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', marginBottom: i < 2 ? '1rem' : 0 }}>
                <img src={item.img} alt={item.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=100&q=80'; }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b2a' }}>{item.name}</p>
                  <p style={{ fontSize: '0.73rem', color: '#999' }}>{item.country}</p>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 700 }}>{item.trend}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}