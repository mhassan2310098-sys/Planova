const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// POST /api/hotel-auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email, and password are required' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const existing = await pool.query('SELECT id FROM hotels WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'A hotel account with this email already exists' });

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO hotels (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const hotel = result.rows[0];

    const token = jwt.sign(
      { id: hotel.id, email: hotel.email, name: hotel.name, role: 'hotel' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Hotel account created successfully',
      token,
      hotel: { id: hotel.id, name: hotel.name, email: hotel.email },
    });
  } catch (err) {
    console.error('Hotel register error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// POST /api/hotel-auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await pool.query('SELECT * FROM hotels WHERE email = $1', [email.toLowerCase().trim()]);
    const hotel = result.rows[0];

    if (!hotel)
      return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, hotel.password_hash);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: hotel.id, email: hotel.email, name: hotel.name, role: 'hotel' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      hotel: { id: hotel.id, name: hotel.name, email: hotel.email },
    });
  } catch (err) {
    console.error('Hotel login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;