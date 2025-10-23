# EduPreneur - Educational Platform for Entrepreneurship & Money Management

An interactive platform that teaches children about entrepreneurship and money management through engaging modules and real-world simulations.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your MongoDB connection string and JWT secret.

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your backend URL and API keys.

5. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
eduprenuer/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/        # API route controllers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # Express routes
│   │   ├── middleware/        # Express middleware
│   │   ├── validators/        # Input validation
│   │   └── utils/             # Utility functions
│   ├── server.js              # Main server file
│   └── package.json
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context providers
│   │   └── utils/            # Frontend utilities
│   ├── public/               # Static assets
│   └── package.json
└── CONTEXT.md                # Detailed project documentation
```

## 🎯 Current Features (Phase 1 - MVP)

### ✅ Completed
- **User Authentication**: Register, login, and JWT-based authentication
- **Database Models**: User, Child, Subscription, LearningModule, Progress models
- **Frontend Routing**: React Router with protected routes
- **Responsive UI**: Modern design with Tailwind CSS
- **Parent Dashboard**: Basic dashboard structure
- **Child Dashboard**: Child-friendly interface

### 🚧 In Progress
- Child profile management
- Plan selection and payment integration
- Child login system with unique codes
- Sample learning modules

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /api/health` - API health status

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Axios** - HTTP client

## 📋 Next Steps (Phase 2)

1. Implement child profile creation and management
2. Add Stripe payment integration
3. Create child login system with unique codes
4. Build sample learning modules
5. Add progress tracking
6. Implement file upload for profile pictures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@eduprenuer.com or create an issue in the repository.
