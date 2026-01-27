const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get counts
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const totalMedicines = await Medicine.countDocuments({ isActive: true });

    // Today's appointments
    const todayAppointments = await Appointment.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    // Pending appointments
    const pendingAppointments = await Appointment.countDocuments({
      status: 'pending',
      date: { $gte: today }
    });

    // Low stock medicines
    const lowStockMedicines = await Medicine.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minimumStock'] }
    });

    // Expired medicines
    const expiredMedicines = await Medicine.countDocuments({
      isActive: true,
      expiryDate: { $lt: today }
    });

    // Monthly statistics
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const monthlyPatients = await Patient.countDocuments({
      createdAt: { $gte: thisMonth, $lt: nextMonth }
    });

    const monthlyPrescriptions = await Prescription.countDocuments({
      createdAt: { $gte: thisMonth, $lt: nextMonth }
    });

    const monthlyAppointments = await Appointment.countDocuments({
      date: { $gte: thisMonth, $lt: nextMonth }
    });

    // Recent appointments
    const recentAppointments = await Appointment.find({
      date: { $gte: today }
    })
      .populate('patient', 'name patientId')
      .populate('doctor', 'name specialization')
      .sort({ date: 1, time: 1 })
      .limit(5);

    // Appointment trends (last 7 days)
    const appointmentTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Appointment.countDocuments({
        date: { $gte: date, $lt: nextDate }
      });

      appointmentTrends.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    // Gender distribution
    const malePatients = await Patient.countDocuments({ gender: 'male' });
    const femalePatients = await Patient.countDocuments({ gender: 'female' });
    const otherPatients = await Patient.countDocuments({ gender: 'other' });

    res.json({
      success: true,
      data: {
        counts: {
          totalPatients,
          totalDoctors,
          totalMedicines,
          todayAppointments,
          pendingAppointments,
          lowStockMedicines,
          expiredMedicines
        },
        monthly: {
          patients: monthlyPatients,
          prescriptions: monthlyPrescriptions,
          appointments: monthlyAppointments
        },
        recentAppointments,
        appointmentTrends,
        genderDistribution: {
          male: malePatients,
          female: femalePatients,
          other: otherPatients
        }
      }
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
