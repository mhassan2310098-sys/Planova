'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const travelTypes = [
  { id: 'solo', label: 'Solo', emoji: '🧍' },
  { id: 'couple', label: 'Couple', emoji: '👫' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'group', label: 'Group', emoji: '👥' },
];

export default function NewTripPage() {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [duration, setDuration] = useState('');
  const [travelType, setTravelType] = useState('');
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!destination.trim()) { setError('Please enter a destination.'); return; }
    if (!travelType) { setError('Please select a travel type.'); return; }
    if (!duration || duration < 1) { setError('Please enter number of days.'); return; }

    setError('');
    const params = new URLSearchParams({ destination, budgetMin, budgetMax, duration, travelType });
    router.push(`/search-results?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif' }}>

      {/* Back button */}
      <div style={{ padding: '1.25rem 2rem' }}>
        <button onClick={() => router.push('/Dashboard')} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
          color: '#555',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          BACK TO DASHBOARD
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', color: '#0d1b2a', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Plan Your New Trip
        </h1>
        <p style={{ color: '#888', fontSize: '0.95rem' }}>
          Tell us where you want to go and we'll handle the rest
        </p>
      </div>

      {/* Form Card */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ background: 'white', border: '1px solid #eee', padding: '2.5rem' }}>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: '0.8rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          {/* Destination */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.6rem' }}>
              Destination <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #ddd', padding: '0.85rem 1rem', transition: 'border-color 0.2s' }}
              onFocus={e => e.currentTarget.style.borderColor = '#0d1b2a'}
              onBlur={e => e.currentTarget.style.borderColor = '#ddd'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                type="text"
                placeholder="Where do you want to go? e.g. Cox's Bazar"
                value={destination}
                onChange={e => { setDestination(e.target.value); setError(''); }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', color: '#111' }}
              />
            </div>
          </div>

          {/* Duration */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.6rem' }}>
              Duration (Days) <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #ddd', padding: '0.85rem 1rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                type="number"
                min={1}
                max={30}
                placeholder="How many days?"
                value={duration}
                onChange={e => { setDuration(e.target.value); setError(''); }}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', color: '#111' }}
              />
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.6rem' }}>
              Budget Range (BDT)
            </label>
            <div style={{ background: '#f9f9f9', border: '1px solid #eee', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b2a' }}>৳{budgetMin.toLocaleString()}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0d1b2a' }}>৳{budgetMax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#999', width: '30px' }}>Min</span>
                  <input type="range" min={0} max={200000} step={1000} value={budgetMin}
                    onChange={e => setBudgetMin(Math.min(Number(e.target.value), budgetMax - 1000))}
                    style={{ flex: 1, accentColor: '#0d1b2a' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#999', width: '30px' }}>Max</span>
                  <input type="range" min={0} max={200000} step={1000} value={budgetMax}
                    onChange={e => setBudgetMax(Math.max(Number(e.target.value), budgetMin + 1000))}
                    style={{ flex: 1, accentColor: '#0d1b2a' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Travel Type */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.75rem' }}>
              Travel Type <span style={{ color: '#e53e3e' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
              {travelTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => { setTravelType(type.id); setError(''); }}
                  style={{
                    padding: '1rem', border: travelType === type.id ? '2px solid #0d1b2a' : '1px solid #ddd',
                    background: travelType === type.id ? '#0d1b2a' : 'white',
                    color: travelType === type.id ? 'white' : '#555',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{type.emoji}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSearch}
            style={{
              width: '100%', padding: '1rem', background: '#0d1b2a', color: 'white',
              border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a3a5c'}
            onMouseLeave={e => e.currentTarget.style.background = '#0d1b2a'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search & Plan My Trip
          </button>

        </div>
      </div>
    </div>
  );
}