// Age-appropriate content utilities
const AGE_GROUPS = {
  EARLY_CHILDHOOD: { min: 5, max: 7, label: 'Early Childhood' },
  MIDDLE_CHILDHOOD: { min: 8, max: 10, label: 'Middle Childhood' },
  LATE_CHILDHOOD: { min: 11, max: 13, label: 'Late Childhood' },
  EARLY_ADOLESCENCE: { min: 14, max: 17, label: 'Early Adolescence' }
};

const DIFFICULTY_LEVELS = {
  beginner: { 
    label: 'Beginner', 
    color: 'green',
    description: 'Simple concepts, lots of visuals',
    maxAge: 10
  },
  intermediate: { 
    label: 'Intermediate', 
    color: 'yellow',
    description: 'Moderate complexity, some reading required',
    minAge: 8,
    maxAge: 14
  },
  advanced: { 
    label: 'Advanced', 
    color: 'red',
    description: 'Complex concepts, analytical thinking',
    minAge: 12
  }
};

const CONTENT_CATEGORIES = {
  'money-basics': {
    label: 'Money Basics',
    icon: '💰',
    description: 'Learning about coins, bills, and basic money concepts',
    ageRange: { min: 5, max: 12 }
  },
  'business-ideas': {
    label: 'Business Ideas',
    icon: '💡',
    description: 'Discovering different types of businesses and entrepreneurship',
    ageRange: { min: 8, max: 17 }
  },
  'saving-spending': {
    label: 'Saving & Spending',
    icon: '🏦',
    description: 'Learning to manage money wisely',
    ageRange: { min: 6, max: 15 }
  },
  'business-math': {
    label: 'Business Math',
    icon: '🧮',
    description: 'Mathematical skills for running a business',
    ageRange: { min: 7, max: 14 }
  },
  'entrepreneurship': {
    label: 'Entrepreneurship',
    icon: '🚀',
    description: 'Advanced business and leadership skills',
    ageRange: { min: 9, max: 17 }
  }
};

// Get age group for a given age
const getAgeGroup = (age) => {
  for (const [key, group] of Object.entries(AGE_GROUPS)) {
    if (age >= group.min && age <= group.max) {
      return { key, ...group };
    }
  }
  return null;
};

// Get appropriate difficulty level for age
const getDifficultyForAge = (age) => {
  if (age <= 7) return 'beginner';
  if (age <= 10) return 'beginner';
  if (age <= 12) return 'intermediate';
  if (age <= 14) return 'intermediate';
  return 'advanced';
};

// Check if content is appropriate for age
const isContentAppropriate = (content, age) => {
  const ageGroup = getAgeGroup(age);
  if (!ageGroup) return false;

  // Check age range
  if (content.ageRange) {
    if (age < content.ageRange.min || age > content.ageRange.max) {
      return false;
    }
  }

  // Check difficulty level
  if (content.difficultyLevel) {
    const difficulty = DIFFICULTY_LEVELS[content.difficultyLevel];
    if (difficulty.minAge && age < difficulty.minAge) return false;
    if (difficulty.maxAge && age > difficulty.maxAge) return false;
  }

  // Check category appropriateness
  if (content.category) {
    const category = CONTENT_CATEGORIES[content.category];
    if (category && category.ageRange) {
      if (age < category.ageRange.min || age > category.ageRange.max) {
        return false;
      }
    }
  }

  return true;
};

// Get recommended modules for age
const getRecommendedModules = (modules, age) => {
  return modules.filter(module => isContentAppropriate(module, age));
};

// Get content complexity score
const getContentComplexity = (content) => {
  let score = 0;
  
  // Base score from difficulty
  if (content.difficultyLevel === 'beginner') score += 1;
  else if (content.difficultyLevel === 'intermediate') score += 2;
  else if (content.difficultyLevel === 'advanced') score += 3;
  
  // Adjust based on age range
  if (content.ageRange) {
    const range = content.ageRange.max - content.ageRange.min;
    score += Math.min(range / 5, 1); // Wider range = more complex
  }
  
  // Adjust based on content length
  if (content.content && content.content.lessons) {
    score += Math.min(content.content.lessons.length / 5, 1);
  }
  
  return Math.min(score, 5); // Cap at 5
};

// Get learning path recommendations
const getLearningPath = (age, completedModules = []) => {
  const ageGroup = getAgeGroup(age);
  if (!ageGroup) return [];

  const path = [];
  
  // Always start with money basics for younger children
  if (age <= 10) {
    path.push({
      category: 'money-basics',
      priority: 1,
      reason: 'Foundation for all financial learning'
    });
  }
  
  // Add saving & spending for middle childhood
  if (age >= 6 && age <= 12) {
    path.push({
      category: 'saving-spending',
      priority: 2,
      reason: 'Essential life skill'
    });
  }
  
  // Add business ideas for older children
  if (age >= 8) {
    path.push({
      category: 'business-ideas',
      priority: 3,
      reason: 'Encourages creativity and entrepreneurship'
    });
  }
  
  // Add business math for children who can handle it
  if (age >= 7) {
    path.push({
      category: 'business-math',
      priority: 4,
      reason: 'Practical math skills'
    });
  }
  
  // Add advanced entrepreneurship for older children
  if (age >= 12) {
    path.push({
      category: 'entrepreneurship',
      priority: 5,
      reason: 'Leadership and advanced business skills'
    });
  }
  
  return path.sort((a, b) => a.priority - b.priority);
};

module.exports = {
  AGE_GROUPS,
  DIFFICULTY_LEVELS,
  CONTENT_CATEGORIES,
  getAgeGroup,
  getDifficultyForAge,
  isContentAppropriate,
  getRecommendedModules,
  getContentComplexity,
  getLearningPath
};
