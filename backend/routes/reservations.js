const express = require('express');
const router = express.Router();
const db = require('../db');

// Create a new reservation
router.post('/', (req, res) => {
  const { name, phone, date, time, guests, occasion } = req.body;

  if (!name || !phone || !date || !time || !guests) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const query = `INSERT INTO reservations (name, phone, date, time, guests, occasion) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [name, phone, date, time, guests, occasion];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Error inserting reservation:', err);
      return res.status(500).json({ success: false, message: 'Failed to create reservation. Please try again.' });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Reservation confirmed successfully. We look forward to hosting you!',
      reservationId: this.lastID 
    });
  });
});

// Get all reservations (for admin purposes)
router.get('/', (req, res) => {
  db.all(`SELECT * FROM reservations ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, reservations: rows });
  });
});

module.exports = router;
