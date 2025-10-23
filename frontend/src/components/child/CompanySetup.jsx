import React, { useState } from 'react';
import { FiHome, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

const CompanySetup = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    description: '',
    logo: ''
  });

  const businessTypes = [
    {
      id: 'lemonade-stand',
      name: 'Lemonade Stand',
      icon: '🍋',
      description: 'Sell refreshing drinks to neighbors',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 'pet-care',
      name: 'Pet Care',
      icon: '🐕',
      description: 'Take care of pets for busy families',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 'art-crafts',
      name: 'Art & Crafts',
      icon: '🎨',
      description: 'Create and sell beautiful artwork',
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    {
      id: 'tech-services',
      name: 'Tech Services',
      icon: '💻',
      description: 'Help with computers and technology',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 'food-truck',
      name: 'Food Truck',
      icon: '🍔',
      description: 'Serve delicious food to customers',
      color: 'bg-red-100 border-red-300 text-red-800'
    },
    {
      id: 'other',
      name: 'Other',
      icon: '💡',
      description: 'Create your own unique business',
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName.trim().length >= 2;
      case 2:
        return formData.businessType !== '';
      case 3:
        return true; // Description is optional
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiHome className="text-primary-600 text-2xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">What's Your Company Name?</h3>
        <p className="text-gray-600">Choose a fun name for your business</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          className="input-field text-center text-lg"
          placeholder="e.g., Sarah's Super Lemonade"
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-1 text-center">
          {formData.companyName.length}/50 characters
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Tips for a Great Name:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Make it fun and memorable</li>
          <li>• Include your name or something you love</li>
          <li>• Keep it simple and easy to say</li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏢</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">What Type of Business?</h3>
        <p className="text-gray-600">Choose the business that interests you most</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {businessTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleInputChange('businessType', type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              formData.businessType === type.id
                ? `${type.color} border-current`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{type.icon}</span>
              <h4 className="font-semibold">{type.name}</h4>
            </div>
            <p className="text-sm opacity-75">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tell Us About Your Business</h3>
        <p className="text-gray-600">Describe what makes your company special (optional)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="input-field h-24 resize-none"
          placeholder="e.g., We make the best lemonade in the neighborhood using fresh lemons and a secret family recipe!"
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {formData.description.length}/200 characters
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">🎉 You're Almost Done!</h4>
        <p className="text-sm text-green-800">
          Once you complete this setup, you'll have your own virtual company to manage and grow!
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Your Company</h2>
            <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <FiCheck className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiArrowLeft className="mr-2" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {currentStep === 3 ? (
              <button
                onClick={handleSubmit}
                className="btn-primary flex items-center"
              >
                Create Company
                <FiCheck className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FiArrowRight className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
