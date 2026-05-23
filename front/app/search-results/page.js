'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function SearchResultsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const destination = searchParams.get('destination') || '';
  const duration = searchParams.get('duration') || '3';
  const travelType = searchParams.get('travelType') || 'solo';
  const budgetMin = searchParams.get('budgetMin') || '0';
  const budgetMax = searchParams.get('budgetMax') || '50000';

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/trip/destination-info?destination=${encodeURIComponent(destination)}`);
        const json = await res.json();
        console.log('API RESPONSE:', JSON.stringify(json)); // ← add this
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (destination) fetchInfo();
  }, [destination]);

  const info = data?.info;

  const handleCustomize = () => {
    const params = new URLSearchParams({ destination, duration, travelType, budgetMin, budgetMax });
    router.push(`/customize-trip?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '2rem 2.5rem', color: 'white' }}>
        <button onClick={() => router.push('/Newtrip')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK
        </button>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          {destination}
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[`📅 ${duration} days`, `👥 ${travelType.charAt(0).toUpperCase() + travelType.slice(1)} trip`, `💰 ৳${Number(budgetMin).toLocaleString()} – ৳${Number(budgetMax).toLocaleString()}`].map(t => (
            <span key={t} style={{ fontSize: '0.82rem', opacity: 0.85 }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading destination info...
          </div>
          // After the loading check, add:
          ) : data && !data.success && data.error ? (
         <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
         <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
         <h2 style={{ color: '#0d1b2a', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
         Destination Not Found
         </h2>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>{data.error}</p>
         <button onClick={() => router.push('/new-trip')} style={{
         padding: '0.75rem 2rem', background: '#0d1b2a', color: 'white',
         border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800,
         letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif'
         }}>
         Try Another Destination
       </button>
      </div>
  // ← END OF ADDED BLOCK
        ) : (
          <>
            {/* ABOUT */}
            {info && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem' }}>
                  ABOUT {destination.toUpperCase()}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#555', lineHeight: 1.8, maxWidth: '800px' }}>{info.about}</p>
              </div>
            )}

            {/* FAMOUS ATTRACTIONS */}
            {info?.attractions && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1.5rem' }}>
                  FAMOUS ATTRACTIONS
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {info.attractions.map(a => (
                    <div key={a.name} style={{ background: 'white', border: '1px solid #eee', padding: '1.5rem', transition: 'box-shadow 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{a.emoji}</div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0d1b2a', marginBottom: '0.3rem' }}>{a.name}</p>
                      <p style={{ fontSize: '0.78rem', color: '#888' }}>{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WHAT YOU CAN DO */}
            {info?.activities && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1.5rem' }}>
                  WHAT YOU CAN DO
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {info.activities.map((act, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', border: '1px solid #eee', padding: '1rem 1.25rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                      <span style={{ fontSize: '0.85rem', color: '#333' }}>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HOW TO GET THERE */}
            {info?.transport && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1.5rem' }}>
                  HOW TO GET THERE
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {info.transport.map(t => (
                    <div key={t.mode} style={{ background: 'white', border: '1px solid #eee', padding: '1.5rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t.emoji}</div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: '#0d1b2a', marginBottom: '0.5rem' }}>{t.mode}</p>
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem', lineHeight: 1.6 }}>{t.desc}</p>
                      <p style={{ fontSize: '0.78rem', color: '#555' }}>
                        <strong>Duration:</strong> {t.duration} &bull; <strong>Cost:</strong> {t.cost}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUICK FACTS */}
            {info && (
              <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1.5rem' }}>
                  QUICK FACTS
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  {[
                    { label: '🌤 Best Time to Visit', value: info.bestTime },
                    { label: '🌡 Weather', value: info.weather },
                  ].map(f => (
                    <div key={f.label}>
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{f.label}</p>
                      <p style={{ fontSize: '0.88rem', color: '#333' }}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0d1b2a', padding: '1.25rem 2rem', zIndex: 50 }}>
        <button onClick={handleCustomize} style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto', padding: '1rem', background: 'white', color: '#0d1b2a', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          CUSTOMIZE YOUR TRIP PLAN
        </button>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', color: '#888' }}>Loading...</div>}>
      <SearchResultsInner />
    </Suspense>
  );
}