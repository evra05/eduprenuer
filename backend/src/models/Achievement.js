const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  childId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Child', 
    required: true 
  },
  achievementType: { 
    type: String, 
    enum: ['module-completion', 'perfect-score', 'time-milestone', 'streak', 'special'], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  icon: String,
  points: { 
    type: Number, 
    default: 0 
  },
  moduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LearningModule' 
  },
  metadata: Object,
  earnedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for efficient queries
achievementSchema.index({ childId: 1, earnedAt: -1 });
achievementSchema.index({ childId: 1, achievementType: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
