import React, { useState, useEffect, useCallback } from 'react';
import { FiAward, FiStar, FiTarget } from 'react-icons/fi';

const AchievementDisplay = ({ childId }) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalAchievements: 0,
    totalPoints: 0,
    byType: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/achievements/child`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('childToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.data.achievements);
        setStats(data.data.stats);
      } else if (response.status === 429) {
        // Rate limited - wait a bit and retry with exponential backoff
        console.warn('Rate limited, retrying achievements fetch in 3 seconds...');
        setTimeout(() => fetchAchievements(), 3000);
        return;
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'module-completion':
        return <FiTarget className="w-6 h-6" />;
      case 'perfect-score':
        return <FiStar className="w-6 h-6" />;
      case 'time-milestone':
        return <FiAward className="w-6 h-6" />;
      case 'streak':
        return <FiAward className="w-6 h-6" />;
      case 'special':
        return <FiAward className="w-6 h-6" />;
      default:
        return <FiAward className="w-6 h-6" />;
    }
  };

  const getAchievementColor = (type) => {
    switch (type) {
      case 'module-completion':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'perfect-score':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'time-milestone':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'streak':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'special':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FiAward className="w-4 h-4 mr-1" />
            {stats.totalAchievements} earned
          </div>
          <div className="flex items-center">
            <FiStar className="w-4 h-4 mr-1" />
            {stats.totalPoints} points
          </div>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAward className="text-gray-400 text-2xl" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h4>
          <p className="text-gray-600">
            Complete learning modules to earn badges and achievements
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Recent Achievements */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Achievements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement._id}
                  className={`p-3 rounded-lg border ${getAchievementColor(achievement.achievementType)}`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getAchievementIcon(achievement.achievementType)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h5 className="font-medium text-sm">{achievement.title}</h5>
                      <p className="text-xs opacity-75 mt-1">{achievement.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-medium">+{achievement.points} pts</span>
                        <span className="text-xs opacity-75">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Stats */}
          {Object.keys(stats.byType).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Achievement Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getAchievementIcon(type)}
                    </div>
                    <p className="text-xs font-medium text-gray-700 capitalize">
                      {type.replace('-', ' ')}
                    </p>
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show All Achievements Button */}
          {achievements.length > 4 && (
            <div className="text-center pt-4">
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All Achievements ({achievements.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementDisplay;
