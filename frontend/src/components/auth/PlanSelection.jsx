import React, { useState } from 'react';
import { FiCheck, FiUsers, FiUser, FiBook, FiArrowRight } from 'react-icons/fi';

const PlanSelection = ({ onSelectPlan, loading = false }) => {
  const [selectedPlan, setSelectedPlan] = useState('');

  const plans = [
    {
      id: 'solo',
      name: 'Solo Plan',
      price: '$9.99',
      period: 'per month',
      icon: <FiUser className="w-8 h-8" />,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600',
      children: 1,
      features: [
        '1 child profile',
        'All learning modules',
        'Progress tracking',
        'Basic support',
        'Mobile access'
      ],
      popular: false
    },
    {
      id: 'family',
      name: 'Family Plan',
      price: '$19.99',
      period: 'per month',
      icon: <FiUsers className="w-8 h-8" />,
      color: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-600',
      children: 5,
      features: [
        'Up to 5 child profiles',
        'All learning modules',
        'Advanced progress tracking',
        'Priority support',
        'Family dashboard',
        'Achievement system',
        'Mobile access'
      ],
      popular: true
    },
    {
      id: 'school',
      name: 'School Plan',
      price: '$99.99',
      period: 'per month',
      icon: <FiBook className="w-8 h-8" />,
      color: 'bg-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-600',
      children: 50,
      features: [
        'Up to 50 child profiles',
        'All learning modules',
        'Classroom management',
        'Teacher dashboard',
        'Bulk progress reports',
        'Custom branding',
        'Priority support',
        'API access'
      ],
      popular: false
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your family's learning journey. 
          All plans include access to our complete library of educational content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 cursor-pointer ${
              selectedPlan === plan.id
                ? `${plan.borderColor} shadow-xl scale-105`
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
            onClick={() => handleSelectPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-600">
                  Perfect for {plan.children === 1 ? '1 child' : `up to ${plan.children} children`}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <FiCheck className={`w-5 h-5 ${plan.textColor} mr-3 flex-shrink-0`} />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                  selectedPlan === plan.id
                    ? `${plan.borderColor} bg-current`
                    : 'border-gray-300'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleContinue}
          disabled={!selectedPlan || loading}
          className="btn-primary text-lg px-8 py-4 inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Continue to Payment
              <FiArrowRight className="ml-2" />
            </>
          )}
        </button>
        
        {!selectedPlan && (
          <p className="text-sm text-gray-500 mt-4">
            Please select a plan to continue
          </p>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Included in All Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Educational Content</h4>
              <p>Age-appropriate modules covering money management, business concepts, and entrepreneurship</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress Tracking</h4>
              <p>Monitor your child's learning progress with detailed analytics and reports</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Safe Environment</h4>
              <p>COPPA-compliant platform with secure login codes and privacy protection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
