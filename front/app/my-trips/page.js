'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null); // trip id expanded
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchTrips(token);
  }, []);

  const fetchTrips = async (token) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/trip/my-trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setTrips(json.trips);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    setDeleting(id);
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API}/trip/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(prev => prev.filter(t => t.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const viewTrip = (trip) => {
    // Store in sessionStorage so my-trip detail page can read it
    const hotel           = typeof trip.hotel === 'string' ? JSON.parse(trip.hotel) : (trip.hotel || {});
    const itineraryDays   = typeof trip.itinerary === 'string' ? JSON.parse(trip.itinerary) : (trip.itinerary || []);
    const budgetBreakdown = typeof trip.budget_breakdown === 'string' ? JSON.parse(trip.budget_breakdown) : (trip.budget_breakdown || {});
    const activities      = typeof trip.activities === 'string' ? JSON.parse(trip.activities) : (trip.activities || []);
    const tips            = typeof trip.tips === 'string' ? JSON.parse(trip.tips) : (trip.tips || []);

    sessionStorage.setItem('currentTrip', JSON.stringify({
      destination:     trip.destination,
      duration:        trip.duration,
      travelType:      trip.travel_type,
      budgetMin:       trip.budget_min,
      budgetMax:       trip.budget_max,
      startDate:       trip.start_date,
      endDate:         trip.end_date,
      hotel,
      activities,
      itinerary:       { days: itineraryDays, overview: trip.overview, budgetBreakdown, tips },
      overview:        trip.overview,
      budgetBreakdown,
      tips,
    }));
    router.push('/my-trip');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '60px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .trip-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; }
        .trip-card { transition: box-shadow 0.2s !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '2rem 2.5rem', color: 'white' }}>
        <button
          onClick={() => router.push('/Dashboard')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.65)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK TO DASHBOARD
        </button>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
          My Travel Plans
        </h1>
        <p style={{ fontSize: '0.82rem', opacity: 0.65 }}>All your saved trips in one place</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#888' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            Loading your trips...
          </div>
        ) : trips.length === 0 ? (
          /* ── Empty state ── */
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', border: '1px solid #eee' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1b2a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              No Trips Yet
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>
              Start planning your first adventure and save it here.
            </p>
            <button
              onClick={() => router.push('/new-trip')}
              style={{ padding: '0.85rem 2rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
            >
              Plan New Trip
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trips.map((trip, idx) => {
              const hotel           = typeof trip.hotel === 'string' ? JSON.parse(trip.hotel || '{}') : (trip.hotel || {});
              const budgetBreakdown = typeof trip.budget_breakdown === 'string' ? JSON.parse(trip.budget_breakdown || '{}') : (trip.budget_breakdown || {});
              const activities      = typeof trip.activities === 'string' ? JSON.parse(trip.activities || '[]') : (trip.activities || []);
              const isOpen          = expanded === trip.id;

              return (
                <div
                  key={trip.id}
                  className="trip-card"
                  style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', animation: `fadeUp 0.3s ease ${idx * 0.05}s both` }}
                >
                  {/* ── Card Header (always visible) ── */}
                  <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Destination initial badge */}
                    <div style={{ width: '52px', height: '52px', background: '#0d1b2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, flexShrink: 0, letterSpacing: '-0.02em' }}>
                      {trip.destination?.charAt(0).toUpperCase()}
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1b2a' }}>{trip.destination}</h3>
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                          background: trip.status === 'upcoming' ? '#eff6ff' : '#f0fdf4',
                          color: trip.status === 'upcoming' ? '#1d4ed8' : '#15803d',
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>
                          {trip.status || 'upcoming'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        {[
                          `📅 ${trip.duration} days`,
                          `👥 ${trip.travel_type}`,
                          trip.start_date ? `🗓 ${formatDate(trip.start_date)}` : null,
                          hotel.name ? `🏨 ${hotel.name}` : null,
                          `💰 ৳${(budgetBreakdown.total || trip.budget_max || 0).toLocaleString()}`,
                        ].filter(Boolean).map(t => (
                          <span key={t} style={{ fontSize: '0.75rem', color: '#666' }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                      <button
                        onClick={() => viewTrip(trip)}
                        style={{ padding: '0.6rem 1.1rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        View Plan
                      </button>
                      <button
                        onClick={() => setExpanded(isOpen ? null : trip.id)}
                        style={{ padding: '0.6rem 0.9rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {isOpen ? 'Less ▲' : 'Details ▼'}
                      </button>
                      <button
                        onClick={() => handleDelete(trip.id)}
                        disabled={deleting === trip.id}
                        style={{ padding: '0.6rem 0.75rem', background: 'transparent', color: '#e53e3e', border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
                        title="Delete trip"
                      >
                        {deleting === trip.id ? (
                          <div style={{ width: '12px', height: '12px', border: '2px solid #fca5a5', borderTop: '2px solid #e53e3e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Expandable Details ── */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid #f0f0f0', padding: '1.5rem', background: '#fafafa', animation: 'fadeUp 0.25s ease' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

                        {/* Hotel */}
                        <div>
                          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>Hotel</p>
                          {hotel.name ? (
                            <>
                              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a', marginBottom: '0.2rem' }}>{hotel.name}</p>
                              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem' }}>📍 {hotel.location}</p>
                              <p style={{ fontSize: '0.75rem', color: '#555' }}>★ {hotel.rating} &bull; {hotel.tier}</p>
                              <p style={{ fontSize: '0.75rem', color: '#555' }}>৳{hotel.priceMin?.toLocaleString()} – ৳{hotel.priceMax?.toLocaleString()}/night</p>
                            </>
                          ) : <p style={{ fontSize: '0.82rem', color: '#888' }}>—</p>}
                        </div>

                        {/* Budget */}
                        <div>
                          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>Budget Breakdown</p>
                          {Object.keys(budgetBreakdown).length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {[
                                { label: '🏨 Hotel', key: 'hotel' },
                                { label: '🍽 Food', key: 'food' },
                                { label: '🚗 Transport', key: 'transport' },
                                { label: '🎯 Activities', key: 'activities' },
                              ].map(item => (
                                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                  <span style={{ color: '#666' }}>{item.label}</span>
                                  <span style={{ fontWeight: 600, color: '#0d1b2a' }}>৳{(budgetBreakdown[item.key] || 0).toLocaleString()}</span>
                                </div>
                              ))}
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderTop: '1px solid #e5e5e5', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                                <span style={{ fontWeight: 800, color: '#0d1b2a' }}>TOTAL</span>
                                <span style={{ fontWeight: 800, color: '#0d1b2a' }}>৳{(budgetBreakdown.total || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ) : <p style={{ fontSize: '0.82rem', color: '#888' }}>—</p>}
                        </div>

                        {/* Activities */}
                        <div>
                          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>
                            Activities ({activities.length})
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {activities.slice(0, 5).map((a, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                                <span style={{ fontSize: '0.75rem', color: '#555' }}>{a}</span>
                              </div>
                            ))}
                            {activities.length > 5 && <p style={{ fontSize: '0.72rem', color: '#999' }}>+{activities.length - 5} more</p>}
                          </div>
                        </div>

                      </div>

                      {/* Overview */}
                      {trip.overview && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #eee' }}>
                          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem' }}>Overview</p>
                          <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.75 }}>{trip.overview}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Plan new trip CTA */}
        {!loading && trips.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => router.push('/new-trip')}
              style={{ padding: '0.9rem 2.5rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a5c'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d1b2a'}
            >
              + Plan Another Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}