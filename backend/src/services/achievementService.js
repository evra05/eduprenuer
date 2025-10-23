const Achievement = require('../models/Achievement');
const InMemoryAchievement = require('../models/InMemoryAchievement');
const Progress = require('../models/Progress');

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  'first-module': {
    type: 'module-completion',
    title: 'First Steps',
    description: 'Completed your first learning module!',
    icon: '🎯',
    points: 10,
    condition: (progress) => progress.status === 'completed'
  },
  'perfect-score': {
    type: 'perfect-score',
    title: 'Perfect Score',
    description: 'Got 100% on a module quiz!',
    icon: '⭐',
    points: 25,
    condition: (progress) => progress.scores?.overall === 100
  },
  'quick-learner': {
    type: 'time-milestone',
    title: 'Quick Learner',
    description: 'Completed a module in record time!',
    icon: '⚡',
    points: 15,
    condition: (progress, module) => {
      const expectedTime = module.estimatedDuration;
      const actualTime = progress.timeSpent;
      return actualTime && actualTime < (expectedTime * 0.5); // 50% faster than expected
    }
  },
  'dedicated-student': {
    type: 'streak',
    title: 'Dedicated Student',
    description: 'Completed 3 modules in a row!',
    icon: '🔥',
    points: 30,
    condition: async (childId) => {
      const recentProgress = await Progress.find({
        childId,
        status: 'completed',
        completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }).sort({ completedAt: -1 });
      
      return recentProgress.length >= 3;
    }
  },
  'business-master': {
    type: 'special',
    title: 'Business Master',
    description: 'Completed all business-related modules!',
    icon: '👑',
    points: 50,
    condition: async (childId) => {
      const businessModules = await Progress.find({
        childId,
        status: 'completed',
        'moduleId.category': { $in: ['business-ideas', 'entrepreneurship'] }
      });
      
      return businessModules.length >= 2; // Adjust based on actual module count
    }
  },
  'money-expert': {
    type: 'special',
    title: 'Money Expert',
    description: 'Mastered all money-related modules!',
    icon: '💰',
    points: 40,
    condition: async (childId) => {
      const moneyModules = await Progress.find({
        childId,
        status: 'completed',
        'moduleId.category': { $in: ['money-basics', 'saving-spending'] }
      });
      
      return moneyModules.length >= 2;
    }
  },
  'math-wizard': {
    type: 'special',
    title: 'Math Wizard',
    description: 'Excelled in business math modules!',
    icon: '🧮',
    points: 35,
    condition: async (childId) => {
      const mathModules = await Progress.find({
        childId,
        status: 'completed',
        'moduleId.category': 'business-math',
        'scores.overall': { $gte: 90 }
      });
      
      return mathModules.length >= 1;
    }
  },
  'weekend-warrior': {
    type: 'time-milestone',
    title: 'Weekend Warrior',
    description: 'Completed modules on weekends!',
    icon: '🏆',
    points: 20,
    condition: async (childId) => {
      const weekendProgress = await Progress.find({
        childId,
        status: 'completed',
        completedAt: {
          $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // Last 14 days
        }
      });
      
      const weekendCount = weekendProgress.filter(p => {
        const day = new Date(p.completedAt).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      }).length;
      
      return weekendCount >= 2;
    }
  },
  'early-bird': {
    type: 'time-milestone',
    title: 'Early Bird',
    description: 'Completed modules in the morning!',
    icon: '🌅',
    points: 15,
    condition: async (childId) => {
      const morningProgress = await Progress.find({
        childId,
        status: 'completed',
        completedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      });
      
      const morningCount = morningProgress.filter(p => {
        const hour = new Date(p.completedAt).getHours();
        return hour >= 6 && hour <= 10; // 6 AM to 10 AM
      }).length;
      
      return morningCount >= 3;
    }
  },
  'night-owl': {
    type: 'time-milestone',
    title: 'Night Owl',
    description: 'Completed modules in the evening!',
    icon: '🦉',
    points: 15,
    condition: async (childId) => {
      const eveningProgress = await Progress.find({
        childId,
        status: 'completed',
        completedAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      });
      
      const eveningCount = eveningProgress.filter(p => {
        const hour = new Date(p.completedAt).getHours();
        return hour >= 18 && hour <= 22; // 6 PM to 10 PM
      }).length;
      
      return eveningCount >= 3;
    }
  },
  'streak-master': {
    type: 'streak',
    title: 'Streak Master',
    description: 'Completed modules for 7 days straight!',
    icon: '🔥🔥',
    points: 100,
    condition: async (childId) => {
      const recentProgress = await Progress.find({
        childId,
        status: 'completed',
        completedAt: { $gte: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } // Last 10 days
      }).sort({ completedAt: -1 });
      
      if (recentProgress.length < 7) return false;
      
      // Check for consecutive days
      const dates = recentProgress.map(p => 
        new Date(p.completedAt).toDateString()
      );
      const uniqueDates = [...new Set(dates)];
      
      // Sort dates and check for 7 consecutive days
      const sortedDates = uniqueDates.sort((a, b) => new Date(a) - new Date(b));
      
      for (let i = 0; i <= sortedDates.length - 7; i++) {
        const startDate = new Date(sortedDates[i]);
        let consecutive = true;
        
        for (let j = 1; j < 7; j++) {
          const expectedDate = new Date(startDate);
          expectedDate.setDate(startDate.getDate() + j);
          
          if (!sortedDates.includes(expectedDate.toDateString())) {
            consecutive = false;
            break;
          }
        }
        
        if (consecutive) return true;
      }
      
      return false;
    }
  }
};

