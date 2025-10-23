const express = require('express');
const { 
  getChildProgress, 
  startModule, 
  updateProgress,
  getModuleProgress,
  updateModuleProgress
} = require('../controllers/progressController');
const auth = require('../middleware/simpleAuth');
const childAuth = require('../middleware/childAuth');

const router = express.Router();

// Parent routes (require parent authentication)
router.use('/parent', auth);

// @route   GET /api/progress/parent/:childId
// @desc    Get progress for a specific child (parent view)
// @access  Private (Parent)
router.get('/parent/:childId', getChildProgress);

// @route   POST /api/progress/parent/start/:moduleId
// @desc    Start a module for a child
// @access  Private (Parent)
router.post('/parent/start/:moduleId', startModule);

// @route   PUT /api/progress/parent/:progressId
// @desc    Update progress for a child
// @access  Private (Parent)
router.put('/parent/:progressId', updateProgress);

// Child routes (require child authentication)
router.use('/child', childAuth);

// @route   GET /api/progress/child/:moduleId
// @desc    Get progress for a specific module (child view)
// @access  Private (Child)
router.get('/child/:moduleId', getModuleProgress);

// @route   PUT /api/progress/child/:moduleId
// @desc    Update progress for a specific module (child view)
// @access  Private (Child)
router.put('/child/:moduleId', updateModuleProgress);

module.exports = router;
