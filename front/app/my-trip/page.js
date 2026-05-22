'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const typeColors = {
  food:       { bg: '#fff7ed', color: '#c2410c', label: '🍽 Food' },
  attraction: { bg: '#eff6ff', color: '#1d4ed8', label: '🏛 Attraction' },
  leisure:    { bg: '#f0fdf4', color: '#15803d', label: '🌿 Leisure' },
  travel:     { bg: '#faf5ff', color: '#7e22ce', label: '✈ Travel' },
};

export default function MyTripPage() {
  const router = useRouter();
  const [tripData, setTripData]   = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('currentTrip');
    if (!raw) { router.push('/new-trip'); return; }
    try {
      const parsed = JSON.parse(raw);
      setTripData(parsed);
    } catch {
      router.push('/new-trip');
    }
  }, []);

  if (!tripData) return null;

  // ── Safely extract everything from sessionStorage ──
  // customize-trip stores: { destination, duration, travelType, budgetMin, budgetMax,
  //   startDate, endDate, hotel, activities,
  //   itinerary: { overview, days, budgetBreakdown, tips },
  //   overview, budgetBreakdown, tips }
  const {
    destination,
    duration,
    travelType,
    budgetMin,
    budgetMax,
    startDate,
    endDate,
    hotel,
    activities,
    itinerary,
    overview,
    budgetBreakdown,
    tips,
  } = tripData;

  // itinerary can be the full object OR already extracted
  // Handle both shapes safely
  const days           = itinerary?.days || [];
  const safeOverview   = overview || itinerary?.overview || '';
  const safeBudget     = budgetBreakdown || itinerary?.budgetBreakdown || {};
  const safeTips       = tips || itinerary?.tips || [];
  const currentDay     = days[activeDay];

  // ── Save trip to DB ──
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setSaveError('Please log in to save your trip.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        destination:     String(destination || ''),
        duration:        Number(duration)   || 1,
        travelType:      String(travelType  || 'solo'),
        budgetMin:       Number(budgetMin)  || 0,
        budgetMax:       Number(budgetMax)  || 0,
        startDate:       startDate || null,
        endDate:         endDate   || null,
        hotel:           hotel     || {},
        activities:      Array.isArray(activities) ? activities : [],
        itinerary:       days,          // send the days array
        budgetBreakdown: safeBudget,
        overview:        safeOverview,
        tips:            safeTips,
      };

      console.log('Saving payload:', payload); // debug — remove later

      const res = await fetch(`${API}/trip/save`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('Save response:', text); // debug — remove later

      let json;
      try { json = JSON.parse(text); }
      catch { throw new Error(`Server error (${res.status})`); }
     console.log('STATUS:', res.status, 'JSON:', JSON.stringify(json));
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || `Save failed (${res.status})`);
      }

      setSaved(true);
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '80px' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .day-btn:hover     { background: #1a3a5c !important; color: white !important; }
        .activity-row:hover{ background: #f8fafc !important; }
      `}</style>

      {/* ── Hero Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)',
        padding: '2rem 2.5rem', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.55, marginBottom: '0.4rem' }}>
              Your Trip Itinerary
            </p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
              {destination}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                `📅 ${duration} days`,
                `👥 ${travelType}`,
                startDate ? `🗓 ${startDate} → ${endDate}` : null,
              ].filter(Boolean).map(t => (
                <span key={t} style={{ fontSize: '0.78rem', opacity: 0.75 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ── Save Button ── */}
          {!saved ? (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                background: saving ? 'rgba(255,255,255,0.2)' : 'white',
                color: '#0d1b2a', border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              {saving ? (
                <>
                  <div style={{ width: '12px', height: '12px', border: '2px solid #ccc', borderTop: '2px solid #0d1b2a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save Trip
                </>
              )}
            </button>
          ) : (
            <div style={{ padding: '0.75rem 1.5rem', background: '#22c55e', color: 'white', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Saved!
            </div>
          )}
        </div>

        {/* Save error message */}
        {saveError && (
          <div style={{ marginTop: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: '0.75rem', color: '#fca5a5', margin: 0 }}>{saveError}</p>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Overview */}
        {safeOverview && (
          <div style={{ background: 'white', border: '1px solid #eee', padding: '1.5rem', marginBottom: '1.5rem', animation: 'fadeUp 0.4s ease' }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Trip Overview</p>
            <p style={{ fontSize: '0.88rem', color: '#444', lineHeight: 1.8 }}>{safeOverview}</p>
          </div>
        )}

        {/* Hotel + Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

          {/* Hotel */}
          {hotel && hotel.name && (
            <div style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', animation: 'fadeUp 0.4s ease 0.1s both' }}>
              <div style={{ height: '140px', overflow: 'hidden' }}>
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.3rem' }}>Your Hotel</p>
                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1b2a', marginBottom: '0.2rem' }}>{hotel.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.75rem' }}>📍 {hotel.location}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>★ {hotel.rating}</span>
                  <span style={{ fontSize: '0.75rem', color: '#0d1b2a', fontWeight: 600 }}>{hotel.tier}</span>
                  <span style={{ fontSize: '0.75rem', color: '#555' }}>
                    ৳{hotel.priceMin?.toLocaleString()} – ৳{hotel.priceMax?.toLocaleString()}/night
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {(hotel.amenities || []).map(a => (
                    <span key={a} style={{ fontSize: '0.62rem', background: '#f0f4f8', color: '#444', padding: '0.2rem 0.5rem', fontWeight: 600 }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Budget Breakdown */}
          {Object.keys(safeBudget).length > 0 && (
            <div style={{ background: 'white', border: '1px solid #eee', padding: '1.25rem', animation: 'fadeUp 0.4s ease 0.15s both' }}>
              <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Budget Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { label: '🏨 Hotel',      key: 'hotel',      color: '#3b82f6' },
                  { label: '🍽 Food',       key: 'food',       color: '#f59e0b' },
                  { label: '🚗 Transport',  key: 'transport',  color: '#8b5cf6' },
                  { label: '🎯 Activities', key: 'activities', color: '#22c55e' },
                ].map(item => {
                  const val   = safeBudget[item.key] || 0;
                  const total = safeBudget.total || 1;
                  const pct   = Math.round((val / total) * 100);
                  return (
                    <div key={item.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#555' }}>{item.label}</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d1b2a' }}>৳{val.toLocaleString()}</span>
                      </div>
                      <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '3px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '2px solid #0d1b2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0d1b2a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0d1b2a' }}>৳{(safeBudget.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Day-by-Day Itinerary */}
        {days.length > 0 && (
          <div style={{ marginBottom: '1.5rem', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0d1b2a' }}>
              Day-by-Day Itinerary
            </h2>

            {/* Day tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {days.map((d, i) => (
                <button
                  key={i}
                  className="day-btn"
                  onClick={() => setActiveDay(i)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: activeDay === i ? '#0d1b2a' : 'white',
                    color:      activeDay === i ? 'white'   : '#555',
                    border:     activeDay === i ? '1.5px solid #0d1b2a' : '1px solid #ddd',
                    cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.06em', fontFamily: 'Montserrat, sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  Day {d.day}
                </button>
              ))}
            </div>

            {/* Active day */}
            {currentDay && (
              <div key={activeDay} style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: '#0d1b2a', padding: '1.25rem 1.5rem', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.62rem', opacity: 0.55, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Day {currentDay.day}</p>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{currentDay.title}</h3>
                      {currentDay.theme && <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>{currentDay.theme}</p>}
                    </div>
                    {currentDay.estimatedDailyCost && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.62rem', opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Est. Daily Cost</p>
                        <p style={{ fontSize: '1rem', fontWeight: 800 }}>৳{currentDay.estimatedDailyCost.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {(currentDay.activities || []).map((act, i) => {
                    const t = typeColors[act.type] || typeColors.leisure;
                    return (
                      <div
                        key={i}
                        className="activity-row"
                        style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', alignItems: 'flex-start', transition: 'background 0.15s' }}
                      >
                        <div style={{ minWidth: '72px', fontSize: '0.72rem', fontWeight: 700, color: '#888', paddingTop: '0.15rem' }}>{act.time}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0d1b2a', flexShrink: 0 }} />
                          {i < (currentDay.activities.length - 1) && (
                            <div style={{ width: '1px', height: '100%', minHeight: '24px', background: '#e5e5e5', margin: '3px 0' }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a' }}>{act.activity}</p>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '0.15rem 0.45rem', background: t.bg, color: t.color, borderRadius: '2px' }}>{t.label}</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#666', lineHeight: 1.6 }}>{act.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Travel Tips */}
        {safeTips.length > 0 && (
          <div style={{ animation: 'fadeUp 0.4s ease 0.25s both' }}>
            <h2 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0d1b2a' }}>
              Travel Tips &amp; Advice
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {safeTips.map((tip, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #eee', padding: '1.25rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '0.5rem' }}>
                    {tip.category}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.7 }}>{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0d1b2a', padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.5rem', zIndex: 50,
      }}>
        <div style={{ color: 'white', fontSize: '0.8rem' }}>
          <span style={{ opacity: 0.6 }}>Total Budget: </span>
          <strong>৳{(safeBudget?.total || 0).toLocaleString()}</strong>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => router.back()}
            style={{ padding: '0.65rem 1.25rem', background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
          >
            Customize Again
          </button>
          <button
            onClick={() => router.push('/Dashboard')}
            style={{ padding: '0.65rem 1.25rem', background: 'white', color: '#0d1b2a', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}