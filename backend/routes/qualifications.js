const express = require('express');
const router = express.Router();
const Qualification = require('../models/Qualification');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// @route   GET /api/qualifications
// @desc    Get all qualifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search, active } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } }
      ];
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const qualifications = await Qualification.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: qualifications.length,
      data: qualifications
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/qualifications/:id
// @desc    Get qualification by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);

    if (!qualification) {
      return res.status(404).json({
        success: false,
        message: 'Qualification not found'
      });
    }

    res.json({
      success: true,
      data: qualification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/qualifications
// @desc    Create qualification
// @access  Private/Admin
router.post('/', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, shortName, description } = req.body;

    // Check if qualification with name exists
    const existing = await Qualification.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Qualification with this name already exists'
      });
    }

    const qualification = await Qualification.create({
      name,
      shortName,
      description
    });

    res.status(201).json({
      success: true,
      data: qualification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/qualifications/:id
// @desc    Update qualification
// @access  Private/Admin
router.put('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const { name, shortName, description, isActive } = req.body;

    let qualification = await Qualification.findById(req.params.id);

    if (!qualification) {
      return res.status(404).json({
        success: false,
        message: 'Qualification not found'
      });
    }

    // Check for duplicate name (excluding current)
    if (name) {
      const existing = await Qualification.findOne({
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Qualification with this name already exists'
        });
      }
    }

    qualification = await Qualification.findByIdAndUpdate(
      req.params.id,
      { name, shortName, description, isActive },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: qualification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/qualifications/:id
// @desc    Delete qualification
// @access  Private/Admin
router.delete('/:id', protect, roleCheck('admin'), async (req, res) => {
  try {
    const qualification = await Qualification.findById(req.params.id);

    if (!qualification) {
      return res.status(404).json({
        success: false,
        message: 'Qualification not found'
      });
    }

    await qualification.deleteOne();

    res.json({
      success: true,
      message: 'Qualification deleted successfully'
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
