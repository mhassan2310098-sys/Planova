require('dotenv').config();

const express = require('express');
const cors = require('cors');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const tripRoutes = require('./routes/trip');
const hotelAuthRoutes = require('./routes/hotelAuth');
const hotelManagerRoutes = require('./routes/hotelManager');
const bookingRoutes = require('./routes/booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/hotel-auth', hotelAuthRoutes);
app.use('/api/hotel-manager', hotelManagerRoutes);
app.use('/api/booking', bookingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Planova API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Planova backend running on http://localhost:${PORT}`);
});

module.exports = app;