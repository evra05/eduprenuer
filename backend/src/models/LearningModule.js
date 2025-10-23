const mongoose = require('mongoose');

const learningModuleSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: String,
  ageRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['money-basics', 'business-ideas', 'saving-spending', 'business-math', 'entrepreneurship'], 
    required: true 
  },
  estimatedDuration: Number, // in minutes
  content: {
    introduction: String,
    objectives: [String],
    lessons: [{
      id: String,
      title: String,
      content: String,
      type: { type: String, enum: ['text', 'video', 'interactive', 'quiz'] },
      mediaUrl: String,
      order: Number
    }],
    activities: [{
      id: String,
      title: String,
      description: String,
      type: { type: String, enum: ['quiz', 'simulation', 'game', 'worksheet'] },
      questions: [Object],
      scoring: Object
    }],
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  },
  prerequisites: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LearningModule' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LearningModule', learningModuleSchema);
