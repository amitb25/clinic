const express = require('express');
const router = express.Router();
const ClinicSettings = require('../models/ClinicSettings');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// @route   GET /api/clinic-settings
// @desc    Get clinic settings
// @access  Public (for prescription display)
router.get('/', async (req, res) => {
  try {
    let settings = await ClinicSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await ClinicSettings.create({
        clinicName: 'Sariva Clinic',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: ''
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/clinic-settings
// @desc    Update clinic settings
// @access  Private/Admin
router.put('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const {
      clinicName,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      website,
      tagline,
      registrationNo,
      timings
    } = req.body;

    let settings = await ClinicSettings.findOne();

    if (!settings) {
      settings = await ClinicSettings.create({
        clinicName,
        address,
        city,
        state,
        pincode,
        phone,
        email,
        website,
        tagline,
        registrationNo,
        timings
      });
    } else {
      settings = await ClinicSettings.findByIdAndUpdate(
        settings._id,
        {
          clinicName,
          address,
          city,
          state,
          pincode,
          phone,
          email,
          website,
          tagline,
          registrationNo,
          timings
        },
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      data: settings
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
