const { body } = require('express-validator');

const childValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('age')
    .customSanitizer(value => parseInt(value))
    .isInt({ min: 5, max: 17 })
    .withMessage('Age must be between 5 and 17'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be male, female, other, or prefer-not-to-say')
    // Note: profilePicture validation removed since it's handled by multer middleware
];

const updateChildValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('age')
    .optional()
    .customSanitizer(value => parseInt(value))
    .isInt({ min: 5, max: 17 })
    .withMessage('Age must be between 5 and 17'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be male, female, other, or prefer-not-to-say')
    // Note: profilePicture validation removed since it's handled by multer middleware
];

module.exports = {
  childValidation,
  updateChildValidation
};
