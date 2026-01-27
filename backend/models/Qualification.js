const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add qualification name'],
    trim: true,
    unique: true
  },
  shortName: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Qualification', qualificationSchema);
