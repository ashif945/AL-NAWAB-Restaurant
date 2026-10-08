const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/history', protect, authorize('ADMIN', 'MANAGER'), getPaymentHistory);

module.exports = router;
