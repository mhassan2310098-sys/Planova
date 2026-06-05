const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/booking/hotels?city=cox's bazar — get hotel listings for a city
router.get('/hotels', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });
  try {
    const result = await pool.query(
      `SELECT hl.*, h.name AS manager_name
       FROM hotel_listings hl
       JOIN hotels h ON h.id = hl.hotel_id
       WHERE LOWER(hl.city) = LOWER($1) AND hl.is_active = true
       ORDER BY hl.rating DESC`,
      [city.trim()]
    );
    res.json({ success: true, hotels: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/booking/request — user submits a booking request
router.post('/request', authMiddleware, async (req, res) => {
  const { hotel_listing_id, trip_id, guest_name, guest_email, check_in, check_out, guests, message } = req.body;
  if (!hotel_listing_id || !guest_name || !guest_email || !check_in || !check_out)
    return res.status(400).json({ error: 'hotel_listing_id, guest_name, guest_email, check_in, check_out required.' });

  try {
    const result = await pool.query(
      `INSERT INTO bookings
        (user_id, hotel_listing_id, trip_id, guest_name, guest_email, check_in, check_out, guests, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        req.user.id, hotel_listing_id, trip_id || null,
        guest_name, guest_email, check_in, check_out,
        guests || 1, message || '',
      ]
    );
    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/booking/my-bookings — user's bookings with payment info
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, hl.name AS hotel_name, hl.location, hl.city, hl.img_url,
              pr.amount AS payment_amount, pr.note AS payment_note,
              pr.status AS payment_status, pr.id AS payment_request_id
       FROM bookings b
       JOIN hotel_listings hl ON hl.id = b.hotel_listing_id
       LEFT JOIN payment_requests pr ON pr.booking_id = b.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/booking/:id/pay — user marks as paid
router.post('/:id/pay', authMiddleware, async (req, res) => {
  try {
    const check = await pool.query(
      'SELECT id FROM bookings WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!check.rows[0]) return res.status(404).json({ error: 'Booking not found.' });

    await pool.query("UPDATE bookings SET status='paid' WHERE id=$1", [req.params.id]);
    await pool.query(
      "UPDATE payment_requests SET status='paid' WHERE booking_id=$1",
      [req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;