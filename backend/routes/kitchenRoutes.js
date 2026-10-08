const express = require('express');
const router = express.Router();
const {
  getKitchenOrders,
  advanceKitchenOrder,
} = require('../controllers/kitchenController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.get('/active-orders', authorize('CHEF', 'ADMIN', 'MANAGER'), getKitchenOrders);
router.patch('/orders/:id/advance', authorize('CHEF', 'ADMIN', 'MANAGER'), advanceKitchenOrder);

module.exports = router;
