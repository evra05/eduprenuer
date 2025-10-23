const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  age: { 
    type: Number, 
    required: true, 
    min: 5, 
    max: 17 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other', 'prefer-not-to-say'] 
  },
  profilePicture: String,
  loginCode: { 
    type: String, 
    required: true, 
    unique: true,
    length: 8
  },
  companyProfile: {
    companyName: String,
    businessType: { 
      type: String, 
      enum: ['lemonade-stand', 'pet-care', 'art-crafts', 'tech-services', 'food-truck', 'other'] 
    },
    logo: String,
    description: String,
    virtualOffice: {
      theme: { type: String, default: 'modern' },
      decorations: [String],
      achievements: [String]
    }
  },
  preferences: {
    difficultyLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'], 
      default: 'beginner' 
    },
    learningStyle: { 
      type: String, 
      enum: ['visual', 'auditory', 'kinesthetic'], 
      default: 'visual' 
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastActivityAt: Date
}, {
  timestamps: true
});

// Generate unique login code before saving
childSchema.pre('save', async function(next) {
  if (!this.isModified('loginCode') || this.loginCode) return next();
  
  try {
    let loginCode;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate 8-character alphanumeric code
      loginCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Check if code already exists
      const existingChild = await this.constructor.findOne({ loginCode });
      if (!existingChild) {
        isUnique = true;
      }
    }
    
    this.loginCode = loginCode;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Child', childSchema);
