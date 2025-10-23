const jwt = require('jsonwebtoken');
const Child = require('../models/Child');
const InMemoryChild = require('../models/InMemoryChild');

const childAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided for child auth');
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    console.log('🔍 Child auth token received:', token.substring(0, 20) + '...');
    
    // Decode token to get child ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded child token:', decoded);
    console.log('🔍 Looking for child ID:', decoded.childId);
    
    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    let child;

    if (isMongoConnected) {
      // Check if child ID is a valid MongoDB ObjectId (24 character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(decoded.childId);
      
      if (isValidObjectId) {
        // Use MongoDB model
        child = await Child.findById(decoded.childId).select('-loginCode');
      } else {
        // ID is from in-memory storage, fall back to in-memory model
        console.log('⚠️  Child ID is not a valid ObjectId, using in-memory storage');
        child = await InMemoryChild.findById(decoded.childId);
      }
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for child auth');
      child = await InMemoryChild.findById(decoded.childId);
    }
    
    console.log('🔍 Found child:', child ? `${child.name} (${child._id})` : 'null');
    console.log('🔍 Child is active:', child ? child.isActive : 'N/A');
    
    if (!child) {
      console.log('❌ Child not found with ID:', decoded.childId);
      // List available children for debugging
      if (!isMongoConnected) {
        const allChildren = InMemoryChild.getAllChildren();
        console.log('🔍 Available children:', allChildren.map(c => ({ id: c._id, name: c.name, active: c.isActive })));
      }
      return res.status(401).json({
        success: false,
        message: 'Child not found'
      });
    }
    
    if (!child.isActive) {
      console.log('❌ Child is not active:', child.name);
      return res.status(401).json({
        success: false,
        message: 'Child account is not active'
      });
    }

    console.log('✅ Child auth successful for:', child.name);
    req.child = child;
    next();
  } catch (error) {
    console.error('Child auth middleware error:', error);
    console.log('🔍 Error details:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      console.log('❌ Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // For development, let's be more permissive but still require a valid token structure
    if (process.env.NODE_ENV === 'development' && error.name === 'JsonWebTokenError') {
      console.log('⚠️  Development mode: JWT error, trying to find active child');
      // Try to find a child from the in-memory store for testing
      const children = InMemoryChild.getAllChildren();
      const testChild = children.find(c => c.isActive);
      if (testChild) {
        console.log('⚠️  Using test child for development:', testChild.name);
        req.child = testChild;
        return next();
      }
    }
    
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = childAuth;
