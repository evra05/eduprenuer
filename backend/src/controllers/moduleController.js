const LearningModule = require('../models/InMemoryLearningModule');
const { 
  getDifficultyForAge, 
  isContentAppropriate, 
  getRecommendedModules,
  getLearningPath 
} = require('../utils/ageAppropriateContent');

// Get all learning modules
const getModules = async (req, res) => {
  try {
    const { age, category, difficulty, childId } = req.query;
    
    let query = { isActive: true };
    
    // Enhanced age-appropriate filtering
    if (age) {
      const childAge = parseInt(age);
      
      // Use utility function for difficulty
      let adjustedDifficulty = difficulty || getDifficultyForAge(childAge);
      
      // Age range filtering with buffer
      query['ageRange.min'] = { $lte: childAge + 1 }; // Allow slightly advanced content
      query['ageRange.max'] = { $gte: childAge - 1 }; // Allow slightly easier content
      
      // Difficulty filtering
      if (adjustedDifficulty) {
        query.difficultyLevel = adjustedDifficulty;
      }
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by difficulty (if not already set by age)
    if (difficulty && !age) {
      query.difficultyLevel = difficulty;
    }

    const queryResult = LearningModule.find(query)
      .select('-content.activities.questions -content.resources')
      .sort({ 
        // Prioritize by age appropriateness, then difficulty, then creation date
        createdAt: -1 
      });
    
    const modules = queryResult.exec();

    // Additional filtering for child-specific preferences
    let filteredModules = modules;
    if (childId) {
      // This would typically involve checking child's progress and preferences
      // For now, we'll just return the age-appropriate modules
    }

    // Apply additional age-appropriate filtering
    if (age) {
      const childAge = parseInt(age);
      filteredModules = getRecommendedModules(filteredModules, childAge);
    }

    res.json({
      success: true,
      data: { 
        modules: filteredModules,
        filters: {
          age: age ? parseInt(age) : null,
          category: category || null,
          difficulty: difficulty || null
        },
        learningPath: age ? getLearningPath(parseInt(age)) : null
      }
    });
  } catch (error) {
    console.error('Get modules error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a specific learning module
const getModule = async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);

    if (!module || !module.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.json({
      success: true,
      data: { module }
    });
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching module'
    });
  }
};

// Get modules by category
const getModulesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { age } = req.query;
    
    let query = { 
      category, 
      isActive: true 
    };
    
    // Filter by age range
    if (age) {
      const childAge = parseInt(age);
      query['ageRange.min'] = { $lte: childAge };
      query['ageRange.max'] = { $gte: childAge };
    }

    const queryResult = LearningModule.find(query)
      .select('-content.activities.questions -content.resources')
      .sort({ createdAt: -1 });
    
    const modules = queryResult.exec();

    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    console.error('Get modules by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching modules'
    });
  }
};

// Get recommended modules for a child
const getRecommendedModulesForChild = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // This would typically involve checking the child's progress and preferences
    // For now, we'll return modules based on age and difficulty
    const child = await require('../models/InMemoryChild').findById(childId);
    
    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    const query = {
      isActive: true,
      'ageRange.min': { $lte: child.age },
      'ageRange.max': { $gte: child.age },
      difficultyLevel: child.preferences?.difficultyLevel || 'beginner'
    };

    const queryResult = LearningModule.find(query)
      .select('-content.activities.questions -content.resources')
      .sort({ createdAt: -1 })
      .limit(6);
    
    const modules = queryResult.exec();

    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    console.error('Get recommended modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommended modules'
    });
  }
};

module.exports = {
  getModules,
  getModule,
  getModulesByCategory,
  getRecommendedModulesForChild
};
