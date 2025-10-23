const { v4: uuidv4 } = require('uuid');

class InMemoryProgress {
  constructor(data) {
    this._id = data._id || uuidv4();
    this.childId = data.childId;
    this.moduleId = data.moduleId;
    this.status = data.status || 'not-started';
    this.completionPercentage = data.completionPercentage || 0;
    this.scores = data.scores || { overall: 0 };
    this.timeSpent = data.timeSpent || 0;
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.lastAccessedAt = data.lastAccessedAt || new Date();
    this.notes = data.notes;
    this.parentNotes = data.parentNotes;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods for database-like operations
  static async findOne(query) {
    const progress = InMemoryProgress.progresses.find(p => {
      return Object.keys(query).every(key => {
        if (key === '_id' || key === 'childId' || key === 'moduleId') {
          return p[key] === query[key];
        }
        return p[key] === query[key];
      });
    });
    return progress ? new InMemoryProgress(progress) : null;
  }

  static async find(query = {}) {
    let results = InMemoryProgress.progresses;
    
    if (Object.keys(query).length > 0) {
      results = results.filter(p => {
        return Object.keys(query).every(key => {
          if (key === '_id' || key === 'childId' || key === 'moduleId') {
            return p[key] === query[key];
          }
          return p[key] === query[key];
        });
      });
    }
    
    return results.map(p => new InMemoryProgress(p));
  }

  static async create(data) {
    const progress = new InMemoryProgress(data);
    InMemoryProgress.progresses.push(progress);
    return progress;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const index = InMemoryProgress.progresses.findIndex(p => p._id === id);
    if (index === -1) {
      return null;
    }

    const progress = InMemoryProgress.progresses[index];
    const updatedProgress = {
      ...progress,
      ...updateData,
      updatedAt: new Date()
    };

    InMemoryProgress.progresses[index] = updatedProgress;
    return new InMemoryProgress(updatedProgress);
  }

  static async findById(id) {
    const progress = InMemoryProgress.progresses.find(p => p._id === id);
    return progress ? new InMemoryProgress(progress) : null;
  }

  // Instance methods
  async save() {
    const index = InMemoryProgress.progresses.findIndex(p => p._id === this._id);
    if (index === -1) {
      // New progress
      this.createdAt = new Date();
      this.updatedAt = new Date();
      InMemoryProgress.progresses.push(this);
    } else {
      // Update existing
      this.updatedAt = new Date();
      InMemoryProgress.progresses[index] = this;
    }
    return this;
  }

  async populate(field, select) {
    // For in-memory, we'll just return the current object
    // The actual population will be handled by the controller
    return this;
  }

  // Static storage
  static progresses = [];

  // Utility method to clear all data (for testing)
  static clearAll() {
    InMemoryProgress.progresses = [];
  }

  // Utility method to get all progresses (for debugging)
  static getAllProgresses() {
    return InMemoryProgress.progresses.map(p => new InMemoryProgress(p));
  }
}

module.exports = InMemoryProgress;
