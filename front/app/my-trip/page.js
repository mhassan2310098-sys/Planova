'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const BOOKING_STATUS = {
  pending:           { bg: '#fff7ed', color: '#c2410c', label: '⏳ Booking Pending',     dot: '#f97316' },
  payment_requested: { bg: '#eff6ff', color: '#1d4ed8', label: '💳 Payment Required',    dot: '#3b82f6' },
  paid:              { bg: '#faf5ff', color: '#7e22ce', label: '🔄 Awaiting Confirmation', dot: '#a855f7' },
  confirmed:         { bg: '#f0fdf4', color: '#15803d', label: '✅ Booking Confirmed',    dot: '#22c55e' },
  cancelled:         { bg: '#fff0f0', color: '#cc0000', label: '❌ Cancelled',            dot: '#ef4444' },
};

const PAYMENT_METHODS = [
  { id: 'bkash',  label: 'bKash',         logo: '🟣', number_label: 'bKash Number' },
  { id: 'nagad',  label: 'Nagad',          logo: '🟠', number_label: 'Nagad Number' },
  { id: 'rocket', label: 'Rocket (DBBL)',  logo: '🟣', number_label: 'Rocket Number' },
  { id: 'bank',   label: 'Bank Transfer',  logo: '🏦', number_label: 'Account Number' },
];

// Generate dummy but destination-consistent emergency info
const getEmergencyInfo = (destination) => {
  const city = destination?.split(',')[0]?.trim() || 'the city';
  return {
    police:    '999',
    ambulance: '199',
    fire:      '199',
    hospitals: [
      { name: `${city} General Hospital`,    address: `12 Hospital Road, ${city}`,         phone: '+880 1711-000001' },
      { name: `${city} Medical Centre`,      address: `45 Health Avenue, ${city}`,         phone: '+880 1711-000002' },
      { name: `Central Clinic ${city}`,      address: `8 Clinic Lane, Central ${city}`,    phone: '+880 1711-000003' },
    ],
    emergency_contacts: [
      { label: 'Local Tourism Helpline', number: '+880 1800-000100' },
      { label: 'Hotel Front Desk (24h)', number: '+880 1711-100200' },
      { label: 'Planova Support',        number: '+880 1700-657656' },
    ],
  };
};

