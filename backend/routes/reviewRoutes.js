const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  getAdminReviews,
  toggleReviewApproval,
  replyToReview,
} = require('../controllers/reviewController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', getReviews);
router.post('/', optionalAuth, createReview);

router.get('/admin', protect, authorize('ADMIN', 'MANAGER'), getAdminReviews);
router.patch('/:id/approve', protect, authorize('ADMIN'), toggleReviewApproval);
router.post('/:id/reply', protect, authorize('ADMIN'), replyToReview);

module.exports = router;
