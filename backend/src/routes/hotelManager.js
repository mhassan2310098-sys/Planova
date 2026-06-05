const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// ── Hotel auth middleware ──
function hotelAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided.' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'hotel')
      return res.status(403).json({ error: 'Hotel access only.' });
    req.hotel = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ─────────────────────────────────────────────
//  HOTEL LISTINGS
// ─────────────────────────────────────────────

// GET /api/hotel-manager/listings — get this manager's listings
router.get('/listings', hotelAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hotel_listings WHERE hotel_id = $1 ORDER BY created_at DESC',
      [req.hotel.id]
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hotel-manager/listings — add a new listing
router.post('/listings', hotelAuth, async (req, res) => {
  const { name, location, city, description, price_min, price_max, tier, amenities, img_url, best_for } = req.body;
  if (!name || !location || !city || !price_min || !price_max)
    return res.status(400).json({ error: 'name, location, city, price_min, price_max are required.' });

  try {
    const result = await pool.query(
      `INSERT INTO hotel_listings
        (hotel_id, name, location, city, description, price_min, price_max, tier, amenities, img_url, best_for)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        req.hotel.id, name.trim(), location.trim(), city.toLowerCase().trim(),
        description || '', Number(price_min), Number(price_max),
        tier || 'Mid-Range',
        amenities || [],
        img_url || '',
        best_for || ['solo', 'couple', 'family', 'group'],
      ]
    );
    res.status(201).json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/hotel-manager/listings/:id — edit a listing
router.put('/listings/:id', hotelAuth, async (req, res) => {
  const { name, location, city, description, price_min, price_max, tier, amenities, img_url, best_for, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE hotel_listings SET
        name=$1, location=$2, city=$3, description=$4,
        price_min=$5, price_max=$6, tier=$7, amenities=$8,
        img_url=$9, best_for=$10, is_active=$11
       WHERE id=$12 AND hotel_id=$13 RETURNING *`,
      [
        name, location, city?.toLowerCase().trim(), description,
        Number(price_min), Number(price_max), tier,
        amenities || [], img_url, best_for || [],
        is_active !== undefined ? is_active : true,
        req.params.id, req.hotel.id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/hotel-manager/listings/:id
router.delete('/listings/:id', hotelAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM hotel_listings WHERE id=$1 AND hotel_id=$2',
      [req.params.id, req.hotel.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─────────────────────────────────────────────
//  BOOKINGS (hotel manager view)
// ─────────────────────────────────────────────

// GET /api/hotel-manager/bookings — all bookings for this manager's hotels
router.get('/bookings', hotelAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, hl.name AS hotel_name, hl.city,
              pr.amount AS payment_amount, pr.status AS payment_status, pr.id AS payment_request_id
       FROM bookings b
       JOIN hotel_listings hl ON hl.id = b.hotel_listing_id
       LEFT JOIN payment_requests pr ON pr.booking_id = b.id
       WHERE hl.hotel_id = $1
       ORDER BY b.created_at DESC`,
      [req.hotel.id]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hotel-manager/bookings/:id/payment-request — send payment to user
router.post('/bookings/:id/payment-request', hotelAuth, async (req, res) => {
  const { amount, note } = req.body;
  if (!amount) return res.status(400).json({ error: 'amount is required.' });

  try {
    // Verify the booking belongs to this hotel manager
    const check = await pool.query(
      `SELECT b.id FROM bookings b
       JOIN hotel_listings hl ON hl.id = b.hotel_listing_id
       WHERE b.id=$1 AND hl.hotel_id=$2`,
      [req.params.id, req.hotel.id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: 'Booking not found.' });

    // Upsert payment request
    await pool.query('DELETE FROM payment_requests WHERE booking_id=$1', [req.params.id]);
    const pr = await pool.query(
      'INSERT INTO payment_requests (booking_id, amount, note) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, Number(amount), note || '']
    );

    // Update booking status
    await pool.query(
      "UPDATE bookings SET status='payment_requested' WHERE id=$1",
      [req.params.id]
    );

    res.json({ success: true, paymentRequest: pr.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hotel-manager/bookings/:id/confirm — confirm after payment
router.post('/bookings/:id/confirm', hotelAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE bookings SET status='confirmed' WHERE id=$1",
      [req.params.id]
    );
    await pool.query(
      "UPDATE payment_requests SET status='confirmed' WHERE booking_id=$1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hotel-manager/bookings/:id/cancel
router.post('/bookings/:id/cancel', hotelAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE bookings SET status='cancelled' WHERE id=$1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;