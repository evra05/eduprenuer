const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure JWT secret in development to avoid runtime errors
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev_jwt_secret_change_me';
  console.log('⚠️  Using default JWT secret for development');
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - very lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // 10000 requests per minute in dev, 100 in production
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(1 * 60 * 1000 / 10000) // retry after 6 seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks, static files, and all API endpoints in development
    if (process.env.NODE_ENV !== 'production') {
      return true; // Skip all rate limiting in development
    }
    // Also skip if NODE_ENV is not set (default development behavior)
    if (!process.env.NODE_ENV) {
      return true;
    }
    return req.path === '/api/health' || 
           req.path.startsWith('/uploads/') ||
           req.path.startsWith('/api/progress/') ||
           req.path.startsWith('/api/achievements/') ||
           req.path.startsWith('/api/modules/');
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection with better error handling
let isMongoConnected = false;

// Set default MongoDB URI if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/eduprenuer';
  console.log('⚠️  Using default MongoDB URI:', process.env.MONGODB_URI);
}

// Try to connect to MongoDB with a timeout
const connectToMongo = async () => {
  try {
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
    isMongoConnected = true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Server will continue without database connection');
    console.log('⚠️  Using in-memory storage for development');
    isMongoConnected = false;
    // Completely disable mongoose
    mongoose.disconnect();
  }
};

// Make connection status available globally
global.isMongoConnected = () => isMongoConnected;

// Seeders
const { seedModules } = require('./scripts/seed-modules-inmemory');
const { seedChildren } = require('./scripts/seed-children-inmemory');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'EduPreneur API is running',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Test route is working'
  });
});

// API routes
console.log('Loading auth routes...');
app.use('/api/simple-auth', require('./src/routes/simpleAuth'));
app.use('/api/auth', require('./src/routes/auth'));
console.log('Auth routes loaded');

console.log('Loading children routes...');
app.use('/api/children', require('./src/routes/children'));
app.use('/api/child', require('./src/routes/childLogin'));
console.log('Children routes loaded');

console.log('Loading modules routes...');
app.use('/api/modules', require('./src/routes/modules'));
console.log('Modules routes loaded');

console.log('Loading progress routes...');
app.use('/api/progress', require('./src/routes/progress'));
console.log('Progress routes loaded');

console.log('Loading achievements routes...');
app.use('/api/achievements', require('./src/routes/achievements'));
console.log('Achievements routes loaded');

// console.log('Loading subscriptions routes...');
// app.use('/api/subscriptions', require('./src/routes/subscriptions'));
// console.log('Subscriptions routes loaded');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server after initialization
(async () => {
  try {
    await connectToMongo();
    // Always seed in-memory stores so they are ready if Mongo is unavailable
    await seedModules();
    await seedChildren();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Server initialization error:', err);
    process.exit(1);
  }
})();
