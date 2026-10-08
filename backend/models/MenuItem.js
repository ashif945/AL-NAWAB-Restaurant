const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
      index: true,
    },
    image: {
      type: String,
      default: '/images/feast_platter.png',
    },
    ingredients: [
      {
        type: String,
      },
    ],
    allergens: [
      {
        type: String,
      },
    ],
    dietaryType: {
      type: String,
      enum: ['Halal', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'None'],
      default: 'Halal',
    },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Spicy', 'Extra Spicy'],
      default: 'Medium',
    },
    preparationTime: {
      type: Number, // in minutes
      default: 20,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 12,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Search text index on name & description
MenuItemSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('MenuItem', MenuItemSchema);
