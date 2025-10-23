const express = require('express');
const { getChildAchievements, getMyAchievements } = require('../controllers/achievementController');
const auth = require('../middleware/simpleAuth');
const childAuth = require('../middleware/childAuth');

const router = express.Router();

// Parent routes (require parent authentication)
router.use('/parent', auth);

// @route   GET /api/achievements/parent/:childId
// @desc    Get achievements for a specific child (parent view)
// @access  Private (Parent)
router.get('/parent/:childId', getChildAchievements);

// Child routes (require child authentication)
// router.use('/child', childAuth);

// @route   GET /api/achievements/child
// @desc    Get achievements for current child (child view)
// @access  Private (Child) - temporarily disabled for testing
router.get('/child', getMyAchievements);

module.exports = router;
