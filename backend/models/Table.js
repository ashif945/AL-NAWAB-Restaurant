const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
    section: {
      type: String,
      enum: ['Main Hall', 'Royal Family Nook', 'Floor Seating Dastarkhwan', 'Outdoor Courtyard', 'Private Dining'],
      default: 'Main Hall',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'OUT_OF_SERVICE'],
      default: 'AVAILABLE',
      index: true,
    },
    qrCodeUrl: {
      type: String,
      default: '',
    },
    currentOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    activeReservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', TableSchema);
