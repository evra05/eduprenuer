import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiTrendingUp, FiClock, FiAward, FiBarChart } from 'react-icons/fi';

const ProgressOverview = ({ children }) => {
  const { token } = useAuth();
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (children.length > 0) {
      fetchProgressData();
    } else {
      setLoading(false);
    }
  }, [children]);

  const fetchProgressData = async () => {
    try {
      const progressPromises = children.map(async (child) => {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/progress/child/${child._id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          return { childId: child._id, progress: data.data.progress };
        }
        return { childId: child._id, progress: [] };
      });

      const results = await Promise.all(progressPromises);
      const progressMap = {};
      results.forEach(result => {
        progressMap[result.childId] = result.progress;
      });

      setProgressData(progressMap);
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    const stats = {
      totalModules: 0,
      completedModules: 0,
      inProgressModules: 0,
      totalTimeSpent: 0,
      averageScore: 0
    };

    Object.values(progressData).forEach(childProgress => {
      if (Array.isArray(childProgress)) {
        childProgress.forEach(progress => {
          stats.totalModules++;
          if (progress.status === 'completed') {
            stats.completedModules++;
          } else if (progress.status === 'in-progress') {
            stats.inProgressModules++;
          }
          stats.totalTimeSpent += progress.timeSpent || 0;
          if (progress.scores?.overall) {
            stats.averageScore += progress.scores.overall;
          }
        });
      }
    });

    if (stats.totalModules > 0) {
      stats.averageScore = Math.round(stats.averageScore / stats.totalModules);
    }

    return stats;
  };

  const getChildProgressSummary = (childId) => {
    const childProgress = progressData[childId] || [];
    if (!Array.isArray(childProgress)) return { completed: 0, total: 0, percentage: 0 };

    const completed = childProgress.filter(p => p.status === 'completed').length;
    const total = childProgress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  const formatTimeSpent = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress</h3>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FiTrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-900">{stats.completedModules}</p>
          <p className="text-sm text-blue-700">Modules Completed</p>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <FiClock className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-900">{formatTimeSpent(stats.totalTimeSpent)}</p>
          <p className="text-sm text-green-700">Total Time Spent</p>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <FiAward className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-900">{stats.averageScore}%</p>
          <p className="text-sm text-purple-700">Average Score</p>
        </div>

        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <FiBarChart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-orange-900">{stats.inProgressModules}</p>
          <p className="text-sm text-orange-700">In Progress</p>
        </div>
      </div>

      {/* Individual Child Progress */}
      {children.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Individual Progress</h4>
          <div className="space-y-4">
            {children.map((child) => {
              const childStats = getChildProgressSummary(child._id);
              return (
                <div key={child._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {child.profilePicture ? (
                        <img
                          src={child.profilePicture}
                          alt={child.name}
                          className="w-8 h-8 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{child.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {childStats.completed}/{childStats.total} modules
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${childStats.percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-600">{childStats.percentage}% complete</span>
                    <span className="text-xs text-gray-500">Age {child.age}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {children.length === 0 && (
        <div className="text-center py-8">
          <FiBarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No children added yet</p>
          <p className="text-sm text-gray-500">Add children to start tracking their learning progress</p>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;

