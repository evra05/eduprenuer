import React from 'react';
import { FiPlay, FiCheck, FiClock, FiStar } from 'react-icons/fi';
import ProgressBar from './ProgressBar';

const ModuleCard = ({ module, progress = null, onStart, onContinue }) => {

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'money-basics':
        return '💰';
      case 'business-ideas':
        return '💡';
      case 'saving-spending':
        return '🏦';
      case 'business-math':
        return '🧮';
      case 'entrepreneurship':
        return '🚀';
      default:
        return '📚';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    if (!progress || progress.status === 'not-started') {
      return <FiPlay className="w-5 h-5" />;
    } else if (progress.status === 'completed') {
      return <FiCheck className="w-5 h-5" />;
    } else {
      return <FiPlay className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    if (!progress || progress.status === 'not-started') {
      return 'Start Learning';
    } else if (progress.status === 'completed') {
      return 'Review';
    } else {
      return 'Continue';
    }
  };

  const getStatusColor = () => {
    if (!progress || progress.status === 'not-started') {
      return 'bg-primary-600 hover:bg-primary-700';
    } else if (progress.status === 'completed') {
      return 'bg-green-600 hover:bg-green-700';
    } else {
      return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleModuleClick = () => {
    if (!progress || progress.status === 'not-started') {
      onStart(module);
    } else {
      onContinue(module);
    }
  };


  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-xl">
          {getCategoryIcon(module.category)}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-medium text-gray-900">{module.title}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(module.difficultyLevel)}`}>
              {module.difficultyLevel}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <FiClock className="w-3 h-3 mr-1" />
              {module.estimatedDuration} min
            </div>
            {progress?.scores?.overall > 0 && (
              <div className="flex items-center text-xs text-yellow-600">
                <FiStar className="w-3 h-3 mr-1" />
                {progress.scores.overall}%
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {module.description}
      </p>

      <div className="mb-3">
        <ProgressBar 
          progress={progress?.completionPercentage || 0} 
          showPercentage={false}
          size="small"
        />
        <p className="text-xs text-gray-500 mt-1">
          {progress?.timeSpent ? `${progress.timeSpent} min spent` : 'Not started'}
        </p>
      </div>

      <button
        onClick={handleModuleClick}
        className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="ml-2">{getStatusText()}</span>
      </button>
    </div>
  );
};

export default ModuleCard;
