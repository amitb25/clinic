const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

// @route   GET /api/prescriptions
// @desc    Get all prescriptions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { patient, doctor, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};

    if (patient) {
      query.patient = patient;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name patientId phone age gender')
      .populate('doctor', 'name specialization')
      .populate('medicines.medicine', 'name genericName')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: prescriptions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: prescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/prescriptions/:id
// @desc    Get prescription by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient')
      .populate('doctor')
      .populate('medicines.medicine');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/prescriptions
// @desc    Create prescription
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { patient, doctor, date, diagnosis, medicines, dietPlan, advice, followUpDate } = req.body;

    const prescription = await Prescription.create({
      patient,
      doctor,
      date: date || new Date(),
      diagnosis,
      medicines,
      dietPlan,
      advice,
      followUpDate
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient')
      .populate('doctor')
      .populate('medicines.medicine');

    res.status(201).json({
      success: true,
      data: populatedPrescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/prescriptions/:id
// @desc    Update prescription
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { diagnosis, medicines, dietPlan, advice, followUpDate } = req.body;

    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { diagnosis, medicines, dietPlan, advice, followUpDate },
      { new: true, runValidators: true }
    )
      .populate('patient')
      .populate('doctor')
      .populate('medicines.medicine');

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/prescriptions/:id
// @desc    Delete prescription
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    await prescription.deleteOne();

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
