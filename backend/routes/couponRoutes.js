const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.post('/validate', validateCoupon);
router.get('/', getCoupons);
router.post('/', protect, authorize('ADMIN'), createCoupon);
router.put('/:id', protect, authorize('ADMIN'), updateCoupon);
router.delete('/:id', protect, authorize('ADMIN'), deleteCoupon);

module.exports = router;
