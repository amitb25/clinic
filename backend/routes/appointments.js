const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { patient, doctor, status, date, startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = {};

    if (patient) {
      query.patient = patient;
    }

    if (doctor) {
      query.doctor = doctor;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name patientId phone age gender')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: appointments.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/today
// @desc    Get today's appointments
// @access  Private
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('patient', 'name patientId phone age gender')
      .populate('doctor', 'name specialization')
      .sort({ time: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { patient, doctor, date, time, reason, notes } = req.body;

    // Check for conflicting appointments
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(appointmentDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingAppointment = await Appointment.findOne({
      doctor,
      date: { $gte: appointmentDate, $lt: nextDay },
      time,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already has an appointment at this time'
      });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      date,
      time,
      reason,
      notes
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name patientId phone')
      .populate('doctor', 'name specialization');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { date, time, reason, status, notes } = req.body;

    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, time, reason, status, notes },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name patientId phone')
      .populate('doctor', 'name specialization');

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.deleteOne();

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
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
