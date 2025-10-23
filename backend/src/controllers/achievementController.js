const { getChildAchievements: fetchChildAchievements, getAchievementStats } = require('../services/achievementService');

// Get achievements for a child (parent view)
const getChildAchievements = async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify child belongs to the authenticated parent
    const InMemoryChild = require('../models/InMemoryChild');
    const child = await InMemoryChild.findOne({
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

    const achievements = await fetchChildAchievements(childId);
    const stats = await getAchievementStats(childId);

    res.json({
      success: true,
      data: { 
        achievements,
        stats
      }
    });
  } catch (error) {
    console.error('Get child achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
};

// Get achievements for current child (child view)
const getMyAchievements = async (req, res) => {
  try {
    // For testing without authentication, use a default child ID
    const childId = req.child?._id || 'fyoh3ku14'; // Use a known child ID from seed data
    
    const achievements = await fetchChildAchievements(childId);
    const stats = await getAchievementStats(childId);

    res.json({
      success: true,
      data: { 
        achievements,
        stats
      }
    });
  } catch (error) {
    console.error('Get my achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
};

module.exports = {
  getChildAchievements,
  getMyAchievements
};
