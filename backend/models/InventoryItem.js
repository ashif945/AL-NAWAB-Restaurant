const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
      default: 'kg', // kg, g, liters, units, packs
    },
    minimumThreshold: {
      type: Number,
      required: true,
      default: 10,
    },
    status: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'],
      default: 'IN_STOCK',
    },
    costPerUnit: {
      type: Number,
      default: 0,
    },
    supplier: {
      type: String,
      default: '',
    },
    linkedMenuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
    },
  },
  { timestamps: true }
);

// Auto-compute status
InventoryItemSchema.pre('save', function () {
  if (this.quantity <= 0) {
    this.status = 'OUT_OF_STOCK';
  } else if (this.quantity <= this.minimumThreshold) {
    this.status = 'LOW_STOCK';
  } else {
    this.status = 'IN_STOCK';
  }
});

module.exports = mongoose.model('InventoryItem', InventoryItemSchema);