// Check and award achievements for a child
const checkAchievements = async (childId, progressData = null, moduleData = null) => {
  const newAchievements = [];

  try {
    // Get existing achievements to avoid duplicates
    const existingAchievements = await Achievement.find({ childId });
    const existingTypes = new Set(existingAchievements.map(a => a.achievementType));

    // Check each achievement definition
    for (const [achievementKey, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
      // Skip if already earned
      if (existingTypes.has(definition.type)) {
        continue;
      }

      let shouldAward = false;

      // Check condition based on achievement type
      if (definition.type === 'module-completion' && progressData) {
        shouldAward = definition.condition(progressData);
      } else if (definition.type === 'perfect-score' && progressData) {
        shouldAward = definition.condition(progressData);
      } else if (definition.type === 'time-milestone' && progressData && moduleData) {
        shouldAward = definition.condition(progressData, moduleData);
      } else if (definition.type === 'streak') {
        shouldAward = await definition.condition(childId);
      } else if (definition.type === 'special') {
        shouldAward = await definition.condition(childId);
      }

      if (shouldAward) {
        const achievement = new Achievement({
          childId,
          achievementType: definition.type,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          points: definition.points,
          moduleId: progressData?.moduleId,
          metadata: {
            achievementKey,
            earnedAt: new Date()
          }
        });

        await achievement.save();
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Get achievements for a child
const getChildAchievements = async (childId) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    
    if (isMongoConnected) {
      const achievements = await Achievement.find({ childId })
        .populate('moduleId', 'title category')
        .sort({ earnedAt: -1 });
      return achievements;
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for achievements');
      const achievements = await InMemoryAchievement.find({ childId });
      return achievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
    }
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

// Get achievement statistics for a child
const getAchievementStats = async (childId) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    
    let achievements;
    if (isMongoConnected) {
      achievements = await Achievement.find({ childId });
    } else {
      // Use in-memory model
      achievements = await InMemoryAchievement.find({ childId });
    }
    
    const stats = {
      totalAchievements: achievements.length,
      totalPoints: achievements.reduce((sum, a) => sum + a.points, 0),
      byType: {},
      level: calculateLevel(achievements),
      nextLevelPoints: calculateNextLevelPoints(achievements),
      streak: await calculateCurrentStreak(childId),
      badges: getBadges(achievements)
    };

    // Group by type
    achievements.forEach(achievement => {
      if (!stats.byType[achievement.achievementType]) {
        stats.byType[achievement.achievementType] = 0;
      }
      stats.byType[achievement.achievementType]++;
    });

    return stats;
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return {
      totalAchievements: 0,
      totalPoints: 0,
      byType: {},
      level: 1,
      nextLevelPoints: 100,
      streak: 0,
      badges: []
    };
  }
};

// Calculate level based on points
const calculateLevel = (achievements) => {
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  return Math.floor(totalPoints / 100) + 1;
};

// Calculate points needed for next level
const calculateNextLevelPoints = (achievements) => {
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const currentLevel = Math.floor(totalPoints / 100) + 1;
  return (currentLevel * 100) - totalPoints;
};

// Calculate current streak
const calculateCurrentStreak = async (childId) => {
  try {
    const recentProgress = await Progress.find({
      childId,
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }).sort({ completedAt: -1 });
    
    if (recentProgress.length === 0) return 0;
    
    const dates = recentProgress.map(p => 
      new Date(p.completedAt).toDateString()
    );
    const uniqueDates = [...new Set(dates)];
    const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if completed today or yesterday
    if (sortedDates.includes(today) || sortedDates.includes(yesterday)) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        const dayDiff = (previousDate - currentDate) / (24 * 60 * 60 * 1000);
        
        if (dayDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

// Get badges based on achievements
const getBadges = (achievements) => {
  const badges = [];
  
  const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
  const totalAchievements = achievements.length;
  
  // Points badges
  if (totalPoints >= 100) badges.push({ name: 'Century Club', icon: '💯', description: 'Earned 100+ points' });
  if (totalPoints >= 500) badges.push({ name: 'Half Grand', icon: '🎖️', description: 'Earned 500+ points' });
  if (totalPoints >= 1000) badges.push({ name: 'Grand Master', icon: '👑', description: 'Earned 1000+ points' });
  
  // Achievement count badges
  if (totalAchievements >= 5) badges.push({ name: 'Achiever', icon: '🏆', description: 'Earned 5+ achievements' });
  if (totalAchievements >= 10) badges.push({ name: 'Super Achiever', icon: '🌟', description: 'Earned 10+ achievements' });
  if (totalAchievements >= 20) badges.push({ name: 'Legend', icon: '⭐', description: 'Earned 20+ achievements' });
  
  // Special badges based on achievement types
  const hasPerfectScore = achievements.some(a => a.achievementType === 'perfect-score');
  if (hasPerfectScore) badges.push({ name: 'Perfectionist', icon: '⭐', description: 'Got a perfect score' });
  
  const hasStreak = achievements.some(a => a.achievementType === 'streak');
  if (hasStreak) badges.push({ name: 'Consistent', icon: '🔥', description: 'Built a learning streak' });
  
  const hasTimeMilestone = achievements.some(a => a.achievementType === 'time-milestone');
  if (hasTimeMilestone) badges.push({ name: 'Speed Demon', icon: '⚡', description: 'Completed modules quickly' });
  
  return badges;
};

// Get leaderboard data
const getLeaderboard = async (limit = 10) => {
  try {
    const children = await require('../models/InMemoryChild').find({ isActive: true });
    const leaderboard = [];
    
    for (const child of children) {
      const achievements = await Achievement.find({ childId: child._id });
      const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
      const streak = await calculateCurrentStreak(child._id);
      
      leaderboard.push({
        childId: child._id,
        name: child.name,
        points: totalPoints,
        achievements: achievements.length,
        streak: streak,
        level: calculateLevel(achievements)
      });
    }
    
    return leaderboard
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

module.exports = {
  checkAchievements,
  getChildAchievements,
  getAchievementStats,
  calculateLevel,
  calculateCurrentStreak,
  getBadges,
  getLeaderboard
};
