const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const { menuItemId } = req.query;
    const query = { isApproved: true };

    if (menuItemId) {
      query.menuItem = menuItemId;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(20);
    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a review
// @route   POST /api/reviews
// @access  Public / Private
const createReview = async (req, res, next) => {
  try {
    const { customerName, rating, comment, menuItemId, orderId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required',
      });
    }

    const name = customerName || (req.user ? req.user.name : 'Valued Patron');

    const review = await Review.create({
      user: req.user ? req.user.id : undefined,
      customerName: name,
      rating: Number(rating),
      comment: comment.trim(),
      menuItem: menuItemId || undefined,
      order: orderId || undefined,
      isApproved: true,
    });

    // Update menu item average rating if linked to a specific item
    if (menuItemId) {
      const allItemReviews = await Review.find({ menuItem: menuItemId, isApproved: true });
      const avg = allItemReviews.reduce((sum, r) => sum + r.rating, 0) / allItemReviews.length;
      await MenuItem.findByIdAndUpdate(menuItemId, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allItemReviews.length,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your royal review has been recorded.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all reviews for moderation
// @route   GET /api/reviews/admin
// @access  Private (ADMIN/MANAGER)
const getAdminReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).populate('menuItem', 'name');
    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: approve/hide review
// @route   PATCH /api/reviews/:id/approve
// @access  Private (ADMIN)
const toggleReviewApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({
      success: true,
      message: `Review ${review.isApproved ? 'approved' : 'hidden'}`,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (ADMIN)
const replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.restaurantReply = reply;
    await review.save();

    res.json({
      success: true,
      message: 'Reply posted',
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  getAdminReviews,
  toggleReviewApproval,
  replyToReview,
};
