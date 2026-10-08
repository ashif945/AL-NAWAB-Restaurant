const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', optionalAuth, cancelOrder);

// Admin / Staff
router.get('/', protect, authorize('ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'DELIVERY_STAFF'), getAllOrders);
router.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'DELIVERY_STAFF'), updateOrderStatus);

module.exports = router;
