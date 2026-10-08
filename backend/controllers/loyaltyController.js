const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');

// @desc    Get user's loyalty points and transaction history
// @route   GET /api/loyalty/balance
// @access  Private
const getLoyaltyBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('loyaltyPoints');
    const transactions = await LoyaltyTransaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber total');

    res.json({
      success: true,
      points: user ? user.loyaltyPoints : 0,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLoyaltyBalance,
};
