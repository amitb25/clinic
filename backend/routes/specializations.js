const express = require('express');
const router = express.Router();
const Specialization = require('../models/Specialization');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// @route   GET /api/specializations
// @desc    Get all specializations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, active } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const specializations = await Specialization.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: specializations.length,
      data: specializations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/specializations/:id
// @desc    Get specialization by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    res.json({
      success: true,
      data: specialization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/specializations
// @desc    Create specialization
// @access  Private/Admin
router.post('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if specialization with name exists
    const existing = await Specialization.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Specialization with this name already exists'
      });
    }

    const specialization = await Specialization.create({
      name,
      description
    });

    res.status(201).json({
      success: true,
      data: specialization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/specializations/:id
// @desc    Update specialization
// @access  Private/Admin
router.put('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    let specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    // Check for duplicate name (excluding current)
    if (name) {
      const existing = await Specialization.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Specialization with this name already exists'
        });
      }
    }

    specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      { name, description, isActive },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: specialization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/specializations/:id
// @desc    Delete specialization
// @access  Private/Admin
router.delete('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: 'Specialization not found'
      });
    }

    await specialization.deleteOne();

    res.json({
      success: true,
      message: 'Specialization deleted successfully'
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
