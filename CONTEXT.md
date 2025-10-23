# EduPreneur - Educational Platform for Entrepreneurship & Money Management

### Frontend
- **React.js** - Modern, responsive UI (Free)
- **Tailwind CSS** - Clean, modern styling (Free)
- **React Router** - Navigation (Free)

### Backend
- **Node.js + Express** - Server framework (Free)
- **MongoDB Atlas** - Database with free tier (Free)
- **Mongoose** - MongoDB object modeling (Free)

### Payment & Authentication
- **Stripe** - Payment processing (2.9% + 30¢ per transaction)
- **JWT** - User authentication (Free)

### File Storage
- **Cloudinary** - Profile picture storage (Free tier available)

### Deployment
- **Frontend**: Vercel (Free tier) - React app deployment
- **Backend**: Railway (Free tier) - Node.js/Express API deployment
- **Database**: MongoDB Atlas (Free tier) - Cloud database
- **File Storage**: Cloudinary (Free tier) - Image and file storage

### Development Tools
- **Git** - Version control (Free)
- **VS Code** - Code editor (Free)
- **Postman** - API testing (Free)


## Project Overview
EduPreneur is an educational platform that teaches children about entrepreneurship and money management through interactive modules, while allowing parents to monitor their progress.

## User Flow

### 1. Landing & Authentication
```
- Welcome Page (Clean, modern design)
- Sign-in/Sign-up for parents
- Plan selection required before full access
  • Solo Plan (1 child)
  • Family Plan (3-5 children) 
  • School Plan (10+ children)
- Payment processing
```

### 2. Parent Dashboard
**After successful authentication and payment:**
- Clean, modern dashboard interface
- **Primary Actions:**
  - Add Child Profile
  - View Current Plan
  - Monitor Learning Progress

**Child Profile Creation:**
- Profile picture upload
- Child's name
- Age
- Gender
- Auto-generates unique login code for child

### 3. Child Learning Experience
**Child Login:**
- Uses unique code provided by parent
- Separate child-friendly interface

**Child Onboarding:**
- Welcome page
- "Create Your Company" profile setup
  - Company name
  - Business type selection
  - Avatar/logo creation

**Learning Modules:**
- Age-appropriate entrepreneurship lessons
- Interactive money management activities
- Progress tracking
- Gamified learning experience

## Feature Specifications

### Parent Features
- **Dashboard**
  - Progress overview for all children
  - Current plan details and usage
  - Quick add child button
  - Recent activity feed

- **Child Management**
  - Add/remove child profiles
  - Edit child information
  - View individual progress reports
  - Reset login codes

- **Subscription Management**
  - Plan details and limits
  - Upgrade/downgrade options
  - Billing information
  - Payment history

### Child Features
- **Company Profile**
  - Customizable company identity
  - Progress badges and achievements
  - Virtual office environment

- **Learning Modules**
  - Interactive lessons on:
    - Basic money concepts
    - Business ideas
    - Saving and spending
    - Simple business math
  - Age-appropriate content
  - Interactive quizzes and activities

- **Progress Tracking**
  - Module completion status
  - Achievement badges
  - Skill development metrics

## Detailed Database Schema

### MongoDB Collections (Mongoose Models)

