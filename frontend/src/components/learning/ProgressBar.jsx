import React from 'react';

const ProgressBar = ({ progress, showPercentage = true, size = 'default' }) => {
  const percentage = Math.min(100, Math.max(0, progress || 0));
  
  const sizeClasses = {
    small: 'h-1',
    default: 'h-2',
    large: 'h-3'
  };

  const getStatusColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-yellow-500';
    if (percentage < 90) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${getStatusColor(percentage)} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {percentage === 0 ? 'Not started' : 
             percentage < 100 ? 'In progress' : 'Completed'}
          </span>
          <span className="text-xs font-medium text-gray-700">
            {percentage}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
