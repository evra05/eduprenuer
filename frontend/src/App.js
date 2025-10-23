import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChildProvider } from './context/ChildContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegistrationFlow from './pages/RegistrationFlow';
import ParentDashboard from './pages/ParentDashboard';
import ChildLoginPage from './pages/ChildLoginPage';
import ChildDashboard from './pages/ChildDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import ProtectedChildRoute from './components/common/ProtectedChildRoute';

function App() {
  return (
    <AuthProvider>
      <ChildProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/signup" element={<RegistrationFlow />} />
              <Route 
                path="/parent-dashboard" 
                element={
                  <ProtectedRoute>
                    <ParentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/child-login" element={<ChildLoginPage />} />
              <Route 
                path="/child-dashboard" 
                element={
                  <ProtectedChildRoute>
                    <ChildDashboard />
                  </ProtectedChildRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </ChildProvider>
    </AuthProvider>
  );
}

export default App;
