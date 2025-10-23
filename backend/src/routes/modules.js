const express = require('express');
const { 
  getModules, 
  getModule, 
  getModulesByCategory, 
  getRecommendedModulesForChild 
} = require('../controllers/moduleController');

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all learning modules (with optional filters)
// @access  Public
router.get('/', getModules);

// @route   GET /api/modules/:id
// @desc    Get a specific learning module
// @access  Public
router.get('/:id', getModule);

// @route   GET /api/modules/category/:category
// @desc    Get modules by category
// @access  Public
router.get('/category/:category', getModulesByCategory);

// @route   GET /api/modules/recommended/:childId
// @desc    Get recommended modules for a child
// @access  Public (for now, could be protected later)
router.get('/recommended/:childId', getRecommendedModulesForChild);

module.exports = router;
