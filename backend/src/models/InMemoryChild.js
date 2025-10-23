// In-memory child storage for development when MongoDB is not available
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/children.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class InMemoryChild {
  constructor(data) {
    this._id = data._id || this.generateId();
    this.parentId = data.parentId;
    this.name = data.name;
    this.age = data.age;
    this.gender = data.gender;
    this.profilePicture = data.profilePicture;
    this.loginCode = data.loginCode || this.generateLoginCode();
    this.companyProfile = data.companyProfile || {
      companyName: '',
      businessType: '',
      logo: '',
      description: '',
      virtualOffice: {
        theme: 'modern',
        decorations: [],
        achievements: []
      }
    };
    this.preferences = data.preferences || {
      difficultyLevel: 'beginner',
      learningStyle: 'visual'
    };
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastActivityAt = data.lastActivityAt;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  generateLoginCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async save() {
    const children = InMemoryChild.getAllChildren();
    const existingIndex = children.findIndex(c => c._id === this._id);
    
    if (existingIndex >= 0) {
      children[existingIndex] = this.toObject();
    } else {
      children.push(this.toObject());
    }
    
    InMemoryChild.saveChildren(children);
    return this;
  }

  // ... existing code ...

  static async find(query = {}) {
    const children = InMemoryChild.getAllChildren();
    const filtered = children.filter(child => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return child._id === query[key];
        }
        if (key === 'parentId') {
          return child.parentId === query[key];
        }
        if (key === 'isActive') {
          return child.isActive === query[key];
        }
        return child[key] === query[key];
      });
    });
    
    // Return a query-like object that supports chaining
    const queryResult = {
      sort: (sortObj) => {
        if (sortObj && Object.keys(sortObj).length > 0) {
          return filtered.sort((a, b) => {
            for (const [key, direction] of Object.entries(sortObj)) {
              const aVal = new Date(a[key]);
              const bVal = new Date(b[key]);
              
              if (aVal < bVal) return direction === -1 ? -1 : 1;
              if (aVal > bVal) return direction === -1 ? 1 : -1;
            }
            return 0;
          });
        }
        return filtered;
      }
    };
    
    // Add array methods to make it behave like an array
    queryResult.forEach = filtered.forEach.bind(filtered);
    queryResult.map = filtered.map.bind(filtered);
    queryResult.filter = filtered.filter.bind(filtered);
    queryResult.length = filtered.length;
    
    return queryResult;
  }

  static async findOne(query) {
    const children = InMemoryChild.getAllChildren();
    return children.find(child => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return child._id === query[key];
        }
        return child[key] === query[key];
      });
    });
  }

  static async findById(id) {
    const children = InMemoryChild.getAllChildren();
    return children.find(child => child._id === id);
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const children = InMemoryChild.getAllChildren();
    const index = children.findIndex(child => child._id === id);
    
    if (index === -1) {
      return null;
    }
    
    const child = children[index];
    const updatedChild = { ...child };
    
    // Handle both dot notation and direct updates
    Object.keys(update).forEach(key => {
      if (key.includes('.')) {
        // Handle nested properties like 'companyProfile.companyName'
        const parts = key.split('.');
        let target = updatedChild;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!target[parts[i]]) {
            target[parts[i]] = {};
          }
          target = target[parts[i]];
        }
        
        target[parts[parts.length - 1]] = update[key];
      } else {
        // Direct property update
        updatedChild[key] = update[key];
      }
    });
    
    updatedChild.updatedAt = new Date();
    children[index] = updatedChild;
    
    InMemoryChild.saveChildren(children);
    
    return options.new ? new InMemoryChild(updatedChild) : new InMemoryChild(child);
  }

  static async findOneAndUpdate(query, update, options = {}) {
    const children = InMemoryChild.getAllChildren();
    const index = children.findIndex(child => {
      return Object.keys(query).every(key => {
        if (key === '_id') {
          return child._id === query[key];
        }
        return child[key] === query[key];
      });
    });
    
    if (index === -1) {
      return null;
    }
    
    const child = children[index];
    const updatedChild = { ...child, ...update, updatedAt: new Date() };
    children[index] = updatedChild;
    
    InMemoryChild.saveChildren(children);
    
    return options.new ? new InMemoryChild(updatedChild) : new InMemoryChild(child);
  }

  static async countDocuments(query) {
    const children = InMemoryChild.getAllChildren();
    return children.filter(child => {
      return Object.keys(query).every(key => child[key] === query[key]);
    }).length;
  }

  static getAllChildren() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading children file:', error);
    }
    return [];
  }

  static saveChildren(children) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(children, null, 2));
    } catch (error) {
      console.error('Error saving children file:', error);
    }
  }

  toObject() {
    return {
      _id: this._id,
      parentId: this.parentId,
      name: this.name,
      age: this.age,
      gender: this.gender,
      profilePicture: this.profilePicture,
      loginCode: this.loginCode,
      companyProfile: this.companyProfile,
      preferences: this.preferences,
      isActive: this.isActive,
      lastActivityAt: this.lastActivityAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = InMemoryChild;
