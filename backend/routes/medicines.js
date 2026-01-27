const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// @route   GET /api/medicines
// @desc    Get all medicines
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, category, active, expired } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    // Filter for non-expired medicines only
    if (expired === 'false') {
      query.expiryDate = { $gt: new Date() };
    }

    const medicines = await Medicine.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/medicines/alerts
// @desc    Get low stock and expired medicines
// @access  Private
router.get('/alerts', protect, async (req, res) => {
  try {
    const currentDate = new Date();

    // Low stock medicines
    const lowStock = await Medicine.find({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minimumStock'] }
    }).sort({ stockQuantity: 1 });

    // Expired medicines
    const expired = await Medicine.find({
      isActive: true,
      expiryDate: { $lt: currentDate }
    }).sort({ expiryDate: 1 });

    // Expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await Medicine.find({
      isActive: true,
      expiryDate: { $gte: currentDate, $lte: thirtyDaysFromNow }
    }).sort({ expiryDate: 1 });

    res.json({
      success: true,
      data: {
        lowStock,
        expired,
        expiringSoon
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

// @route   GET /api/medicines/:id
// @desc    Get medicine by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/medicines
// @desc    Create medicine
// @access  Private/Admin
router.post('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      batchNumber,
      expiryDate,
      stockQuantity,
      minimumStock,
      price,
      manufacturer
    } = req.body;

    const medicine = await Medicine.create({
      name,
      genericName,
      category,
      batchNumber,
      expiryDate,
      stockQuantity,
      minimumStock,
      price,
      manufacturer
    });

    res.status(201).json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/medicines/:id
// @desc    Update medicine
// @access  Private/Admin
router.put('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      batchNumber,
      expiryDate,
      stockQuantity,
      minimumStock,
      price,
      manufacturer,
      isActive
    } = req.body;

    let medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        name,
        genericName,
        category,
        batchNumber,
        expiryDate,
        stockQuantity,
        minimumStock,
        price,
        manufacturer,
        isActive
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: medicine
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/medicines/:id
// @desc    Delete medicine
// @access  Private/Admin
router.delete('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    await medicine.deleteOne();

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
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
