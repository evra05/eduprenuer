const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  childId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Child', 
    required: true 
  },
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LearningModule', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'paused'], 
    default: 'not-started' 
  },
  completionPercentage: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  scores: {
    overall: { type: Number, min: 0, max: 100 },
    quizzes: [{
      activityId: String,
      score: Number,
      maxScore: Number,
      attempts: Number,
      completedAt: Date
    }],
    activities: [{
      activityId: String,
      completed: Boolean,
      score: Number,
      timeSpent: Number, // in minutes
      completedAt: Date
    }]
  },
  timeSpent: { 
    type: Number, 
    default: 0 
  }, // total time in minutes
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: { 
    type: Date, 
    default: Date.now 
  },
  notes: String,
  parentNotes: String
}, {
  timestamps: true
});

// Ensure one progress record per child per module
progressSchema.index({ childId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
