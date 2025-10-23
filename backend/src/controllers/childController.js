const Child = require('../models/InMemoryChild');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/children');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'child-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all children for a parent
const getChildren = async (req, res) => {
  try {
    const queryResult = await Child.find({ 
      parentId: req.user._id, 
      isActive: true 
    });
    
    // Handle the query result properly
    const children = queryResult.sort ? queryResult.sort({ createdAt: -1 }) : queryResult;

    res.json({
      success: true,
      data: { children }
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching children'
    });
  }
};

// Get a specific child
const getChild = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      parentId: req.user._id,
      isActive: true
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    res.json({
      success: true,
      data: { child }
    });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching child'
    });
  }
};

// Create a new child
const createChild = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, age, gender } = req.body;
    let profilePicture = null;

    // Handle uploaded file
    if (req.file) {
      profilePicture = `/uploads/children/${req.file.filename}`;
    } else {
      // Set default avatar if no image uploaded
      profilePicture = `/uploads/children/default-avatar.svg`;
    }

    // Check plan limits
    const existingChildrenCount = await Child.countDocuments({
      parentId: req.user._id,
      isActive: true
    });

    const planLimits = {
      solo: 1,
      family: 5,
      school: 50
    };

    if (existingChildrenCount >= planLimits[req.user.planType]) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum number of children for your ${req.user.planType} plan`
      });
    }

    // Create new child
    const child = new Child({
      parentId: req.user._id,
      name,
      age,
      gender,
      profilePicture
    });

    await child.save();

    res.status(201).json({
      success: true,
      message: 'Child created successfully',
      data: { child }
    });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating child'
    });
  }
};

// Update a child
const updateChild = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, age, gender } = req.body;
    let updateData = { name, age, gender, updatedAt: new Date() };

    // Handle uploaded file
    if (req.file) {
      updateData.profilePicture = `/uploads/children/${req.file.filename}`;
    } else if (!req.body.keepExistingImage) {
      // Set default avatar if no image uploaded and not keeping existing
      updateData.profilePicture = `/uploads/children/default-avatar.svg`;
    }

    const child = await Child.findOneAndUpdate(
      { 
        _id: req.params.id, 
        parentId: req.user._id, 
        isActive: true 
      },
      updateData,
      { new: true }
    );

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    res.json({
      success: true,
      message: 'Child updated successfully',
      data: { child }
    });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating child'
    });
  }
};

// Delete a child (soft delete)
const deleteChild = async (req, res) => {
  try {
    const child = await Child.findOneAndUpdate(
      { 
        _id: req.params.id, 
        parentId: req.user._id, 
        isActive: true 
      },
      { 
        isActive: false,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    res.json({
      success: true,
      message: 'Child deleted successfully'
    });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting child'
    });
  }
};

// Regenerate login code for a child
const regenerateLoginCode = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      parentId: req.user._id,
      isActive: true
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Generate new login code
    let newLoginCode;
    let isUnique = false;
    
    while (!isUnique) {
      newLoginCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existingChild = await Child.findOne({ 
        loginCode: newLoginCode,
        _id: { $ne: child._id }
      });
      if (!existingChild) {
        isUnique = true;
      }
    }

    child.loginCode = newLoginCode;
    child.updatedAt = new Date();
    await child.save();

    res.json({
      success: true,
      message: 'Login code regenerated successfully',
      data: { loginCode: newLoginCode }
    });
  } catch (error) {
    console.error('Regenerate login code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while regenerating login code'
    });
  }
};

module.exports = {
  getChildren,
  getChild,
  createChild,
  updateChild,
  deleteChild,
  regenerateLoginCode,
  upload
};
