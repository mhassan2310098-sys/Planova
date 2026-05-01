'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Tab Button ────────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      background: active ? '#0d1b2a' : 'white',
      color: active ? 'white' : '#888',
      borderBottom: active ? '2px solid #0d1b2a' : '2px solid transparent',
      transition: 'all 0.2s',
    }}>
      {label}
    </button>
  );
}

function activityColor(type) {
  if (type === 'food') return '#f59e0b';
  if (type === 'attraction') return '#3b82f6';
  if (type === 'travel') return '#a855f7';
  return '#22c55e';
}

// ── Skeleton Loader ───────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div style={{
      width, height, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
      borderRadius: '4px', ...style,
    }} />
  );
}

// ── Inner component ───────────────────────────────────────────────────────────
function SearchResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const destination = searchParams.get('destination') || '';
  const budgetMin = Number(searchParams.get('budgetMin') || 0);
  const budgetMax = Number(searchParams.get('budgetMax') || 50000);
  const duration = searchParams.get('duration') || '3';
  const travelType = searchParams.get('travelType') || 'solo';

  useEffect(() => {
    const fetchPlan = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${BACKEND_URL}/trip/plan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination, duration, travelType, budgetMin, budgetMax }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to fetch plan');
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const plan = data?.aiPlan;
  const hotels = data?.hotels || [];
  const recommendedHotel = data?.recommendedHotel;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '2rem 2.5rem', color: 'white' }}>
        <button onClick={() => router.push('/Newtrip')} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          BACK
        </button>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
          {destination}
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {[
            `📅 ${duration} days`,
            `👥 ${travelType.charAt(0).toUpperCase() + travelType.slice(1)}`,
            `💰 ৳${budgetMin.toLocaleString()} – ৳${budgetMax.toLocaleString()}`,
          ].map(tag => (
            <span key={tag} style={{ fontSize: '0.8rem', opacity: 0.85 }}>{tag}</span>
          ))}
        </div>

        {/* AI Overview */}
        {loading ? (
          <Skeleton height="16px" width="60%" style={{ marginTop: '0.5rem' }} />
        ) : plan?.overview ? (
          <p style={{ fontSize: '0.85rem', opacity: 0.8, maxWidth: '700px', lineHeight: 1.6, marginTop: '0.5rem' }}>
            ✨ {plan.overview}
          </p>
        ) : null}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: '0.82rem', padding: '0.75rem 1.5rem' }}>
          ⚠️ {error} — showing fallback results.
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '0 2rem', display: 'flex', gap: 0 }}>
        {[
          { key: 'itinerary', label: '🗓 Itinerary' },
          { key: 'hotels', label: '🏨 Hotels' },
          { key: 'budget', label: '💰 Budget' },
          { key: 'tips', label: '💡 Tips' },
        ].map(tab => (
          <Tab key={tab.key} label={tab.label} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} />
        ))}
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* ── ITINERARY TAB ── */}
        {activeTab === 'itinerary' && (
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0d1b2a', marginBottom: '1.5rem' }}>
              YOUR {duration}-DAY AI-GENERATED ITINERARY
            </h2>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #eee', marginBottom: '1.25rem', overflow: 'hidden' }}>
                  <div style={{ background: '#0d1b2a', padding: '1rem 1.5rem' }}>
                    <Skeleton height="14px" width="40%" style={{ background: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} height="14px" width={`${60 + j * 5}%`} />)}
                  </div>
                </div>
              ))
            ) : (
              plan?.days?.map(day => (
                <div key={day.day} style={{ background: 'white', border: '1px solid #eee', marginBottom: '1.25rem', overflow: 'hidden' }}>
                  <div style={{ background: '#0d1b2a', color: 'white', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>DAY {day.day}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, marginLeft: '1rem' }}>{day.title}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {day.theme && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '2px' }}>
                          {day.theme}
                        </span>
                      )}
                      {day.estimatedDailyCost && (
                        <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>~৳{day.estimatedDailyCost.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    {day.activities?.map((act, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: i < day.activities.length - 1 ? '1rem' : 0, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.72rem', color: '#999', width: '70px', flexShrink: 0, paddingTop: '2px' }}>{act.time}</span>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activityColor(act.type), marginTop: '5px', flexShrink: 0 }} />
                          <div>
                            <span style={{ fontSize: '0.85rem', color: '#111', fontWeight: 600 }}>{act.activity}</span>
                            {act.description && (
                              <p style={{ fontSize: '0.78rem', color: '#888', margin: '2px 0 0' }}>{act.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              {[['food', '#f59e0b', 'Food'], ['attraction', '#3b82f6', 'Attraction'], ['leisure', '#22c55e', 'Leisure'], ['travel', '#a855f7', 'Travel']].map(([type, color, label]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '0.72rem', color: '#888' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {activeTab === 'hotels' && (
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0d1b2a', marginBottom: '0.5rem' }}>
              HOTELS IN {destination.toUpperCase()}
            </h2>

            {/* AI Recommended */}
            {!loading && recommendedHotel && (
              <div style={{ background: '#f0f7ff', border: '1px solid #bde0ff', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>✨</span>
                <p style={{ fontSize: '0.82rem', color: '#0d1b2a' }}>
                  <strong>AI Recommends:</strong> {recommendedHotel.name} — best fit for your budget & travel type
                </p>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden' }}>
                    <Skeleton height="160px" style={{ borderRadius: 0 }} />
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <Skeleton height="12px" width="40%" />
                      <Skeleton height="16px" width="80%" />
                      <Skeleton height="12px" width="60%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                {hotels.map(hotel => (
                  <div key={hotel.id} style={{
                    background: 'white', border: hotel.id === recommendedHotel?.id ? '2px solid #0d1b2a' : '1px solid #eee',
                    overflow: 'hidden', position: 'relative',
                    transition: 'box-shadow 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {hotel.id === recommendedHotel?.id && (
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#0d1b2a', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '3px 8px', letterSpacing: '0.08em', zIndex: 1 }}>
                        ✨ AI PICK
                      </div>
                    )}
                    <img src={hotel.img} alt={hotel.name} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#888', textTransform: 'uppercase' }}>{hotel.tier}</span>
                        <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>★ {hotel.rating}</span>
                      </div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b2a', margin: '0 0 0.3rem' }}>{hotel.name}</p>
                      <p style={{ fontSize: '0.72rem', color: '#999', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        📍 {hotel.location}
                      </p>

                      {/* Recommended Room */}
                      {hotel.recommendedRoom && (
                        <div style={{ background: '#f9f9f9', padding: '0.6rem 0.75rem', marginBottom: '0.75rem', border: '1px solid #eee' }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#555', marginBottom: '2px' }}>{hotel.recommendedRoom.type}</p>
                          <p style={{ fontSize: '0.72rem', color: '#888' }}>{hotel.recommendedRoom.beds} · up to {hotel.recommendedRoom.guests} guests</p>
                          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d1b2a', marginTop: '3px' }}>৳{hotel.recommendedRoom.price.toLocaleString()}/night</p>
                        </div>
                      )}

                      {/* Amenities */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '0.75rem' }}>
                        {hotel.amenities.slice(0, 3).map(a => (
                          <span key={a} style={{ fontSize: '0.6rem', background: '#f0f0f0', padding: '2px 6px', color: '#555' }}>✔ {a}</span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>From</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d1b2a' }}>৳{hotel.priceMin.toLocaleString()}/night</span>
                      </div>

                      <button style={{ width: '100%', padding: '0.6rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'Montserrat, sans-serif' }}>
                        BOOK NOW
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === 'budget' && (
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0d1b2a', marginBottom: '1.5rem' }}>
              BUDGET BREAKDOWN
            </h2>

            {loading ? (
              <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height="40px" />)}
              </div>
            ) : plan?.budgetBreakdown ? (
              <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem' }}>
                {Object.entries(plan.budgetBreakdown).filter(([k]) => k !== 'total').map(([key, value]) => {
                  const total = plan.budgetBreakdown.total || 1;
                  const pct = Math.round((value / total) * 100);
                  const colors = { hotel: '#3b82f6', food: '#f59e0b', transport: '#a855f7', activities: '#22c55e' };
                  const labels = { hotel: '🏨 Hotel', food: '🍽 Food', transport: '🚗 Transport', activities: '🎯 Activities' };
                  return (
                    <div key={key} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0d1b2a' }}>{labels[key] || key}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0d1b2a' }}>৳{Number(value).toLocaleString()} ({pct}%)</span>
                      </div>
                      <div style={{ background: '#f0f0f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: colors[key] || '#0d1b2a', borderRadius: '4px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: '2px solid #0d1b2a', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0d1b2a' }}>TOTAL ESTIMATE</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1b2a' }}>৳{Number(plan.budgetBreakdown.total).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.75rem' }}>
                  Your budget: ৳{budgetMin.toLocaleString()} – ৳{budgetMax.toLocaleString()} &nbsp;|&nbsp;
                  {plan.budgetBreakdown.total <= budgetMax
                    ? <span style={{ color: '#22c55e', fontWeight: 600 }}>✔ Within budget!</span>
                    : <span style={{ color: '#e53e3e', fontWeight: 600 }}>⚠ Slightly over budget</span>
                  }
                </p>
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '0.85rem' }}>No budget data available.</p>
            )}
          </div>
        )}

        {/* ── TIPS TAB ── */}
        {activeTab === 'tips' && (
          <div>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.1em', color: '#0d1b2a', marginBottom: '1.5rem' }}>
              AI TRAVEL TIPS FOR {destination.toUpperCase()}
            </h2>

            {loading ? (
              <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height="60px" />)}
              </div>
            ) : plan?.tips?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plan.tips.map((tip, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #eee', padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', background: '#0d1b2a', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.7 }}>{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#888', fontSize: '0.85rem' }}>No tips available.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', color: '#888' }}>Loading results...</div>}>
      <SearchResultsInner />
    </Suspense>
  );
}