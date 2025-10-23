const express = require('express');
const { 
  getChildren, 
  getChild, 
  createChild, 
  updateChild, 
  deleteChild, 
  regenerateLoginCode,
  upload
} = require('../controllers/childController');
const { childValidation, updateChildValidation } = require('../validators/childValidation');
const auth = require('../middleware/simpleAuth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/children
// @desc    Get all children for the authenticated parent
// @access  Private
router.get('/', getChildren);

// @route   GET /api/children/:id
// @desc    Get a specific child
// @access  Private
router.get('/:id', getChild);

// @route   POST /api/children
// @desc    Create a new child
// @access  Private
router.post('/', upload.single('profilePicture'), childValidation, createChild);

// @route   PUT /api/children/:id
// @desc    Update a child
// @access  Private
router.put('/:id', upload.single('profilePicture'), updateChildValidation, updateChild);

// @route   DELETE /api/children/:id
// @desc    Delete a child (soft delete)
// @access  Private
router.delete('/:id', deleteChild);

// @route   POST /api/children/:id/regenerate-code
// @desc    Regenerate login code for a child
// @access  Private
router.post('/:id/regenerate-code', regenerateLoginCode);

module.exports = router;