export default function MyTripsPage() {
  const router = useRouter();
  const [trips, setTrips]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [deleting, setDeleting]     = useState(null);

  // bookings: { [tripId]: bookingObject }
  const [bookings, setBookings]     = useState({});

  // payment modal
  const [payModal, setPayModal]     = useState(null); // booking object
  const [payMethod, setPayMethod]   = useState('bkash');
  const [payName, setPayName]       = useState('');
  const [payNumber, setPayNumber]   = useState('');
  const [paying, setPaying]         = useState(false);
  const [payError, setPayError]     = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchTrips(token);
    // Pre-fill name from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) setPayName(user.name);
  }, []);

  const fetchTrips = async (token) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/trip/my-trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setTrips(json.trips);
        fetchAllBookings(json.trips, token);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAllBookings = async (trips, token) => {
    const results = {};
    await Promise.all(
      trips.map(async (trip) => {
        try {
          const res  = await fetch(`${API}/booking/trip/${trip.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success && json.booking) {
            results[trip.id] = json.booking;
          }
        } catch (err) { /* silent */ }
      })
    );
    setBookings(results);
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
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const viewTrip = (trip) => {
    const hotel           = typeof trip.hotel === 'string' ? JSON.parse(trip.hotel || '{}') : (trip.hotel || {});
    const itineraryDays   = typeof trip.itinerary === 'string' ? JSON.parse(trip.itinerary || '[]') : (trip.itinerary || []);
    const budgetBreakdown = typeof trip.budget_breakdown === 'string' ? JSON.parse(trip.budget_breakdown || '{}') : (trip.budget_breakdown || {});
    const activities      = typeof trip.activities === 'string' ? JSON.parse(trip.activities || '[]') : (trip.activities || []);
    const tips            = typeof trip.tips === 'string' ? JSON.parse(trip.tips || '[]') : (trip.tips || []);

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

  // ── Payment ──
  const openPayModal = (booking) => {
    setPayModal(booking);
    setPayMethod('bkash');
    setPayError('');
    setPaySuccess(false);
    setPayNumber('');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setPayName(user.name || '');
  };

  const handlePay = async () => {
    if (!payName.trim())   { setPayError('Please enter your name.'); return; }
    if (!payNumber.trim()) { setPayError('Please enter your account/number.'); return; }
    setPaying(true);
    setPayError('');
    const token = localStorage.getItem('token');
    try {
      const res  = await fetch(`${API}/booking/${payModal.id}/pay`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ method: payMethod, name: payName, number: payNumber }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Payment failed.');
      setPaySuccess(true);
      setBookings(prev => ({
        ...prev,
        [payModal.trip_id]: { ...prev[payModal.trip_id], status: 'paid', payment_status: 'paid' },
      }));
      setTimeout(() => setPayModal(null), 2000);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '60px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .trip-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.09) !important; }
        .trip-card { transition: box-shadow 0.2s !important; }
        .pay-method:hover { border-color: #0d1b2a !important; }
        .emergency-row:hover { background: #f9f9f9 !important; }
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
        <p style={{ fontSize: '0.82rem', opacity: 0.65 }}>All your saved trips and booking statuses</p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#888' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            Loading your trips...
          </div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', border: '1px solid #eee' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0d1b2a', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>No Trips Yet</h2>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>Start planning your first adventure and save it here.</p>
            <button onClick={() => router.push('/Newtrip')} style={{ padding: '0.85rem 2rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
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
              const booking         = bookings[trip.id];
              const bStatus         = booking ? (BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending) : null;
              const emergency       = getEmergencyInfo(trip.destination);

              return (
                <div key={trip.id} className="trip-card" style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden', animation: `fadeUp 0.3s ease ${idx * 0.05}s both` }}>

                  {/* ── Card Header ── */}
                  <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>

                    {/* Initial badge */}
                    <div style={{ width: '52px', height: '52px', background: '#0d1b2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 900, flexShrink: 0 }}>
                      {trip.destination?.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d1b2a' }}>{trip.destination}</h3>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.55rem', background: '#eff6ff', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {trip.status || 'upcoming'}
                        </span>
                        {bStatus && (
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.65rem', background: bStatus.bg, color: bStatus.color, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bStatus.dot, display: 'inline-block', animation: booking?.status === 'payment_requested' ? 'pulse 1.5s infinite' : 'none' }} />
                            {bStatus.label}
                          </span>
                        )}
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
                    <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0, flexWrap: 'wrap' }}>
                      {booking?.status === 'payment_requested' && (
                        <button
                          onClick={() => openPayModal(booking)}
                          style={{ padding: '0.6rem 1.1rem', background: '#1d4ed8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', animation: 'pulse 2s infinite' }}
                        >
                          💳 PAY ৳{Number(booking.payment_amount).toLocaleString()}
                        </button>
                      )}
                      <button onClick={() => viewTrip(trip)} style={{ padding: '0.6rem 1.1rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                        View Plan
                      </button>
                      <button onClick={() => setExpanded(isOpen ? null : trip.id)} style={{ padding: '0.6rem 0.9rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                        {isOpen ? 'Less ▲' : 'Details ▼'}
                      </button>
                      <button onClick={() => handleDelete(trip.id)} disabled={deleting === trip.id} style={{ padding: '0.6rem 0.75rem', background: 'transparent', color: '#e53e3e', border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }} title="Delete trip">
                        {deleting === trip.id ? (
                          <div style={{ width: '12px', height: '12px', border: '2px solid #fca5a5', borderTop: '2px solid #e53e3e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Booking status bar ── */}
                  {booking && (
                    <div style={{ background: bStatus.bg, borderTop: `1px solid ${bStatus.dot}22`, padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: bStatus.color }}>{bStatus.label}</span>
                        {booking.hotel_name && <span style={{ fontSize: '0.72rem', color: '#555' }}>🏨 {booking.hotel_name}</span>}
                        {booking.payment_amount && (
                          <span style={{ fontSize: '0.72rem', color: '#555' }}>
                            Amount: <strong style={{ color: '#0d1b2a' }}>৳{Number(booking.payment_amount).toLocaleString()}</strong>
                            {booking.payment_note && ` — ${booking.payment_note}`}
                          </span>
                        )}
                      </div>
                      {booking.status === 'payment_requested' && (
                        <button
                          onClick={() => openPayModal(booking)}
                          style={{ padding: '0.4rem 1rem', background: '#1d4ed8', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  )}

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
                              <p style={{ fontSize: '0.75rem', color: '#555' }}>★ {hotel.rating} · {hotel.tier}</p>
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

                      {trip.overview && (
                        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #eee' }}>
                          <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem' }}>Overview</p>
                          <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.75 }}>{trip.overview}</p>
                        </div>
                      )}

                      {/* ── Emergency & Safety Info ── */}
                      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '2px solid #fee2e2' }}>
                        <p style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🚨 Emergency & Safety Info
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>

                          {/* National emergency numbers */}
                          <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>National Numbers</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {[
                                { icon: '🚔', label: 'Police',    number: emergency.police    },
                                { icon: '🚑', label: 'Ambulance', number: emergency.ambulance },
                                { icon: '🚒', label: 'Fire',      number: emergency.fire      },
                              ].map(e => (
                                <div key={e.label} className="emergency-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.6rem', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '2px' }}>
                                  <span style={{ fontSize: '0.75rem', color: '#555' }}>{e.icon} {e.label}</span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#dc2626', letterSpacing: '0.06em' }}>{e.number}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Nearby hospitals */}
                          <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>Nearby Hospitals</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {emergency.hospitals.map((h, i) => (
                                <div key={i} style={{ padding: '0.5rem 0.65rem', background: 'white', border: '1px solid #e5e5e5', borderLeft: '3px solid #dc2626' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d1b2a', marginBottom: '0.15rem' }}>🏥 {h.name}</p>
                                  <p style={{ fontSize: '0.68rem', color: '#888', marginBottom: '0.15rem' }}>📍 {h.address}</p>
                                  <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#dc2626' }}>📞 {h.phone}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Emergency contacts */}
                          <div>
                            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '0.6rem' }}>Emergency Contacts</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {emergency.emergency_contacts.map((c, i) => (
                                <div key={i} className="emergency-row" style={{ padding: '0.5rem 0.65rem', background: 'white', border: '1px solid #e5e5e5', borderLeft: '3px solid #f97316' }}>
                                  <p style={{ fontSize: '0.72rem', color: '#666', marginBottom: '0.15rem' }}>{c.label}</p>
                                  <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c2410c' }}>📞 {c.number}</p>
                                </div>
                              ))}
                              <div style={{ padding: '0.5rem 0.65rem', background: '#fff7ed', border: '1px solid #fed7aa', borderLeft: '3px solid #f97316', marginTop: '0.25rem' }}>
                                <p style={{ fontSize: '0.65rem', color: '#92400e', lineHeight: 1.5 }}>
                                  ⚠️ <strong>Note:</strong> Always save these numbers offline before traveling. Numbers marked with * are operational 24/7.
                                </p>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                      {/* ── End Emergency Info ── */}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => router.push('/Newtrip')}
              style={{ padding: '0.9rem 2.5rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1a3a5c'}
              onMouseLeave={e => e.currentTarget.style.background = '#0d1b2a'}
            >
              + Plan Another Trip
            </button>
          </div>
        )}
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '460px', animation: 'fadeUp 0.25s ease' }}>

            <div style={{ background: '#0d1b2a', padding: '1.25rem 1.5rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.62rem', opacity: 0.6, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Complete Payment</p>
                <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{payModal.hotel_name}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.62rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Amount</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 900 }}>৳{Number(payModal.payment_amount).toLocaleString()}</p>
              </div>
            </div>

            {payModal.payment_note && (
              <div style={{ background: '#f0f4ff', padding: '0.65rem 1.5rem', fontSize: '0.78rem', color: '#444', borderBottom: '1px solid #e5e5e5' }}>
                📝 {payModal.payment_note}
              </div>
            )}

            <div style={{ padding: '1.5rem' }}>
              {paySuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#15803d', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Submitted!</h3>
                  <p style={{ fontSize: '0.82rem', color: '#555' }}>Waiting for hotel confirmation.</p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.75rem' }}>Select Payment Method</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {PAYMENT_METHODS.map(m => (
                      <button
                        key={m.id}
                        className="pay-method"
                        onClick={() => setPayMethod(m.id)}
                        style={{
                          padding: '0.75rem',
                          border: payMethod === m.id ? '2px solid #0d1b2a' : '1px solid #ddd',
                          background: payMethod === m.id ? '#0d1b2a' : 'white',
                          color: payMethod === m.id ? 'white' : '#333',
                          cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'Montserrat, sans-serif',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{m.logo}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{m.label}</div>
                      </button>
                    ))}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.4rem' }}>
                      Your Full Name <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={payName}
                      onChange={e => setPayName(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.4rem' }}>
                      {PAYMENT_METHODS.find(m => m.id === payMethod)?.number_label} <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={payMethod === 'bank' ? 'Account number' : '01XXXXXXXXX'}
                      value={payNumber}
                      onChange={e => setPayNumber(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {payError && (
                    <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: '0.78rem', padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
                      {payError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      style={{ flex: 1, padding: '0.9rem', background: paying ? '#999' : '#0d1b2a', color: 'white', border: 'none', cursor: paying ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {paying ? (
                        <><div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
                      ) : `Confirm Payment`}
                    </button>
                    <button
                      onClick={() => setPayModal(null)}
                      style={{ padding: '0.9rem 1.25rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}