'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function CustomizeTripInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = searchParams.get('destination') || '';
  const duration    = searchParams.get('duration') || '3';
  const travelType  = searchParams.get('travelType') || 'solo';
  const budgetMin   = searchParams.get('budgetMin') || '0';
  const budgetMax   = searchParams.get('budgetMax') || '50000';

  const [hotels, setHotels]                         = useState([]);
  const [destInfo, setDestInfo]                     = useState(null);
  const [selectedHotel, setSelectedHotel]           = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [startDate, setStartDate]                   = useState('');
  const [endDate, setEndDate]                       = useState('');
  const [loading, setLoading]                       = useState(true);
  const [generating, setGenerating]                 = useState(false);
  const [error, setError]                           = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res       = await fetch(`${API}/trip/destination-info?destination=${encodeURIComponent(destination)}`);
        const json      = await res.json();
        const hotelList = json.hotels || [];
        setHotels(hotelList);
        setDestInfo(json.info);
        if (hotelList.length > 0) setSelectedHotel(hotelList[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load destination data.');
      } finally {
        setLoading(false);
      }
    };
    if (destination) load();
  }, [destination]);

  const toggleActivity = (act) => {
    setSelectedActivities(prev =>
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const handleGenerate = async () => {
    if (!selectedHotel) { setError('Please select a hotel.'); return; }
    setError('');
    setGenerating(true);

    try {
      // Step 1: Generate itinerary
      const genRes  = await fetch(`${API}/trip/generate-itinerary`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration:           Number(duration),
          travelType,
          budgetMin:          Number(budgetMin),
          budgetMax:          Number(budgetMax),
          hotelName:          selectedHotel.name,
          selectedActivities: selectedActivities,
          startDate,
          endDate,
        }),
      });
      const genJson = await genRes.json();
      if (!genJson.success) throw new Error(genJson.error || 'Generation failed');

      const itinerary = genJson.itinerary;

      // Step 2: Auto-save to DB
      const token = localStorage.getItem('token');
      let savedTripId = null;

      if (token) {
        try {
          const savePayload = {
            destination,
            duration:        Number(duration),
            travelType,
            budgetMin:       Number(budgetMin),
            budgetMax:       Number(budgetMax),
            startDate:       startDate || null,
            endDate:         endDate   || null,
            hotel:           selectedHotel,
            activities:      selectedActivities,
            itinerary:       itinerary.days            || [],
            budgetBreakdown: itinerary.budgetBreakdown || {},
            overview:        itinerary.overview        || '',
            tips:            itinerary.tips            || [],
          };

          const saveRes  = await fetch(`${API}/trip/save`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(savePayload),
          });

          const saveText = await saveRes.text();
          let saveJson;
          try { saveJson = JSON.parse(saveText); } catch { saveJson = {}; }

          if (saveRes.ok && saveJson.success) {
            savedTripId = saveJson.trip?.id || null;
            console.log('Trip saved, id:', savedTripId);
          }
        } catch (saveErr) {
          console.error('Save error:', saveErr.message);
        }

        // Step 2b: Auto-book ONLY if hotel is from DB and trip was saved successfully
        if (selectedHotel?.fromDB && savedTripId) {
          try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');

            // Strip the "db_" prefix to get the real integer listing ID
            const rawId = String(selectedHotel.id).replace('db_', '');
            const listingId = Number(rawId);

            if (!isNaN(listingId) && listingId > 0) {
              const bookRes = await fetch(`${API}/booking/auto-book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  hotel_listing_id: listingId,         // real integer, e.g. 5 (not "db_5")
                  hotel_name:       selectedHotel.name,
                  trip_id:          savedTripId,        // confirmed trip ID from DB
                  guest_name:       user.name  || 'Guest',
                  guest_email:      user.email || '',
                  check_in:         startDate  || null,
                  check_out:        endDate    || null,
                  guests:           1,
                }),
              });
              const bookJson = await bookRes.json();
              if (bookJson.success && !bookJson.skipped) {
                console.log('Auto-booking created:', bookJson.booking?.id);
              } else {
                console.log('Auto-book skipped:', bookJson.reason);
              }
            } else {
              console.warn('Invalid listing ID, skipping auto-book:', selectedHotel.id);
            }
          } catch (bookErr) {
            console.error('Auto-book error (non-fatal):', bookErr.message);
          }
        } else if (selectedHotel?.fromDB && !savedTripId) {
          console.warn('Trip save failed — skipping auto-book to avoid orphaned booking.');
        }
      }

      // Step 3: Store in sessionStorage and navigate
      sessionStorage.setItem('currentTrip', JSON.stringify({
        destination, duration, travelType, budgetMin, budgetMax,
        startDate, endDate,
        hotel:           selectedHotel,
        activities:      selectedActivities,
        itinerary:       itinerary,
        overview:        itinerary.overview,
        budgetBreakdown: itinerary.budgetBreakdown,
        tips:            itinerary.tips,
      }));

      router.push('/my-trip');

    } catch (err) {
      console.error('Generate error:', err);
      setError('Failed to generate itinerary. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const tierColor = (tier) => {
    if (!tier) return '#888';
    const t = tier.toLowerCase();
    if (t.includes('ultra'))  return '#b8860b';
    if (t.includes('luxury')) return '#1a3a5c';
    if (t.includes('mid'))    return '#2d6a4f';
    return '#555';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '100px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .hotel-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10) !important; transform: translateY(-2px); }
        .hotel-card { transition: all 0.2s ease !important; }
        .activity-card:hover { border-color: #0d1b2a !important; }
        .activity-card { transition: all 0.15s ease !important; }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '2rem 2.5rem', color: 'white' }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontFamily: 'Montserrat, sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK
        </button>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Customize Your Trip
        </h1>
        <p style={{ fontSize: '0.85rem', opacity: 0.75, marginBottom: '0.75rem' }}>
          {destination} &bull; {duration} days &bull; {travelType.charAt(0).toUpperCase() + travelType.slice(1)}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.12)', padding: '0.3rem 0.75rem', borderRadius: '2px' }}>
            💰 Budget: ৳{Number(budgetMin).toLocaleString()} – ৳{Number(budgetMax).toLocaleString()}
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#888' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          Loading hotels &amp; activities...
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {error && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: '0.8rem', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

            {/* Hotels */}
            <div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0d1b2a' }}>
                Select Hotel
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {hotels.length === 0 && <p style={{ fontSize: '0.85rem', color: '#888' }}>No hotels found for this destination.</p>}
                {hotels.map(hotel => {
                  const isSelected = selectedHotel?.id === hotel.id;
                  return (
                    <div
                      key={hotel.id}
                      className="hotel-card"
                      onClick={() => setSelectedHotel(hotel)}
                      style={{ background: 'white', border: isSelected ? '2px solid #0d1b2a' : '1px solid #e5e5e5', padding: '0', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                    >
                      <div style={{ height: '130px', overflow: 'hidden', position: 'relative' }}>
                        <img src={hotel.img} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: tierColor(hotel.tier), color: 'white', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.2rem 0.5rem', textTransform: 'uppercase' }}>
                          {hotel.tier}
                        </span>
                        {hotel.fromDB && (
                          <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: '#15803d', color: 'white', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.15rem 0.45rem', textTransform: 'uppercase' }}>
                            ✓ Listed Hotel
                          </span>
                        )}
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#0d1b2a', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '0.9rem 1rem' }}>
                        <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0d1b2a', marginBottom: '0.2rem' }}>{hotel.name}</p>
                        <p style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.6rem' }}>📍 {hotel.location}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>★ {hotel.rating}</span>
                          <span style={{ fontSize: '0.75rem', color: '#0d1b2a', fontWeight: 700 }}>৳{hotel.priceMin.toLocaleString()} – ৳{hotel.priceMax.toLocaleString()}/night</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(hotel.amenities || []).slice(0, 3).map(a => (
                            <span key={a} style={{ fontSize: '0.62rem', background: '#f0f4f8', color: '#444', padding: '0.2rem 0.45rem', fontWeight: 600 }}>{a}</span>
                          ))}
                          {hotel.amenities?.length > 3 && <span style={{ fontSize: '0.62rem', color: '#888' }}>+{hotel.amenities.length - 3} more</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0d1b2a' }}>
                Select Activities
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>Pick as many as you like — AI will fit them into your itinerary.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {(destInfo?.activities || []).map((act, i) => {
                  const isChecked = selectedActivities.includes(act);
                  return (
                    <div
                      key={i}
                      className="activity-card"
                      onClick={() => toggleActivity(act)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: isChecked ? '#0d1b2a' : 'white', border: isChecked ? '1.5px solid #0d1b2a' : '1px solid #e5e5e5', padding: '0.85rem 1rem', cursor: 'pointer' }}
                    >
                      <div style={{ width: '18px', height: '18px', border: `2px solid ${isChecked ? 'white' : '#ccc'}`, background: isChecked ? 'white' : 'transparent', borderRadius: '3px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isChecked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span style={{ fontSize: '0.82rem', color: isChecked ? 'white' : '#333', fontWeight: isChecked ? 600 : 400 }}>{act}</span>
                    </div>
                  );
                })}
                {(!destInfo?.activities || destInfo.activities.length === 0) && <p style={{ fontSize: '0.85rem', color: '#888' }}>No activities data available.</p>}
              </div>
            </div>

            {/* Dates + Summary + Generate */}
            <div style={{ position: 'sticky', top: '1.5rem' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #0d1b2a' }}>
                Travel Dates
              </h2>
              <div style={{ background: 'white', border: '1px solid #eee', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: '0.4rem' }}>Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#666', marginBottom: '0.4rem' }}>End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #ddd', fontSize: '0.85rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ background: '#0d1b2a', color: 'white', padding: '1.25rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.75rem' }}>Trip Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Destination', value: destination },
                    { label: 'Duration',    value: `${duration} days` },
                    { label: 'Travel Type', value: travelType.charAt(0).toUpperCase() + travelType.slice(1) },
                    { label: 'Hotel',       value: selectedHotel?.name || 'None selected' },
                    { label: 'Activities',  value: `${selectedActivities.length} selected` },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                      <span style={{ opacity: 0.6 }}>{item.label}</span>
                      <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-word' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ width: '100%', padding: '1rem', background: generating ? '#555' : '#0d1b2a', color: 'white', border: 'none', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                onMouseEnter={e => { if (!generating) e.currentTarget.style.background = '#1a3a5c'; }}
                onMouseLeave={e => { if (!generating) e.currentTarget.style.background = '#0d1b2a'; }}
              >
                {generating ? (
                  <>
                    <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Generate My Itinerary
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomizeTripPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'Montserrat, sans-serif', color: '#888' }}>Loading...</div>}>
      <CustomizeTripInner />
    </Suspense>
  );
}