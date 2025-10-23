import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiCreditCard, FiCalendar, FiAlertCircle, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const SubscriptionManagement = ({ onClose }) => {
  const { user, token } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data);
      } else {
        setError('Failed to load subscription status');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSuccess('Subscription will be cancelled at the end of your billing period');
        await fetchSubscriptionStatus(); // Refresh status
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'trialing':
        return <FiCalendar className="w-5 h-5 text-blue-500" />;
      case 'past_due':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial Period';
      case 'past_due':
        return 'Payment Required';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDetails = (planType) => {
    const plans = {
      solo: { name: 'Solo Plan', price: '$9.99', children: 1, features: ['1 child profile', 'All learning modules', 'Progress tracking', 'Basic support'] },
      family: { name: 'Family Plan', price: '$19.99', children: 5, features: ['Up to 5 child profiles', 'All learning modules', 'Advanced progress tracking', 'Priority support', 'Family dashboard'] },
      school: { name: 'School Plan', price: '$99.99', children: 50, features: ['Up to 50 child profiles', 'All learning modules', 'Classroom management', 'Teacher dashboard', 'Bulk reports', 'Custom branding'] }
    };
    return plans[planType] || plans.solo;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading subscription details...</span>
          </div>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(user?.planType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Current Plan */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{planDetails.name}</h4>
              <p className="text-gray-600">Up to {planDetails.children} child profiles</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{planDetails.price}</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Status</span>
            <div className="flex items-center">
              {getStatusIcon(user?.subscriptionStatus)}
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user?.subscriptionStatus)}`}>
                {getStatusText(user?.subscriptionStatus)}
              </span>
            </div>
          </div>

          {/* Billing Period */}
          {subscription?.hasActiveSubscription && subscription?.subscription && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Period</span>
                <span className="text-sm text-gray-900">
                  {formatDate(subscription.subscription.currentPeriodStart)} - {formatDate(subscription.subscription.currentPeriodEnd)}
                </span>
              </div>
              {subscription.subscription.cancelAtPeriodEnd && (
                <div className="flex items-center text-yellow-600">
                  <FiAlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">Subscription will be cancelled at the end of the current period</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <FiCheckCircle className="w-4 h-4 text-green-500 mr-3" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={fetchSubscriptionStatus}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </button>
          
          {subscription?.hasActiveSubscription && !subscription?.subscription?.cancelAtPeriodEnd && (
            <button
              onClick={handleCancelSubscription}
              disabled={cancelling}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <FiXCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </button>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiCreditCard className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Secure Billing</h4>
              <p className="text-sm text-blue-800">
                Your payment information is securely processed by Stripe. We never store your payment details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;