#### 1. **Users Collection** (Parents)
```javascript
{
  _id: ObjectId,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  planType: { 
    type: String, 
    enum: ['solo', 'family', 'school'], 
    required: true 
  },
  subscriptionStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'cancelled', 'trial'], 
    default: 'trial' 
  },
  stripeCustomerId: String,
  profilePicture: String,
  phoneNumber: String,
  timezone: { type: String, default: 'UTC' },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

#### 2. **Children Collection**
```javascript
{
  _id: ObjectId,
  parentId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 5, max: 17 },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  profilePicture: String,
  loginCode: { type: String, required: true, unique: true },
  companyProfile: {
    companyName: String,
    businessType: { 
      type: String, 
      enum: ['lemonade-stand', 'pet-care', 'art-crafts', 'tech-services', 'food-truck', 'other'] 
    },
    logo: String,
    description: String,
    virtualOffice: {
      theme: { type: String, default: 'modern' },
      decorations: [String],
      achievements: [String]
    }
  },
  preferences: {
    difficultyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    learningStyle: { type: String, enum: ['visual', 'auditory', 'kinesthetic'], default: 'visual' }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActivityAt: Date
}
```

#### 3. **Subscriptions Collection**
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  planType: { 
    type: String, 
    enum: ['solo', 'family', 'school'], 
    required: true 
  },
  stripeSubscriptionId: String,
  status: { 
    type: String, 
    enum: ['active', 'past_due', 'cancelled', 'unpaid', 'trialing'], 
    required: true 
  },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: { type: Boolean, default: false },
  cancelledAt: Date,
  trialStart: Date,
  trialEnd: Date,
  priceId: String,
  quantity: { type: Number, default: 1 },
  metadata: Object,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### 4. **Learning Modules Collection**
```javascript
{
  _id: ObjectId,
  title: { type: String, required: true },
  description: String,
  ageRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['money-basics', 'business-ideas', 'saving-spending', 'business-math', 'entrepreneurship'], 
    required: true 
  },
  estimatedDuration: Number, // in minutes
  content: {
    introduction: String,
    objectives: [String],
    lessons: [{
      id: String,
      title: String,
      content: String,
      type: { type: String, enum: ['text', 'video', 'interactive', 'quiz'] },
      mediaUrl: String,
      order: Number
    }],
    activities: [{
      id: String,
      title: String,
      description: String,
      type: { type: String, enum: ['quiz', 'simulation', 'game', 'worksheet'] },
      questions: [Object],
      scoring: Object
    }],
    resources: [{
      title: String,
      url: String,
      type: String
    }]
  },
  prerequisites: [{ type: ObjectId, ref: 'LearningModule' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### 5. **Progress Collection**
```javascript
{
  _id: ObjectId,
  childId: { type: ObjectId, ref: 'Child', required: true },
  moduleId: { type: ObjectId, ref: 'LearningModule', required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'paused'], 
    default: 'not-started' 
  },
  completionPercentage: { type: Number, min: 0, max: 100, default: 0 },
  scores: {
    overall: { type: Number, min: 0, max: 100 },
    quizzes: [{
      activityId: String,
      score: Number,
      maxScore: Number,
      attempts: Number,
      completedAt: Date
    }],
    activities: [{
      activityId: String,
      completed: Boolean,
      score: Number,
      timeSpent: Number, // in minutes
      completedAt: Date
    }]
  },
  timeSpent: { type: Number, default: 0 }, // total time in minutes
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: { type: Date, default: Date.now },
  notes: String,
  parentNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

#### 6. **Achievements Collection**
```javascript
{
  _id: ObjectId,
  childId: { type: ObjectId, ref: 'Child', required: true },
  achievementType: { 
    type: String, 
    enum: ['module-completion', 'perfect-score', 'time-milestone', 'streak', 'special'], 
    required: true 
  },
  title: { type: String, required: true },
  description: String,
  icon: String,
  points: { type: Number, default: 0 },
  moduleId: { type: ObjectId, ref: 'LearningModule' },
  metadata: Object,
  earnedAt: { type: Date, default: Date.now }
}
```

#### 7. **Sessions Collection** (Child Login Sessions)
```javascript
{
  _id: ObjectId,
  childId: { type: ObjectId, ref: 'Child', required: true },
  loginCode: { type: String, required: true },
  sessionToken: { type: String, required: true, unique: true },
  ipAddress: String,
  userAgent: String,
  isActive: { type: Boolean, default: true },
  lastActivityAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}
```

#### 8. **Payments Collection**
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  subscriptionId: { type: ObjectId, ref: 'Subscription' },
  stripePaymentIntentId: String,
  amount: { type: Number, required: true }, // in cents
  currency: { type: String, default: 'usd' },
  status: { 
    type: String, 
    enum: ['pending', 'succeeded', 'failed', 'cancelled'], 
    required: true 
  },
  description: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
}
```

### Database Indexes
```javascript
// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "stripeCustomerId": 1 })

// Children collection indexes
db.children.createIndex({ "parentId": 1 })
db.children.createIndex({ "loginCode": 1 }, { unique: true })
db.children.createIndex({ "parentId": 1, "isActive": 1 })

// Progress collection indexes
db.progress.createIndex({ "childId": 1, "moduleId": 1 }, { unique: true })
db.progress.createIndex({ "childId": 1, "status": 1 })
db.progress.createIndex({ "moduleId": 1, "status": 1 })

// Learning modules collection indexes
db.learningmodules.createIndex({ "ageRange.min": 1, "ageRange.max": 1 })
db.learningmodules.createIndex({ "category": 1, "difficultyLevel": 1 })
db.learningmodules.createIndex({ "isActive": 1 })

// Sessions collection indexes
db.sessions.createIndex({ "sessionToken": 1 }, { unique: true })
db.sessions.createIndex({ "childId": 1, "isActive": 1 })
db.sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })
```

## Current File Structure (Separate Frontend & Backend)

```
eduprenuer/
├── backend/                          # Node.js/Express Backend
│   ├── node_modules/                 # Backend dependencies
│   ├── package.json                  # Backend package configuration
│   ├── package-lock.json            # Backend dependency lock file
│   ├── src/                         # Backend source code (to be created)
│   │   ├── controllers/             # API route controllers
│   │   │   ├── authController.js
│   │   │   ├── parentController.js
│   │   │   ├── childController.js
│   │   │   ├── moduleController.js
│   │   │   ├── progressController.js
│   │   │   ├── subscriptionController.js
│   │   │   └── paymentController.js
│   │   ├── models/                  # Mongoose database models
│   │   │   ├── User.js
│   │   │   ├── Child.js
│   │   │   ├── Subscription.js
│   │   │   ├── LearningModule.js
│   │   │   ├── Progress.js
│   │   │   ├── Achievement.js
│   │   │   ├── Session.js
│   │   │   └── Payment.js
│   │   ├── routes/                  # Express routes
│   │   │   ├── auth.js
│   │   │   ├── parents.js
│   │   │   ├── children.js
│   │   │   ├── modules.js
│   │   │   ├── progress.js
│   │   │   ├── subscriptions.js
│   │   │   └── payments.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── rateLimiting.js
│   │   │   └── errorHandler.js
│   │   ├── services/                # Business logic services
│   │   │   ├── authService.js
│   │   │   ├── emailService.js
│   │   │   ├── stripeService.js
│   │   │   ├── cloudinaryService.js
│   │   │   └── progressService.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── generateLoginCode.js
│   │   │   ├── calculateProgress.js
│   │   │   ├── ageAppropriateContent.js
│   │   │   └── constants.js
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js
│   │   │   ├── stripe.js
│   │   │   └── cloudinary.js
│   │   ├── validators/              # Input validation
│   │   │   ├── userValidation.js
│   │   │   ├── childValidation.js
│   │   │   └── moduleValidation.js
│   │   └── app.js                   # Express app configuration
│   ├── tests/                       # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── scripts/                     # Database scripts
│   │   ├── seed-database.js
│   │   ├── migrate-data.js
│   │   └── backup-database.js
│   ├── .env.example                 # Environment variables template
│   └── server.js                    # Main server entry point
├── frontend/                        # React Frontend
│   ├── node_modules/                # Frontend dependencies
│   ├── public/                      # Static assets
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/                         # React source code
│   │   ├── components/              # React components
│   │   │   ├── common/              # Shared components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Button.jsx
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── PlanSelection.jsx
│   │   │   ├── parent/              # Parent-specific components
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ChildProfile.jsx
│   │   │   │   ├── AddChildForm.jsx
│   │   │   │   ├── ProgressOverview.jsx
│   │   │   │   └── SubscriptionManagement.jsx
│   │   │   ├── child/               # Child-specific components
│   │   │   │   ├── ChildLogin.jsx
│   │   │   │   ├── CompanySetup.jsx
│   │   │   │   ├── LearningDashboard.jsx
│   │   │   │   ├── ModuleViewer.jsx
│   │   │   │   ├── VirtualOffice.jsx
│   │   │   │   └── AchievementDisplay.jsx
│   │   │   └── learning/            # Learning module components
│   │   │       ├── ModuleCard.jsx
│   │   │       ├── QuizComponent.jsx
│   │   │       ├── ActivityComponent.jsx
│   │   │       └── ProgressBar.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── ParentDashboard.jsx
│   │   │   ├── ChildDashboard.jsx
│   │   │   ├── ModulePage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── useProgress.js
│   │   ├── context/                 # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ChildContext.jsx
│   │   │   └── ProgressContext.jsx
│   │   ├── services/                # Frontend services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── storageService.js
│   │   ├── utils/                   # Frontend utilities
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   ├── validation.js
│   │   │   └── ageAppropriateContent.js
│   │   ├── styles/                  # Styling files
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── animations.css
│   │   ├── assets/                  # Static assets
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── sounds/
│   │   ├── App.js                   # Main App component
│   │   ├── App.css                  # App-specific styles
│   │   ├── App.test.js              # App tests
│   │   ├── index.js                 # React entry point
│   │   ├── index.css                # Global styles
│   │   ├── logo.svg                 # React logo
│   │   ├── reportWebVitals.js       # Performance monitoring
│   │   └── setupTests.js            # Test setup
│   ├── build/                       # Production build (generated)
│   ├── package.json                 # Frontend package configuration
│   ├── package-lock.json           # Frontend dependency lock file
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── README.md                    # Frontend documentation
├── CONTEXT.md                       # Project documentation
└── README.md                        # Main project documentation
```

### Key File Structure Benefits:

1. **Separation of Concerns**: Clear separation between frontend and backend
2. **Independent Development**: Frontend and backend can be developed separately
3. **Scalability**: Each part can be scaled independently
4. **Technology Flexibility**: Different teams can work on different parts
5. **Deployment Options**: Can deploy frontend and backend separately
6. **CORS Handling**: Proper CORS configuration needed for cross-origin requests
7. **Development**: Requires proxy configuration for development
8. **Maintainability**: Organized by feature and responsibility
9. **Testing**: Dedicated test directories for both frontend and backend
10. **Security**: Middleware for authentication, validation, and rate limiting


## Implementation Priority

### Phase 1 (MVP)
1. User authentication and plan selection
2. Parent dashboard with child profile creation
3. Basic child login and company profile setup
4. 2-3 sample learning modules

### Phase 2
1. Enhanced progress tracking
2. More learning modules
3. Payment integration improvements
4. Mobile responsiveness

### Phase 3
1. Advanced analytics for parents
2. Interactive business simulation
3. Social features (child-to-child interactions)
4. Mobile app development

## Key Considerations

### Security
- Secure payment processing
- Child data protection (COPPA compliance)
- Secure login codes for children

### User Experience
- Simple, intuitive parent dashboard
- Child-friendly, engaging interface
- Clear progress visualization
- Mobile-responsive design

### Scalability
- Modular learning content
- Flexible subscription plans
- Easy addition of new learning modules

This structure provides a clear roadmap for development while maintaining flexibility for future enhancements. The tech stack is modern yet straightforward, allowing for rapid development and easy maintenance.