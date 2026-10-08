const mongoose = require('mongoose');

const LoyaltyTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['EARNED', 'REDEEMED', 'BONUS', 'ADJUSTMENT'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoyaltyTransaction', LoyaltyTransactionSchema);
