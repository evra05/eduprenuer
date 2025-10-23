const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  planType: { 
    type: String, 
    enum: ['solo', 'family', 'school'], 
    required: true 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'trial'], 
    default: 'trial' 
  },
  stripeCustomerId: String,
  profilePicture: String,
  phoneNumber: String,
  timezone: { 
    type: String, 
    default: 'UTC' 
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);
