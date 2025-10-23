const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/simpleAuthController');
const { registerValidation, loginValidation } = require('../validators/userValidation');
const auth = require('../middleware/simpleAuth');

const router = express.Router();

// @route   POST /api/simple-auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/simple-auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/simple-auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

module.exports = router;
