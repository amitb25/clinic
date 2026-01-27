const mongoose = require('mongoose');

const clinicTimingSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  slotType: {
    type: String,
    enum: ['single', 'double'],
    default: 'double'
  },
  // Single slot timing
  singleStart: {
    type: String
  },
  singleEnd: {
    type: String
  },
  // Morning timing (for double slot)
  morningStart: {
    type: String
  },
  morningEnd: {
    type: String
  },
  // Evening timing (for double slot)
  eveningStart: {
    type: String
  },
  eveningEnd: {
    type: String
  }
}, { _id: false });

const clinicSettingsSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: [true, 'Please add clinic name'],
    default: 'Sariva Clinic'
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  tagline: {
    type: String
  },
  registrationNo: {
    type: String
  },
  timings: [clinicTimingSchema],
  logo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClinicSettings', clinicSettingsSchema);
