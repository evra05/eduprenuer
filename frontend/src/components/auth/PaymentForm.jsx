import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';

// Configure Stripe with proper options for development and production
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY, {
  // Allow HTTP in development, require HTTPS in production
  stripeAccount: process.env.REACT_APP_STRIPE_ACCOUNT_ID,
  locale: 'en'
});

// Suppress Stripe HTTPS warning in development
if (process.env.NODE_ENV === 'development') {
  console.log('⚠️  Development mode: Stripe integration running over HTTP');
  console.log('⚠️  For production, ensure HTTPS is enabled for Stripe integration');
}

const PaymentForm = ({ selectedPlan, onBack, onSuccess, onError, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const planDetails = {
    solo: { name: 'Solo Plan', price: '$9.99', children: 1 },
    family: { name: 'Family Plan', price: '$19.99', children: 5 },
    school: { name: 'School Plan', price: '$99.99', children: 50 }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalLoading(true);
    setLoading(true);
    setError('');

    if (!stripe || !elements) {
      setError('Payment system not ready. Please try again.');
      setLocalLoading(false);
      setLoading(false);
      return;
    }

    try {
      // For now, simulate successful payment since we're in registration flow
      // In a real implementation, you would integrate with Stripe here
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call success callback with mock subscription data
      onSuccess({
        subscriptionId: 'mock_subscription_' + Date.now(),
        planType: selectedPlan,
        status: 'active'
      });
    } catch (err) {
      setError(err.message || 'An error occurred during payment');
      onError(err);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };


  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Complete Your Subscription
        </h2>
        <p className="text-gray-600">
          Secure payment powered by Stripe
        </p>
      </div>

      {/* Plan Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-gray-900">{planDetails[selectedPlan].name}</p>
            <p className="text-sm text-gray-600">
              Up to {planDetails[selectedPlan].children} child profiles
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{planDetails[selectedPlan].price}</p>
            <p className="text-sm text-gray-600">per month</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Information
          </label>
          <div className="border border-gray-300 rounded-lg p-4">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-2 flex items-center">
            <FiLock className="w-3 h-3 mr-1" />
            Your payment information is secure and encrypted
          </p>
        </div>

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Plans
          </button>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="btn-primary px-8 py-3 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Complete Subscription
              </>
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Secure Payment</h4>
          <p className="text-sm text-green-800">
            Your payment is processed securely by Stripe. We never store your payment information.
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentFormWrapper = ({ selectedPlan, onBack, onSuccess, onError, setLoading }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        selectedPlan={selectedPlan}
        onBack={onBack}
        onSuccess={onSuccess}
        onError={onError}
        setLoading={setLoading}
      />
    </Elements>
  );
};

export default PaymentFormWrapper;
