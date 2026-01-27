const mongoose = require('mongoose');

const medicineItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  medicineName: {
    type: String,
    required: true
  },
  dosage: {
    morning: { type: Boolean, default: false },
    afternoon: { type: Boolean, default: false },
    night: { type: Boolean, default: false }
  },
  duration: {
    type: Number,
    required: true
  },
  instructions: {
    type: String
  }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: [true, 'Please add diagnosis']
  },
  medicines: [medicineItemSchema],
  advice: {
    type: String
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate prescription ID before saving
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    this.prescriptionId = `RX${year}${month}${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
