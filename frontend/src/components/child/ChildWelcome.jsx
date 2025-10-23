import React, { useState } from 'react';
import { FiStar, FiArrowRight, FiHome, FiBook, FiAward, FiUsers } from 'react-icons/fi';

const ChildWelcome = ({ child, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Welcome to EduPreneur!",
      subtitle: `Hi ${child?.name}! Ready to start your business adventure?`,
      icon: <FiStar className="w-16 h-16 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You're about to become a young entrepreneur! 🚀
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What you'll learn:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• How to start and run a business</li>
              <li>• Money management and budgeting</li>
              <li>• Creative problem solving</li>
              <li>• Leadership and teamwork skills</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Your Learning Journey",
      subtitle: "Discover exciting modules designed just for you",
      icon: <FiBook className="w-16 h-16 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You'll explore fun, interactive lessons that teach you about business and money!
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-medium text-green-900">Money Basics</h4>
              <p className="text-sm text-green-800">Learn about saving and spending</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-medium text-purple-900">Business Ideas</h4>
              <p className="text-sm text-purple-800">Discover creative business concepts</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-blue-900">Business Math</h4>
              <p className="text-sm text-blue-800">Learn numbers and calculations</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-medium text-orange-900">Entrepreneurship</h4>
              <p className="text-sm text-orange-800">Become a business leader</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Earn Achievements",
      subtitle: "Complete activities to unlock rewards and badges",
      icon: <FiAward className="w-16 h-16 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            As you learn and complete activities, you'll earn points and unlock amazing achievements!
          </p>
          <div className="space-y-3">
            <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <span className="text-2xl mr-3">⭐</span>
              <div>
                <h4 className="font-medium text-yellow-900">Perfect Score Badge</h4>
                <p className="text-sm text-yellow-800">Get 100% on quizzes</p>
              </div>
            </div>
            <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-3">
              <span className="text-2xl mr-3">📚</span>
              <div>
                <h4 className="font-medium text-blue-900">Module Master</h4>
                <p className="text-sm text-blue-800">Complete learning modules</p>
              </div>
            </div>
            <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-2xl mr-3">🔥</span>
              <div>
                <h4 className="font-medium text-green-900">Learning Streak</h4>
                <p className="text-sm text-green-800">Learn every day</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Your Virtual Office",
      subtitle: "Build and customize your own business space",
      icon: <FiHome className="w-16 h-16 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You'll have your own virtual office where you can display your achievements and manage your business!
          </p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🏢</div>
                <h4 className="font-medium text-gray-900">Office</h4>
                <p className="text-sm text-gray-700">Your workspace</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-medium text-gray-900">Library</h4>
                <p className="text-sm text-gray-700">Learning materials</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="font-medium text-gray-900">Trophy Room</h4>
                <p className="text-sm text-gray-700">Your achievements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛍️</div>
                <h4 className="font-medium text-gray-900">Store</h4>
                <p className="text-sm text-gray-700">Spend your points</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Ready to Start?",
      subtitle: "Let's begin your entrepreneurial journey!",
      icon: <FiUsers className="w-16 h-16 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            You're all set! Your parents can track your progress, and you'll have fun learning about business and money.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🎉 You're ready to:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Create your own company</li>
              <li>• Start learning modules</li>
              <li>• Earn achievements and points</li>
              <li>• Build your virtual office</li>
              <li>• Become a young entrepreneur!</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {currentStepData?.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2">{currentStepData?.title}</h2>
            <p className="text-blue-100">{currentStepData?.subtitle}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id < currentStep ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {currentStepData?.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleSkip}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Skip Tour
            </button>
          </div>

          <button
            onClick={handleNext}
            className="btn-primary flex items-center"
          >
            {currentStep === steps.length ? 'Start Learning!' : 'Next'}
            <FiArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildWelcome;

