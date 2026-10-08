const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      index: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      index: true,
    },
    guests: {
      type: String,
      required: [true, 'Guest count is required'],
    },
    guestCountNumber: {
      type: Number,
      default: 2,
    },
    occasion: {
      type: String,
      default: '',
    },
    specialRequests: {
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
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', ReservationSchema);
