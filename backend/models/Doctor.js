const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  // Morning timing
  morningStart: {
    type: String
  },
  morningEnd: {
    type: String
  },
  // Evening timing
  eveningStart: {
    type: String
  },
  eveningEnd: {
    type: String
  },
  // Legacy fields (for backward compatibility)
  startTime: {
    type: String
  },
  endTime: {
    type: String
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add doctor name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number']
  },
  specialization: {
    type: String,
    required: [true, 'Please add specialization']
  },
  qualification: {
    type: String,
    required: [true, 'Please add qualification']
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  availability: [availabilitySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  signature: {
    type: String,  // Base64 encoded image
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
