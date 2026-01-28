const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, specialization, active } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/doctors
// @desc    Create doctor
// @access  Private/Admin
router.post('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, phone, specialization, qualification, registrationNo, consultationFee, availability, createUser, password } = req.body;

    // Check if doctor with email exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this email already exists'
      });
    }

    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialization,
      qualification,
      registrationNo,
      consultationFee,
      availability
    });

    // Create user account for doctor if requested
    if (createUser && password) {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await User.create({
          name,
          email,
          password,
          role: 'doctor',
          doctorId: doctor._id
        });
      }
    }

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Private/Admin
router.put('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, email, phone, specialization, qualification, registrationNo, consultationFee, availability, isActive, signature } = req.body;

    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const updateData = { name, email, phone, specialization, qualification, registrationNo, consultationFee, availability, isActive };

    // Only update signature if provided
    if (signature !== undefined) {
      updateData.signature = signature;
    }

    doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor
// @access  Private/Admin
router.delete('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    await doctor.deleteOne();

    // Deactivate associated user account
    await User.findOneAndUpdate(
      { doctorId: req.params.id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
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
