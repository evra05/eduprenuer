// In-memory achievement storage for development when MongoDB is not available
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/achievements.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class InMemoryAchievement {
  constructor(data) {
    this._id = data._id || this.generateId();
    this.childId = data.childId;
    this.achievementType = data.achievementType;
    this.title = data.title;
    this.description = data.description;
    this.icon = data.icon;
    this.points = data.points || 0;
    this.moduleId = data.moduleId;
    this.metadata = data.metadata || {};
    this.earnedAt = data.earnedAt || new Date();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async save() {
    const achievements = InMemoryAchievement.getAllAchievements();
    const existingIndex = achievements.findIndex(a => a._id === this._id);
    
    if (existingIndex >= 0) {
      achievements[existingIndex] = this.toObject();
    } else {
      achievements.push(this.toObject());
    }
    
    InMemoryAchievement.saveAchievements(achievements);
    return this;
  }

  static async find(query) {
    const achievements = InMemoryAchievement.getAllAchievements();
    return achievements.filter(achievement => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return achievement._id === query[key];
        }
        if (key === 'childId') {
          return achievement.childId === query[key];
        }
        if (key === 'achievementType') {
          return achievement.achievementType === query[key];
        }
        return achievement[key] === query[key];
      });
    });
  }

  static async findById(id) {
    const achievements = InMemoryAchievement.getAllAchievements();
    return achievements.find(achievement => achievement._id === id);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const achievements = InMemoryAchievement.getAllAchievements();
    const index = achievements.findIndex(achievement => achievement._id === id);
    
    if (index === -1) {
      return null;
    }
    
    const achievement = achievements[index];
    const updatedAchievement = { ...achievement, ...update };
    achievements[index] = updatedAchievement;
    
    InMemoryAchievement.saveAchievements(achievements);
    
    return options.new ? new InMemoryAchievement(updatedAchievement) : new InMemoryAchievement(achievement);
  }

  static async insertMany(achievementsData) {
    const achievements = InMemoryAchievement.getAllAchievements();
    const newAchievements = achievementsData.map(data => new InMemoryAchievement(data));
    achievements.push(...newAchievements.map(a => a.toObject()));
    
    InMemoryAchievement.saveAchievements(achievements);
    return newAchievements;
  }

  static getAllAchievements() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading achievements file:', error);
    }
    return [];
  }

  static saveAchievements(achievements) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(achievements, null, 2));
    } catch (error) {
      console.error('Error saving achievements file:', error);
    }
  }

  toObject() {
    return {
      _id: this._id,
      childId: this.childId,
      achievementType: this.achievementType,
      title: this.title,
      description: this.description,
      icon: this.icon,
      points: this.points,
      moduleId: this.moduleId,
      metadata: this.metadata,
      earnedAt: this.earnedAt
    };
  }
}

module.exports = InMemoryAchievement;
