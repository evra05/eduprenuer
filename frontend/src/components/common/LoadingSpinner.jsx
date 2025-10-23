import React from 'react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]} ${className}`}></div>
  );
};

export default LoadingSpinner;