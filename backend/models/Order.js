const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String, default: '' },
  isVeg: { type: Boolean, default: false },
});

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: String, default: 'SYSTEM' },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
    },
    orderType: {
      type: String,
      enum: ['DELIVERY', 'PICKUP', 'DINE_IN'],
      default: 'DELIVERY',
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'REFUNDED',
      ],
      default: 'ORDER_PLACED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'CASH', 'ONLINE'],
      default: 'UPI',
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    deliveryInstructions: {
      type: String,
      default: '',
    },
    pickupTime: {
      type: String,
      default: '',
    },
    tableNumber: {
      type: String,
      default: '',
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
    },
    estimatedDeliveryMinutes: {
      type: Number,
      default: 40,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    statusHistory: [StatusHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', OrderSchema);
