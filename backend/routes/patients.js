const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

// @route   GET /api/patients
// @desc    Get all patients with search
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: patients.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: patients
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/patients
// @desc    Create patient
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, age, gender, phone, email, address, bloodGroup, medicalHistory, allergies } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      address,
      bloodGroup,
      medicalHistory,
      allergies
    });

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, age, gender, phone, email, address, bloodGroup, medicalHistory, allergies } = req.body;

    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { name, age, gender, phone, email, address, bloodGroup, medicalHistory, allergies },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/patients/:id/prescriptions
// @desc    Get patient's prescription history
// @access  Private
router.get('/:id/prescriptions', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const prescriptions = await Prescription.find({ patient: req.params.id })
      .populate('doctor', 'name specialization')
      .populate('medicines.medicine', 'name genericName')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
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

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    await patient.deleteOne();

    res.json({
      success: true,
      message: 'Patient deleted successfully'
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
