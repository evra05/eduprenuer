import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiTrendingUp, FiClock, FiAward, FiBarChart, FiCalendar, FiTarget, FiStar } from 'react-icons/fi';

const DetailedProgressReport = ({ childId, onClose }) => {
  const { token } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, [childId]);

  const fetchProgressData = async () => {
    try {
      const [progressResponse, achievementsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/progress/child/${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/child`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (progressResponse.ok && achievementsResponse.ok) {
        const progressData = await progressResponse.json();
        const achievementsData = await achievementsResponse.json();
        
        setProgressData(progressData.data);
        setAchievements(achievementsData.data.achievements);
      } else {
        setError('Failed to load progress data');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!progressData) return null;

    const stats = {
      totalModules: 0,
      completedModules: 0,
      inProgressModules: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      totalPoints: 0,
      recentActivity: []
    };

    // Process progress data
    if (Array.isArray(progressData)) {
      progressData.forEach(progress => {
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

      if (stats.totalModules > 0) {
        stats.averageScore = Math.round(stats.averageScore / stats.totalModules);
      }
    }

    // Process achievements
    stats.totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);

    return stats;
  };

  const formatTimeSpent = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressTrend = () => {
    if (!progressData || !Array.isArray(progressData)) return null;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentProgress = progressData.filter(progress => 
      new Date(progress.lastAccessedAt) > lastWeek
    );

    return {
      modulesAccessed: recentProgress.length,
      timeSpent: recentProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
    };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading progress report...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl mx-4">
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const trend = getProgressTrend();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Detailed Progress Report</h2>
              <p className="text-blue-100">Comprehensive learning analytics</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <FiTarget className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{stats?.completedModules || 0}</p>
              <p className="text-sm text-blue-700">Modules Completed</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <FiClock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{formatTimeSpent(stats?.totalTimeSpent || 0)}</p>
              <p className="text-sm text-green-700">Total Time Spent</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <FiAward className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{stats?.averageScore || 0}%</p>
              <p className="text-sm text-purple-700">Average Score</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <FiStar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">{stats?.totalPoints || 0}</p>
              <p className="text-sm text-yellow-700">Total Points</p>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Module Progress */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiBarChart className="w-5 h-5 mr-2" />
                Module Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-medium">{stats?.completedModules || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${((stats?.completedModules || 0) / (stats?.totalModules || 1)) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="font-medium">{stats?.inProgressModules || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${((stats?.inProgressModules || 0) / (stats?.totalModules || 1)) * 100}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Not Started</span>
                  <span className="font-medium">{(stats?.totalModules || 0) - (stats?.completedModules || 0) - (stats?.inProgressModules || 0)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${(((stats?.totalModules || 0) - (stats?.completedModules || 0) - (stats?.inProgressModules || 0)) / (stats?.totalModules || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiCalendar className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">Modules Accessed (Last 7 days)</span>
                  <span className="font-medium text-blue-900">{trend?.modulesAccessed || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-green-800">Time Spent (Last 7 days)</span>
                  <span className="font-medium text-green-900">{formatTimeSpent(trend?.timeSpent || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-800">Achievements Earned</span>
                  <span className="font-medium text-purple-900">{achievements.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.slice(0, 6).map((achievement) => (
                  <div key={achievement._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiAward className="w-5 h-5 text-yellow-500 mr-2" />
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">+{achievement.points} pts</span>
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {stats?.averageScore < 70 && (
                <div className="flex items-start">
                  <FiTrendingUp className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Focus on Understanding</h4>
                    <p className="text-sm text-gray-600">Consider reviewing completed modules to improve comprehension and scores.</p>
                  </div>
                </div>
              )}
              
              {stats?.inProgressModules > 0 && (
                <div className="flex items-start">
                  <FiTarget className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Complete In-Progress Modules</h4>
                    <p className="text-sm text-gray-600">Finish the {stats.inProgressModules} module(s) currently in progress to maintain momentum.</p>
                  </div>
                </div>
              )}
              
              {trend?.modulesAccessed < 3 && (
                <div className="flex items-start">
                  <FiCalendar className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Increase Learning Frequency</h4>
                    <p className="text-sm text-gray-600">Try to engage with learning modules more regularly for better retention.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedProgressReport;

