const express = require('express');
const { childLogin, getChildProfile, updateCompanyProfile, validateToken } = require('../controllers/childLoginController');
const childAuth = require('../middleware/childAuth');

const router = express.Router();

// @route   POST /api/child/login
// @desc    Child login with unique code
// @access  Public
router.post('/login', childLogin);

// @route   GET /api/child/validate-token
// @desc    Validate child token (public endpoint for token validation)
// @access  Public
router.get('/validate-token', validateToken);

// All routes below require child authentication
router.use(childAuth);

// @route   GET /api/child/profile
// @desc    Get child profile
// @access  Private (Child)
router.get('/profile', getChildProfile);

// @route   PUT /api/child/company-profile
// @desc    Update child company profile
// @access  Private (Child)
router.put('/company-profile', updateCompanyProfile);

// Note: validate-token route is already defined above as public

module.exports = router;
