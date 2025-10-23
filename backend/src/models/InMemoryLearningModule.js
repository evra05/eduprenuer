// In-memory learning module storage for development when MongoDB is not available
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/learning-modules.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class InMemoryLearningModule {
  constructor(data) {
    this._id = data._id || this.generateId();
    this.title = data.title;
    this.description = data.description;
    this.ageRange = data.ageRange;
    this.difficultyLevel = data.difficultyLevel;
    this.category = data.category;
    this.estimatedDuration = data.estimatedDuration;
    this.content = data.content;
    this.prerequisites = data.prerequisites || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async save() {
    const modules = InMemoryLearningModule.getAllModules();
    const existingIndex = modules.findIndex(m => m._id === this._id);
    
    if (existingIndex >= 0) {
      modules[existingIndex] = this.toObject();
    } else {
      modules.push(this.toObject());
    }
    
    InMemoryLearningModule.saveModules(modules);
    return this;
  }

  static find(query) {
    const modules = InMemoryLearningModule.getAllModules();
    
    const filtered = modules.filter(module => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return module._id === query[key];
        }
        if (key === 'isActive') {
          return module.isActive === query[key];
        }
        if (key === 'category') {
          return module.category === query[key];
        }
        if (key === 'difficultyLevel') {
          return module.difficultyLevel === query[key];
        }
        if (key === 'ageRange.min') {
          const queryValue = query[key];
          if (typeof queryValue === 'object' && queryValue.$lte !== undefined) {
            return module.ageRange.min <= queryValue.$lte;
          }
          return module.ageRange.min <= queryValue;
        }
        if (key === 'ageRange.max') {
          const queryValue = query[key];
          if (typeof queryValue === 'object' && queryValue.$gte !== undefined) {
            return module.ageRange.max >= queryValue.$gte;
          }
          return module.ageRange.max >= queryValue;
        }
        return module[key] === query[key];
      });
    });
    
    // Return a query-like object that supports chaining
    let currentData = filtered;
    
    const queryResult = {};
    
    queryResult.select = (fields) => {
      if (fields && fields.includes('-content.activities.questions')) {
        currentData = currentData.map(module => {
          const filteredModule = { ...module };
          if (filteredModule.content && filteredModule.content.activities) {
            filteredModule.content.activities = filteredModule.content.activities.map(activity => {
              const filteredActivity = { ...activity };
              delete filteredActivity.questions;
              return filteredActivity;
            });
          }
          return filteredModule;
        });
        // Update the length property after modifying currentData
        queryResult.length = currentData.length;
      }
      return queryResult;
    };
    
    queryResult.sort = (sortObj) => {
      if (sortObj && Object.keys(sortObj).length > 0) {
        const getNestedValue = (obj, path) => {
          // support keys like 'ageRange.min'
          return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
        };
        currentData = currentData.sort((a, b) => {
          for (const [key, direction] of Object.entries(sortObj)) {
            const aRaw = getNestedValue(a, key);
            const bRaw = getNestedValue(b, key);

            // Try numeric comparison first
            const aNum = typeof aRaw === 'string' && !isNaN(Date.parse(aRaw)) ? new Date(aRaw).getTime() : aRaw;
            const bNum = typeof bRaw === 'string' && !isNaN(Date.parse(bRaw)) ? new Date(bRaw).getTime() : bRaw;

            if (aNum < bNum) return direction === -1 ? -1 : 1;
            if (aNum > bNum) return direction === -1 ? 1 : -1;
          }
          return 0;
        });
        // Update the length property after modifying currentData
        queryResult.length = currentData.length;
      }
      return queryResult;
    };
    
    queryResult.limit = (count) => {
      currentData = currentData.slice(0, count);
      // Update the length property after modifying currentData
      queryResult.length = currentData.length;
      return queryResult;
    };
    
    queryResult.exec = () => currentData;
    queryResult.length = currentData.length;
    
    return queryResult;
  }

  static async findById(id) {
    const modules = InMemoryLearningModule.getAllModules();
    return modules.find(module => module._id === id);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const modules = InMemoryLearningModule.getAllModules();
    const index = modules.findIndex(module => module._id === id);
    
    if (index === -1) {
      return null;
    }
    
    const module = modules[index];
    const updatedModule = { ...module, ...update, updatedAt: new Date() };
    modules[index] = updatedModule;
    
    InMemoryLearningModule.saveModules(modules);
    
    return options.new ? new InMemoryLearningModule(updatedModule) : new InMemoryLearningModule(module);
  }

  static async insertMany(modulesData) {
    const modules = InMemoryLearningModule.getAllModules();
    const newModules = modulesData.map(data => new InMemoryLearningModule(data));
    modules.push(...newModules.map(m => m.toObject()));
    
    InMemoryLearningModule.saveModules(modules);
    return newModules;
  }

  static async deleteMany(query) {
    const modules = InMemoryLearningModule.getAllModules();
    const filtered = modules.filter(module => {
      return Object.keys(query).every(key => {
        if (key === 'isActive') {
          return module.isActive !== query[key];
        }
        return true;
      });
    });
    
    InMemoryLearningModule.saveModules(filtered);
    return { deletedCount: modules.length - filtered.length };
  }

  static getAllModules() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading learning modules file:', error);
    }
    return [];
  }

  static saveModules(modules) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(modules, null, 2));
    } catch (error) {
      console.error('Error saving learning modules file:', error);
    }
  }

  toObject() {
    return {
      _id: this._id,
      title: this.title,
      description: this.description,
      ageRange: this.ageRange,
      difficultyLevel: this.difficultyLevel,
      category: this.category,
      estimatedDuration: this.estimatedDuration,
      content: this.content,
      prerequisites: this.prerequisites,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = InMemoryLearningModule;
