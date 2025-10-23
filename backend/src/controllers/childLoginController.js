const Child = require('../models/Child');
const InMemoryChild = require('../models/InMemoryChild');
const InMemoryUser = require('../models/InMemoryUser');
const jwt = require('jsonwebtoken');

// Generate JWT token for child
const generateChildToken = (childId) => {
  return jwt.sign({ childId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Child login with unique code
const childLogin = async (req, res) => {
  try {
    const { loginCode } = req.body;

    if (!loginCode) {
      return res.status(400).json({
        success: false,
        message: 'Login code is required'
      });
    }

    // Normalize code (trim and uppercase)
    const normalizedCode = String(loginCode).trim().toUpperCase();

    // Basic validation
    if (normalizedCode.length !== 8) {
      return res.status(400).json({
        success: false,
        message: 'Login code must be 8 characters'
      });
    }

    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    let child;

    if (isMongoConnected) {
      // Use MongoDB model
      child = await Child.findOne({ 
        loginCode: normalizedCode,
        isActive: true 
      }).populate('parentId', 'firstName lastName');

      // Fallback: if Mongo is connected but has no matching child yet, try in-memory
      if (!child) {
        console.log('ℹ️  Mongo connected but no child found; falling back to in-memory for login');
        const inMem = await InMemoryChild.findOne({ 
          loginCode: normalizedCode,
          isActive: true 
        });
        if (inMem) {
          // Attach parent info from in-memory users
          const parent = await InMemoryUser.findById(inMem.parentId);
          if (parent) {
            inMem.parentId = {
              firstName: parent.firstName,
              lastName: parent.lastName
            };
          }
          child = inMem;
        }
      }
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for child login');
      child = await InMemoryChild.findOne({ 
        loginCode: normalizedCode,
        isActive: true 
      });
      
      if (child) {
        // Get parent info for in-memory model
        const parent = await InMemoryUser.findById(child.parentId);
        if (parent) {
          child.parentId = {
            firstName: parent.firstName,
            lastName: parent.lastName
          };
        }
      }
    }

    if (!child) {
      console.warn('Child login failed - code not found:', normalizedCode);
      return res.status(400).json({
        success: false,
        message: 'Invalid login code'
      });
    }

    // Update last activity (support both Mongo doc and in-memory object)
    const now = new Date();
    child.lastActivityAt = now;
    if (typeof child.save === 'function') {
      await child.save();
    } else if (child._id) {
      await InMemoryChild.findByIdAndUpdate(child._id, { lastActivityAt: now, updatedAt: now }, { new: true });
    }

    // Generate token
    const token = generateChildToken(child._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        child: {
          _id: child._id,
          name: child.name,
          age: child.age,
          profilePicture: child.profilePicture,
          companyProfile: child.companyProfile,
          parentName: child.parentId ? `${child.parentId.firstName} ${child.parentId.lastName}` : 'Unknown Parent'
        },
        token
      }
    });
  } catch (error) {
    console.error('Child login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get child profile (for authenticated child)
const getChildProfile = async (req, res) => {
  try {
    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    let child;

    if (isMongoConnected) {
      // Check if child ID is a valid MongoDB ObjectId (24 character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.child._id);
      
      if (isValidObjectId) {
        // Use MongoDB model
        child = await Child.findById(req.child._id)
          .populate('parentId', 'firstName lastName');
      } else {
        // ID is from in-memory storage, use in-memory model
        console.log('⚠️  Child ID is not a valid ObjectId, using in-memory storage');
        child = await InMemoryChild.findById(req.child._id);
        
        if (child) {
          // Get parent info for in-memory model
          const parent = await InMemoryUser.findById(child.parentId);
          if (parent) {
            child.parentId = {
              firstName: parent.firstName,
              lastName: parent.lastName
            };
          }
        }
      }
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for child profile');
      child = await InMemoryChild.findById(req.child._id);
      
      if (child) {
        // Get parent info for in-memory model
        const parent = await InMemoryUser.findById(child.parentId);
        if (parent) {
          child.parentId = {
            firstName: parent.firstName,
            lastName: parent.lastName
          };
        }
      }
    }

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        child: {
          _id: child._id,
          name: child.name,
          age: child.age,
          gender: child.gender,
          profilePicture: child.profilePicture,
          companyProfile: child.companyProfile,
          preferences: child.preferences,
          parentName: child.parentId ? `${child.parentId.firstName} ${child.parentId.lastName}` : 'Unknown Parent'
        }
      }
    });
  } catch (error) {
    console.error('Get child profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update child company profile
const updateCompanyProfile = async (req, res) => {
  try {
    console.log('🏢 Updating company profile for child:', req.child._id);
    const { companyName, businessType, description } = req.body;
    console.log('🏢 Company data:', { companyName, businessType, description });

    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    let child;

    if (isMongoConnected) {
      // Check if child ID is a valid MongoDB ObjectId (24 character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.child._id);
      
      if (isValidObjectId) {
        // Use MongoDB model
        child = await Child.findByIdAndUpdate(
          req.child._id,
          {
            'companyProfile.companyName': companyName,
            'companyProfile.businessType': businessType,
            'companyProfile.description': description,
            updatedAt: new Date()
          },
          { new: true }
        );
      } else {
        // ID is from in-memory storage, use in-memory model
        console.log('⚠️  Child ID is not a valid ObjectId, using in-memory storage');
        child = await InMemoryChild.findByIdAndUpdate(
          req.child._id,
          {
            'companyProfile.companyName': companyName,
            'companyProfile.businessType': businessType,
            'companyProfile.description': description,
            updatedAt: new Date()
          },
          { new: true }
        );
      }
    } else {
      // Use in-memory model
      console.log('⚠️  Using in-memory storage for company profile update');
      child = await InMemoryChild.findByIdAndUpdate(
        req.child._id,
        {
          'companyProfile.companyName': companyName,
          'companyProfile.businessType': businessType,
          'companyProfile.description': description,
          updatedAt: new Date()
        },
        { new: true }
      );
    }

    if (!child) {
      console.log('❌ Child not found for company profile update');
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      });
    }

    console.log('✅ Company profile updated successfully');
    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: {
        companyProfile: child.companyProfile
      }
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Validate child token (public endpoint)
const validateToken = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    console.log('🔐 Validating token:', token.substring(0, 20) + '...');
    console.log('🔐 JWT_SECRET available:', !!process.env.JWT_SECRET);
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('🔐 Decoded token:', decoded);
    
    // Check if MongoDB is connected
    const isMongoConnected = global.isMongoConnected ? global.isMongoConnected() : false;
    console.log('🔐 MongoDB connected:', isMongoConnected);
    
    let child;

    if (isMongoConnected) {
      // Check if child ID is a valid MongoDB ObjectId (24 character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(decoded.childId);
      
      if (isValidObjectId) {
        // Use MongoDB model
        console.log('🔐 Using MongoDB model');
        child = await Child.findById(decoded.childId).select('-loginCode');
      } else {
        // ID is from in-memory storage, fall back to in-memory model
        console.log('🔐 Child ID is not a valid ObjectId, using in-memory model');
        child = await InMemoryChild.findById(decoded.childId);
      }
    } else {
      // Use in-memory model
      console.log('🔐 Using in-memory model');
      child = await InMemoryChild.findById(decoded.childId);
    }

    console.log('🔐 Child found:', !!child);
    if (child) {
      console.log('🔐 Child active:', child.isActive);
    }

    if (!child || !child.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Child not found or inactive'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        child: {
          _id: child._id,
          name: child.name,
          isActive: child.isActive
        }
      }
    });
  } catch (error) {
    console.error('❌ Token validation error:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }
    
    // For development, provide more detailed error information
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({
        success: false,
        message: 'Server error during token validation',
        error: error.message,
        stack: error.stack
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during token validation'
    });
  }
};

module.exports = {
  childLogin,
  getChildProfile,
  updateCompanyProfile,
  validateToken
};