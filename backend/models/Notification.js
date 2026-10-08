const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['ALL', 'CUSTOMER', 'ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'DELIVERY_STAFF'],
      default: 'ADMIN',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'ORDER_NEW',
        'ORDER_STATUS',
        'RESERVATION_NEW',
        'RESERVATION_STATUS',
        'PAYMENT_SUCCESS',
        'PAYMENT_FAILED',
        'LOW_STOCK',
        'PROMOTION',
      ],
      default: 'ORDER_NEW',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
