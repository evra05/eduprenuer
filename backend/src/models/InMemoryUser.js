// In-memory user storage for development when MongoDB is not available
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

// Ensure data directory exists
const dataDir = path.dirname(DATA_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class InMemoryUser {
  constructor(data) {
    this._id = data._id || this.generateId();
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.planType = data.planType;
    this.subscriptionStatus = data.subscriptionStatus || 'trial';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isNew = !data._id; // Mark as new if no existing _id
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async save() {
    // Hash password if it's a new user or password has changed
    if (!this._id || this.isNew) {
      try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
      }
    }
    
    const users = InMemoryUser.getAllUsers();
    const existingIndex = users.findIndex(u => u._id === this._id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = this.toObject();
    } else {
      users.push(this.toObject());
    }
    
    InMemoryUser.saveUsers(users);
    return this;
  }

  static async findOne(query) {
    const users = InMemoryUser.getAllUsers();
    const userData = users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
    
    if (userData) {
      return new InMemoryUser(userData);
    }
    return null;
  }

  static async findById(id) {
    const users = InMemoryUser.getAllUsers();
    const userData = users.find(user => user._id === id);
    
    if (userData) {
      return new InMemoryUser(userData);
    }
    return null;
  }

  static getAllUsers() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error reading users file:', error);
    }
    return [];
  }

  static saveUsers(users) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving users file:', error);
    }
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  toJSON() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
  }

  toObject() {
    return {
      _id: this._id,
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      planType: this.planType,
      subscriptionStatus: this.subscriptionStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = InMemoryUser;
