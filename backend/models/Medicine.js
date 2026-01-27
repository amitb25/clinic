const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add medicine name'],
    trim: true
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add category']
  },
  batchNumber: {
    type: String
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add expiry date']
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minimumStock: {
    type: Number,
    default: 10
  },
  price: {
    type: Number,
    default: 0
  },
  manufacturer: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for checking if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
  return this.expiryDate < new Date();
});

// Virtual for checking if stock is low
medicineSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity <= this.minimumStock;
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
