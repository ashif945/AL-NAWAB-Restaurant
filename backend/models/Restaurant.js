const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Al-Nawab Restaurant',
    },
    tagline: {
      type: String,
      default: 'Authentic Royal Mughlai Cuisine',
    },
    description: {
      type: String,
      default:
        'Experience the Royal Feast at Al-Nawab Restaurant, Noida. Authentic Mughlai cuisine, family dining, and seamless ordering.',
    },
    address: {
      type: String,
      default: 'Link Rd, Hazipur, Sector 104, Noida, Uttar Pradesh 201304',
    },
    phone: {
      type: String,
      default: '08505969388',
    },
    whatsapp: {
      type: String,
      default: '+966115001584',
    },
    email: {
      type: String,
      default: 'alnawbnoida@gmail.com',
    },
    deliveryFee: {
      type: Number,
      default: 40,
    },
    minOrderForFreeDelivery: {
      type: Number,
      default: 500,
    },
    taxRatePercent: {
      type: Number,
      default: 5, // 5% GST on restaurant food
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openingHours: {
      type: String,
      default: '12:00 PM - 11:30 PM',
    },
    loyaltyPointsPer100Rupees: {
      type: Number,
      default: 10,
    },
    pointsRedemptionValueInRupees: {
      type: Number,
      default: 1, // 1 point = 1 rupee
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', RestaurantSchema);
