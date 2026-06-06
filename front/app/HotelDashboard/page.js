'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const AMENITY_OPTIONS = [
  'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'WiFi',
  'Beach Access', 'Room Service', 'Laundry', 'Airport Shuttle', 'Conference Room',
];

const TIER_OPTIONS = ['Budget', 'Mid-Range', 'Luxury', 'Ultra Luxury', 'Unique/Cottage'];
const BEST_FOR_OPTIONS = ['solo', 'couple', 'family', 'group'];

const STATUS_STYLES = {
  pending:           { bg: '#fff7ed', color: '#c2410c', label: 'Pending' },
  payment_requested: { bg: '#eff6ff', color: '#1d4ed8', label: 'Payment Sent' },
  paid:              { bg: '#faf5ff', color: '#7e22ce', label: 'Paid' },
  confirmed:         { bg: '#f0fdf4', color: '#15803d', label: 'Confirmed' },
  cancelled:         { bg: '#fff0f0', color: '#cc0000', label: 'Cancelled' },
};

function Navbar({ hotel, onLogout }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'white', borderBottom: '1px solid #e5e5e5',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: '60px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0d1b2a' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span style={{ fontWeight: 700, letterSpacing: '0.1em', fontSize: '0.95rem' }}>PLANOVA</span>
        <span style={{ fontSize: '0.65rem', background: '#f0f4ff', border: '1px solid #c7d4f0', color: '#0d1b2a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.08em', marginLeft: '0.5rem' }}>
          HOTEL PORTAL
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#555' }}>👋 {hotel?.name}</span>
        <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#555' }} title="Logout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default function HotelDashboardPage() {
  const router = useRouter();
  const [hotel, setHotel] = useState(null);
  const [token, setToken] = useState('');
  const [tab, setTab] = useState('listings');

  // listings state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  // bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // form state
  const [editingListing, setEditingListing] = useState(null);
  const [form, setForm] = useState({
    name: '', location: '', city: '', description: '',
    price_min: '', price_max: '', tier: 'Mid-Range',
    amenities: [], img_url: '', best_for: ['solo', 'couple', 'family', 'group'],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // payment modal state
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const storedHotel = localStorage.getItem('hotel');
    const storedToken = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!storedHotel || !storedToken || role !== 'hotel') {
      router.push('/hotel-login');
      return;
    }
    setHotel(JSON.parse(storedHotel));
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchListings();
    fetchBookings();
  }, [token]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  });

  const fetchListings = async () => {
    setListingsLoading(true);
    try {
      const res = await fetch(`${API}/hotel-manager/listings`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setListings(json.listings);
    } catch (err) { console.error(err); }
    finally { setListingsLoading(false); }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API}/hotel-manager/bookings`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) setBookings(json.bookings);
    } catch (err) { console.error(err); }
    finally { setBookingsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('hotel');
    localStorage.removeItem('role');
    router.push('/hotel-login');
  };

  // ── Listing form ──
  const openAddForm = () => {
    setEditingListing(null);
    setForm({ name: '', location: '', city: '', description: '', price_min: '', price_max: '', tier: 'Mid-Range', amenities: [], img_url: '', best_for: ['solo', 'couple', 'family', 'group'] });
    setFormError('');
    setFormSuccess('');
    setTab('form');
  };

  const openEditForm = (listing) => {
    setEditingListing(listing);
    setForm({
      name: listing.name,
      location: listing.location,
      city: listing.city,
      description: listing.description || '',
      price_min: listing.price_min,
      price_max: listing.price_max,
      tier: listing.tier,
      amenities: listing.amenities || [],
      img_url: listing.img_url || '',
      best_for: listing.best_for || ['solo', 'couple', 'family', 'group'],
    });
    setFormError('');
    setFormSuccess('');
    setTab('form');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!form.name || !form.location || !form.city || !form.price_min || !form.price_max) {
      setFormError('Name, location, city, min price, and max price are required.');
      return;
    }
    setFormLoading(true);
    try {
      const url = editingListing
        ? `${API}/hotel-manager/listings/${editingListing.id}`
        : `${API}/hotel-manager/listings`;
      const method = editingListing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ ...form, price_min: Number(form.price_min), price_max: Number(form.price_max) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save.');
      setFormSuccess(editingListing ? 'Hotel updated successfully!' : 'Hotel added successfully!');
      fetchListings();
      setTimeout(() => setTab('listings'), 1200);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await fetch(`${API}/hotel-manager/listings/${id}`, { method: 'DELETE', headers: authHeaders() });
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (listing) => {
    try {
      const res = await fetch(`${API}/hotel-manager/listings/${listing.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...listing, is_active: !listing.is_active }),
      });
      const json = await res.json();
      if (json.success) fetchListings();
    } catch (err) { console.error(err); }
  };

  // ── Payment request ──
  const handleSendPayment = async () => {
    if (!paymentAmount) return;
    setPaymentLoading(true);
    try {
      const res = await fetch(`${API}/hotel-manager/bookings/${paymentModal.id}/payment-request`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ amount: Number(paymentAmount), note: paymentNote }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed');
      setPaymentModal(null);
      setPaymentAmount('');
      setPaymentNote('');
      fetchBookings();
    } catch (err) { alert(err.message); }
    finally { setPaymentLoading(false); }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await fetch(`${API}/hotel-manager/bookings/${bookingId}/confirm`, { method: 'POST', headers: authHeaders() });
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await fetch(`${API}/hotel-manager/bookings/${bookingId}/cancel`, { method: 'POST', headers: authHeaders() });
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const toggleAmenity = (a) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter(x => x !== a)
        : [...prev.amenities, a],
    }));
  };

  const toggleBestFor = (b) => {
    setForm(prev => ({
      ...prev,
      best_for: prev.best_for.includes(b)
        ? prev.best_for.filter(x => x !== b)
        : [...prev.best_for, b],
    }));
  };

  if (!hotel) return null;

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const paidCount = bookings.filter(b => b.status === 'paid').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .tab-btn:hover { color: #0d1b2a !important; }
        .card-hover:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
        .card-hover { transition: box-shadow 0.2s !important; }
        .action-btn:hover { opacity: 0.8; }
      `}</style>

      <Navbar hotel={hotel} onLogout={handleLogout} />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '3rem 2.5rem', color: 'white' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.2em', opacity: 0.5, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Hotel Manager Dashboard</p>
        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, marginBottom: '1.5rem' }}>{hotel.name}</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', maxWidth: '800px' }}>
          {[
            { label: 'Total Listings', value: listings.length },
            { label: 'Active Listings', value: listings.filter(l => l.is_active).length },
            { label: 'New Requests', value: pendingCount, alert: pendingCount > 0 },
            { label: 'Awaiting Confirm', value: paidCount, alert: paidCount > 0 },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '4px' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '0.4rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.alert ? '#fbbf24' : 'white' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e5e5', padding: '0 2.5rem', display: 'flex', gap: '0' }}>
        {[
          { id: 'listings', label: 'My Listings' },
          { id: 'bookings', label: `Booking Requests${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
          { id: 'form', label: editingListing ? 'Edit Hotel' : 'Add New Hotel' },
        ].map(t => (
          <button
            key={t.id}
            className="tab-btn"
            onClick={() => { if (t.id !== 'form') { setEditingListing(null); } setTab(t.id); if (t.id === 'form' && !editingListing) openAddForm(); }}
            style={{
              padding: '1rem 1.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
              color: tab === t.id ? '#0d1b2a' : '#999',
              borderBottom: tab === t.id ? '2px solid #0d1b2a' : '2px solid transparent',
              transition: 'color 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* ── LISTINGS TAB ── */}
        {tab === 'listings' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a' }}>
                My Hotel Listings
              </h2>
              <button onClick={openAddForm} style={{ padding: '0.7rem 1.5rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                + ADD NEW HOTEL
              </button>
            </div>

            {listingsLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'white', border: '1px solid #eee' }}>
                <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏨</p>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0d1b2a', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Hotels Yet</h3>
                <p style={{ fontSize: '0.83rem', color: '#888', marginBottom: '1.5rem' }}>Add your first hotel listing and start receiving bookings.</p>
                <button onClick={openAddForm} style={{ padding: '0.8rem 2rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                  Add Your First Hotel
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {listings.map(listing => (
                  <div key={listing.id} className="card-hover" style={{ background: 'white', border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '160px', overflow: 'hidden', background: '#f0f0f0' }}>
                      {listing.img_url ? (
                        <img src={listing.img_url} alt={listing.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '2.5rem' }}>🏨</div>
                      )}
                      <div style={{ position: 'absolute', top: '10px', left: '10px', background: listing.is_active ? '#0d1b2a' : '#999', color: 'white', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', padding: '0.2rem 0.6rem', textTransform: 'uppercase' }}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </div>
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
                        {listing.tier}
                      </div>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d1b2a', marginBottom: '0.25rem' }}>{listing.name}</h3>
                      <p style={{ fontSize: '0.73rem', color: '#888', marginBottom: '0.75rem' }}>📍 {listing.location} · {listing.city}</p>
                      <p style={{ fontSize: '0.75rem', color: '#0d1b2a', fontWeight: 700, marginBottom: '0.75rem' }}>
                        ৳{Number(listing.price_min).toLocaleString()} – ৳{Number(listing.price_max).toLocaleString()} / night
                      </p>
                      {(listing.amenities || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1rem' }}>
                          {listing.amenities.slice(0, 4).map(a => (
                            <span key={a} style={{ fontSize: '0.62rem', background: '#f0f4f8', color: '#444', padding: '0.2rem 0.45rem', fontWeight: 600 }}>{a}</span>
                          ))}
                          {listing.amenities.length > 4 && <span style={{ fontSize: '0.62rem', color: '#888' }}>+{listing.amenities.length - 4} more</span>}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                        <button onClick={() => openEditForm(listing)} style={{ flex: 1, padding: '0.6rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                          Edit
                        </button>
                        <button onClick={() => handleToggleActive(listing)} style={{ flex: 1, padding: '0.6rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                          {listing.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(listing.id)} style={{ padding: '0.6rem 0.8rem', background: 'transparent', color: '#e53e3e', border: '1px solid #fca5a5', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a' }}>
                Booking Requests
              </h2>
              <button onClick={fetchBookings} style={{ padding: '0.6rem 1rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                Refresh
              </button>
            </div>

            {bookingsLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #eee', borderTop: '3px solid #0d1b2a', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'white', border: '1px solid #eee' }}>
                <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</p>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0d1b2a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>No Bookings Yet</h3>
                <p style={{ fontSize: '0.83rem', color: '#888' }}>Booking requests from users will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(booking => {
                  const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
                  return (
                    <div key={booking.id} className="card-hover" style={{ background: 'white', border: '1px solid #eee', padding: '1.5rem', animation: 'fadeUp 0.3s ease' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0d1b2a' }}>{booking.guest_name}</h3>
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.55rem', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {s.label}
                            </span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.4rem' }}>
                            {[
                              { label: '🏨 Hotel', value: booking.hotel_name },
                              { label: '✉ Email', value: booking.guest_email },
                              { label: '📅 Check-in', value: booking.check_in?.slice(0, 10) },
                              { label: '📅 Check-out', value: booking.check_out?.slice(0, 10) },
                              { label: '👥 Guests', value: booking.guests },
                              { label: '🗓 Booked', value: new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            ].map(item => (
                              <div key={item.label} style={{ fontSize: '0.75rem', color: '#555' }}>
                                <span style={{ color: '#999' }}>{item.label}: </span>
                                <span style={{ fontWeight: 600, color: '#0d1b2a' }}>{item.value}</span>
                              </div>
                            ))}
                          </div>
                          {booking.message && (
                            <p style={{ fontSize: '0.78rem', color: '#666', marginTop: '0.75rem', background: '#f9f9f9', padding: '0.6rem 0.75rem', borderLeft: '3px solid #ddd' }}>
                              "{booking.message}"
                            </p>
                          )}
                          {booking.payment_amount && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', color: '#888' }}>Payment requested:</span>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d1b2a' }}>৳{Number(booking.payment_amount).toLocaleString()}</span>
                              {booking.payment_note && <span style={{ fontSize: '0.72rem', color: '#888' }}>— {booking.payment_note}</span>}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
                          {booking.status === 'pending' && (
                            <>
                              <button onClick={() => setPaymentModal(booking)} style={{ padding: '0.65rem 1rem', background: '#0d1b2a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                                Send Payment Request
                              </button>
                              <button onClick={() => handleCancel(booking.id)} style={{ padding: '0.65rem 1rem', background: 'transparent', color: '#e53e3e', border: '1px solid #fca5a5', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === 'payment_requested' && (
                            <div style={{ fontSize: '0.72rem', color: '#1d4ed8', background: '#eff6ff', padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                              Waiting for payment...
                            </div>
                          )}
                          {booking.status === 'paid' && (
                            <>
                              <button onClick={() => handleConfirm(booking.id)} style={{ padding: '0.65rem 1rem', background: '#15803d', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}>
                                Confirm Booking
                              </button>
                              <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, textAlign: 'center' }}>
                                Payment received!
                              </div>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <div style={{ fontSize: '0.72rem', color: '#15803d', background: '#f0fdf4', padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                              ✓ Booking Confirmed
                            </div>
                          )}
                          {booking.status === 'cancelled' && (
                            <div style={{ fontSize: '0.72rem', color: '#cc0000', background: '#fff0f0', padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 700 }}>
                              Cancelled
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT FORM TAB ── */}
        {tab === 'form' && (
          <div style={{ animation: 'fadeUp 0.3s ease', maxWidth: '700px' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '1.5rem' }}>
              {editingListing ? `Editing: ${editingListing.name}` : 'Add New Hotel Listing'}
            </h2>

            {formError && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000', fontSize: '0.8rem', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>{formError}</div>}
            {formSuccess && <div style={{ background: '#f0fff4', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.8rem', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>{formSuccess}</div>}

            <form onSubmit={handleFormSubmit}>
              <div style={{ background: 'white', border: '1px solid #eee', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {[
                  { label: 'Hotel Name', key: 'name', placeholder: 'e.g. Grand Ocean Resort', required: true },
                  { label: 'Location / Address', key: 'location', placeholder: 'e.g. Marine Drive, Kolatoli', required: true },
                  { label: 'City', key: 'city', placeholder: "e.g. cox's bazar (lowercase)", required: true },
                  { label: 'Image URL', key: 'img_url', placeholder: 'https://... (Unsplash link recommended)' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>
                      {field.label} {field.required && <span style={{ color: '#e53e3e' }}>*</span>}
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>Description</label>
                  <textarea
                    placeholder="Describe your hotel, its unique features, surroundings..."
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Min Price / Night (৳)', key: 'price_min', placeholder: '3000' },
                    { label: 'Max Price / Night (৳)', key: 'price_max', placeholder: '15000' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>
                        {field.label} <span style={{ color: '#e53e3e' }}>*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required
                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Tier */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>Tier</label>
                  <select
                    value={form.tier}
                    onChange={e => setForm(prev => ({ ...prev, tier: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.88rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', background: 'white' }}
                  >
                    {TIER_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Amenities */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.75rem' }}>Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {AMENITY_OPTIONS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => toggleAmenity(a)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          background: form.amenities.includes(a) ? '#0d1b2a' : 'white',
                          color: form.amenities.includes(a) ? 'white' : '#555',
                          border: form.amenities.includes(a) ? '1.5px solid #0d1b2a' : '1px solid #ddd',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                          fontFamily: 'Montserrat, sans-serif', transition: 'all 0.15s',
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Best For */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.75rem' }}>Best For</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {BEST_FOR_OPTIONS.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => toggleBestFor(b)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: form.best_for.includes(b) ? '#0d1b2a' : 'white',
                          color: form.best_for.includes(b) ? 'white' : '#555',
                          border: form.best_for.includes(b) ? '1.5px solid #0d1b2a' : '1px solid #ddd',
                          cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
                          fontFamily: 'Montserrat, sans-serif', textTransform: 'capitalize',
                        }}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{ flex: 1, padding: '1rem', background: formLoading ? '#999' : '#0d1b2a', color: 'white', border: 'none', cursor: formLoading ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {formLoading ? (
                      <><div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving...</>
                    ) : editingListing ? 'Update Hotel' : 'Add Hotel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('listings')}
                    style={{ padding: '1rem 1.5rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ── Payment Request Modal (no fixed position — faux overlay) ── */}
      {paymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0d1b2a', marginBottom: '0.4rem' }}>Send Payment Request</h3>
            <p style={{ fontSize: '0.78rem', color: '#888', marginBottom: '1.5rem' }}>
              Booking by <strong>{paymentModal.guest_name}</strong> for {paymentModal.hotel_name}
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>
                Payment Amount (৳) <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 12000"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '0.5rem' }}>
                Note (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2 nights, Deluxe Room"
                value={paymentNote}
                onChange={e => setPaymentNote(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleSendPayment}
                disabled={!paymentAmount || paymentLoading}
                style={{ flex: 1, padding: '0.85rem', background: !paymentAmount || paymentLoading ? '#999' : '#0d1b2a', color: 'white', border: 'none', cursor: !paymentAmount ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
              >
                {paymentLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => { setPaymentModal(null); setPaymentAmount(''); setPaymentNote(''); }}
                style={{ padding: '0.85rem 1.25rem', background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}