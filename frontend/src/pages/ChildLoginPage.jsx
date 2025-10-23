import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiKey, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useChild } from '../context/ChildContext';

const ChildLoginPage = () => {
  const [loginCode, setLoginCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCode, setShowCode] = useState(false);

  const navigate = useNavigate();
  const { child, childLogin } = useChild();

  useEffect(() => {
    if (child) {
      navigate('/child-dashboard', { replace: true });
    }
  }, [child, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await childLogin(loginCode);
      if (result.success) {
        navigate('/child-dashboard', { replace: true });
        return;
      }
      setError(result.message || 'Invalid login code');
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">EduPreneur</h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your special login code to access your company
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Login Code
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showCode ? "text" : "password"}
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                  className="input-field pl-10 pr-10 text-center text-lg font-mono tracking-wider"
                  placeholder="Enter your code"
                  maxLength="8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCode ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Ask your parent for your special login code
              </p>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full text-lg py-4 flex items-center justify-center"
              disabled={loading || loginCode.length < 8}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  Enter My Company
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you don't have a login code or forgot yours, ask your parent to:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your child profile in their dashboard</li>
              <li>• Generate a new login code if needed</li>
              <li>• Make sure you're using the correct code</li>
            </ul>
          </div>
        </div>

        {/* Fun Elements */}
        <div className="flex justify-center space-x-4">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-primary-600 text-sm">💼</span>
          </div>
          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.1s' }}>
            <span className="text-secondary-600 text-sm">💰</span>
          </div>
          <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.2s' }}>
            <span className="text-accent-600 text-sm">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildLoginPage;
