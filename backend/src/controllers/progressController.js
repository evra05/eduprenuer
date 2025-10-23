const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const Child = require('../models/Child');
const LearningModule = require('../models/LearningModule');
const InMemoryProgress = require('../models/InMemoryProgress');
const InMemoryChild = require('../models/InMemoryChild');
const InMemoryLearningModule = require('../models/InMemoryLearningModule');
const { checkAchievements } = require('../services/achievementService');

// Get progress for a child
const getChildProgress = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify child belongs to the authenticated parent
    const child = await Child.findOne({
      _id: childId,
      parentId: req.user._id,
      isActive: true
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const progress = await Progress.find({ childId })
      .populate('moduleId', 'title category difficultyLevel estimatedDuration')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress'
    });
  }
};

// Start a module (create progress record)
const startModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { childId } = req.body;

    // Verify child belongs to the authenticated parent
    const child = await Child.findOne({
      _id: childId,
      parentId: req.user._id,
      isActive: true
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    // Check if module exists
    const module = await LearningModule.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if progress already exists
    let progress = await Progress.findOne({ childId, moduleId });
    
    if (!progress) {
      // Create new progress record
      progress = new Progress({
        childId,
        moduleId,
        status: 'in-progress',
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
      await progress.save();
    } else {
      // Update existing progress
      progress.status = 'in-progress';
      progress.lastAccessedAt = new Date();
      if (!progress.startedAt) {
        progress.startedAt = new Date();
      }
      await progress.save();
    }

    await progress.populate('moduleId', 'title category difficultyLevel estimatedDuration');

    res.json({
      success: true,
      message: 'Module started successfully',
      data: { progress }
    });
  } catch (error) {
    console.error('Start module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while starting module'
    });
  }
};

// Update module progress
const updateProgress = async (req, res) => {
  try {
    const { progressId } = req.params;
    const { completionPercentage, timeSpent, status, scores } = req.body;

    const progress = await Progress.findById(progressId);
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Verify child belongs to the authenticated parent
    const child = await Child.findOne({
      _id: progress.childId,
      parentId: req.user._id,
      isActive: true
    });

    if (!child) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update progress
    if (completionPercentage !== undefined) {
      progress.completionPercentage = Math.min(100, Math.max(0, completionPercentage));
    }
    
    if (timeSpent !== undefined) {
      progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
    }
    
    if (status) {
      progress.status = status;
      if (status === 'completed' && !progress.completedAt) {
        progress.completedAt = new Date();
      }
    }
    
    if (scores) {
      progress.scores = { ...progress.scores, ...scores };
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    await progress.populate('moduleId', 'title category difficultyLevel estimatedDuration');

    // Check for achievements if module is completed
    if (status === 'completed') {
      try {
        await checkAchievements(progress.childId, progress, progress.moduleId);
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError);
        // Don't fail the request if achievement checking fails
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
};

// Get module progress for a child (child's perspective)
const getModuleProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const childId = req.child._id;

    console.log('📊 Getting module progress for child:', childId, 'module:', moduleId);

    // Check if MongoDB is connected and if childId is a valid ObjectID
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(childId);
    let progress, module;

    if (isMongoConnected && isValidObjectId) {
      // Use MongoDB models for valid ObjectIDs
      progress = await Progress.findOne({ childId, moduleId })
        .populate('moduleId', 'title category difficultyLevel estimatedDuration content');
      module = await LearningModule.findById(moduleId);
    } else {
      // Use in-memory models for in-memory IDs or when MongoDB is not connected
      console.log('⚠️  Using in-memory storage for module progress');
      progress = await InMemoryProgress.findOne({ childId, moduleId });
      module = await InMemoryLearningModule.findById(moduleId);
      
      if (progress && module) {
        // Attach module data to progress for consistency
        progress.moduleId = module;
      }
    }

    if (!progress) {
      // Return default progress if not started
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      return res.json({
        success: true,
        data: {
          progress: {
            _id: null,
            childId,
            moduleId: module._id,
            status: 'not-started',
            completionPercentage: 0,
            timeSpent: 0,
            scores: { overall: 0 },
            startedAt: null,
            completedAt: null,
            lastAccessedAt: new Date(),
            moduleId: module
          }
        }
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get module progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module progress'
    });
  }
};

// Update module progress (child's perspective)
const updateModuleProgress = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { completionPercentage, timeSpent, status, scores } = req.body;
    const childId = req.child._id;

    // Check if MongoDB is connected and if childId is a valid ObjectID
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    const isValidObjectId = mongoose.Types.ObjectId.isValid(childId);
    let progress;

    if (isMongoConnected && isValidObjectId) {
      // Use MongoDB model
      progress = await Progress.findOne({ childId, moduleId });
      
      if (!progress) {
        // Create new progress record
        progress = new Progress({
          childId,
          moduleId,
          status: status || 'in-progress',
          completionPercentage: completionPercentage || 0,
          timeSpent: timeSpent || 0,
          scores: scores || { overall: 0 },
          startedAt: new Date(),
          lastAccessedAt: new Date()
        });
      } else {
        // Update existing progress
        if (completionPercentage !== undefined) {
          progress.completionPercentage = Math.min(100, Math.max(0, completionPercentage));
        }
        
        if (timeSpent !== undefined) {
          progress.timeSpent = (progress.timeSpent || 0) + timeSpent;
        }
        
        if (status) {
          progress.status = status;
          if (status === 'completed' && !progress.completedAt) {
            progress.completedAt = new Date();
          }
        }
        
        if (scores) {
          progress.scores = { ...progress.scores, ...scores };
        }

        progress.lastAccessedAt = new Date();
      }

      await progress.save();
      await progress.populate('moduleId', 'title category difficultyLevel estimatedDuration');
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for progress update');
      progress = await InMemoryProgress.findOne({ childId, moduleId });
      
      if (!progress) {
        // Create new progress record
        progress = await InMemoryProgress.create({
          childId,
          moduleId,
          status: status || 'in-progress',
          completionPercentage: completionPercentage || 0,
          timeSpent: timeSpent || 0,
          scores: scores || { overall: 0 },
          startedAt: new Date(),
          lastAccessedAt: new Date()
        });
      } else {
        // Update existing progress
        const updateData = { lastAccessedAt: new Date() };
        
        if (completionPercentage !== undefined) {
          updateData.completionPercentage = Math.min(100, Math.max(0, completionPercentage));
        }
        
        if (timeSpent !== undefined) {
          updateData.timeSpent = (progress.timeSpent || 0) + timeSpent;
        }
        
        if (status) {
          updateData.status = status;
          if (status === 'completed' && !progress.completedAt) {
            updateData.completedAt = new Date();
          }
        }
        
        if (scores) {
          updateData.scores = { ...progress.scores, ...scores };
        }

        progress = await InMemoryProgress.findByIdAndUpdate(progress._id, updateData, { new: true });
      }
      
      // Attach module data for consistency
      const module = await InMemoryLearningModule.findById(moduleId);
      if (module) {
        progress.moduleId = module;
      }
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { progress }
    });
  } catch (error) {
    console.error('Update module progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating progress'
    });
  }
};

module.exports = {
  getChildProgress,
  startModule,
  updateProgress,
  getModuleProgress,
  updateModuleProgress
};
