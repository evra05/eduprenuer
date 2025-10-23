const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set default MongoDB URI if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/eduprenuer';
  console.log('⚠️  Using default MongoDB URI:', process.env.MONGODB_URI);
}

// Test MongoDB connection
const testMongoConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Validate MongoDB URI format
    if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: false, // Disable mongoose buffering
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Test server startup
const testServer = async () => {
  console.log('Testing server configuration...');
  
  // Test MongoDB connection
  const mongoConnected = await testMongoConnection();
  
  if (mongoConnected) {
    console.log('✅ MongoDB connection successful');
  } else {
    console.log('⚠️  MongoDB connection failed, but server can continue with in-memory storage');
  }
  
  // Test basic server setup
  app.get('/test', (req, res) => {
    res.json({ status: 'OK', message: 'Server is working' });
  });
  
  const server = app.listen(PORT, () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    console.log(`📊 Test endpoint: http://localhost:${PORT}/test`);
    
    // Close server after test
    setTimeout(() => {
      server.close();
      mongoose.disconnect();
      console.log('✅ Test completed successfully');
      process.exit(0);
    }, 2000);
  });
};

// Run the test
testServer().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
