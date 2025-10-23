import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiMail, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import PlanSelection from '../components/auth/PlanSelection';
import PaymentForm from '../components/auth/PaymentForm';

const RegistrationFlow = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Account, 2: Plan, 3: Payment
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    planType: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateAccountForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (!validateAccountForm()) {
      return;
    }

    setCurrentStep(2);
  };

  const handlePlanSelect = (planType) => {
    setFormData(prev => ({ ...prev, planType }));
    setCurrentStep(3);
  };

  const handlePaymentSuccess = async (subscriptionData) => {
    setLoading(true);
    setError('');

    try {
      // First register the user
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        planType: formData.planType
      });
      
      if (result.success) {
        // User is now authenticated, navigate to dashboard
        navigate('/parent-dashboard');
      } else {
        if (result.errors) {
          setErrors(result.errors.reduce((acc, err) => {
            acc[err.param] = err.msg;
            return acc;
          }, {}));
        } else {
          setError(result.message);
        }
        setCurrentStep(1); // Go back to account creation
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step <= currentStep
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 3 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderAccountForm = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link to="/" className="text-3xl font-bold text-primary-600">
          EduPreneur
        </Link>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your child's entrepreneurial journey today
        </p>
      </div>

      <div className="card">
        <form className="space-y-6" onSubmit={handleAccountSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="First name"
                required
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Last name"
                required
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full"
          >
            Continue to Plan Selection
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        {renderStepIndicator()}
        
        {currentStep === 1 && renderAccountForm()}
        {currentStep === 2 && (
          <div>
            <div className="text-center mb-8">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <FiArrowLeft className="mr-2" />
                Back to Account
              </button>
            </div>
            <PlanSelection onSelectPlan={handlePlanSelect} />
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <div className="text-center mb-8">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <FiArrowLeft className="mr-2" />
                Back to Plans
              </button>
            </div>
        <PaymentForm
          selectedPlan={formData.planType}
          onBack={handleBack}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          setLoading={setLoading}
        />
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationFlow;
