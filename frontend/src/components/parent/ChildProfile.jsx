import React, { useState } from 'react';
import { FiUser, FiCalendar, FiKey, FiEdit, FiTrash2, FiCopy, FiBarChart } from 'react-icons/fi';

const ChildProfile = ({ child, onEdit, onDelete, onRegenerateCode, onViewProgress }) => {
  const [showLoginCode, setShowLoginCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLoginCode = async () => {
    try {
      await navigator.clipboard.writeText(child.loginCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getGenderDisplay = (gender) => {
    const genderMap = {
      'male': 'Male',
      'female': 'Female',
      'other': 'Other',
      'prefer-not-to-say': 'Prefer not to say'
    };
    return genderMap[gender] || 'Not specified';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <img
            src={child.profilePicture || '/uploads/children/default-avatar.svg'}
            alt={child.name}
            className="w-12 h-12 rounded-full object-cover mr-4"
            onError={(e) => {
              e.target.src = '/uploads/children/default-avatar.svg';
            }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
            <p className="text-sm text-gray-600">Age {child.age}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(child)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit child"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(child._id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete child"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <FiCalendar className="w-4 h-4 mr-2" />
          <span>Gender: {getGenderDisplay(child.gender)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <FiKey className="w-4 h-4 mr-2" />
          <span>Login Code: </span>
          <div className="flex items-center ml-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
              {showLoginCode ? child.loginCode : '••••••••'}
            </code>
            <button
              onClick={() => setShowLoginCode(!showLoginCode)}
              className="ml-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              {showLoginCode ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={copyLoginCode}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
              title="Copy login code"
            >
              <FiCopy className="w-3 h-3" />
            </button>
            {copied && (
              <span className="ml-2 text-xs text-green-600">Copied!</span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <button
            onClick={() => onRegenerateCode(child._id)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium block"
          >
            Regenerate Login Code
          </button>
          {onViewProgress && (
            <button
              onClick={() => onViewProgress(child._id)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <FiBarChart className="w-3 h-3 mr-1" />
              View Progress Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildProfile;
