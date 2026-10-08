const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/', optionalAuth, createReservation);
router.get('/', getAllReservations);
router.get('/my-reservations', protect, getMyReservations);
router.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER', 'WAITER'), updateReservationStatus);
router.delete('/:id', optionalAuth, cancelReservation);

module.exports = router;
