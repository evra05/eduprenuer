import React, { useState, useEffect } from 'react';
import { FiHome, FiAward, FiStar, FiGift, FiSettings, FiUser } from 'react-icons/fi';

const VirtualOffice = ({ child, achievements = [] }) => {
  const [selectedRoom, setSelectedRoom] = useState('office');
  const [decorations, setDecorations] = useState([]);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // Calculate points and level from achievements
    const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);
    setPoints(totalPoints);
    setLevel(Math.floor(totalPoints / 100) + 1);
    
    // Load decorations based on achievements
    const unlockedDecorations = achievements.map(achievement => ({
      id: achievement._id,
      name: achievement.title,
      type: achievement.achievementType,
      icon: getAchievementIcon(achievement.achievementType),
      unlocked: true
    }));
    setDecorations(unlockedDecorations);
  }, [achievements]);

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'module-completion': return '📚';
      case 'perfect-score': return '⭐';
      case 'time-milestone': return '⏰';
      case 'streak': return '🔥';
      case 'special': return '🎉';
      default: return '🏆';
    }
  };

  const getRoomBackground = (room) => {
    switch (room) {
      case 'office':
        return 'bg-gradient-to-br from-blue-100 to-blue-200';
      case 'library':
        return 'bg-gradient-to-br from-green-100 to-green-200';
      case 'trophy':
        return 'bg-gradient-to-br from-yellow-100 to-yellow-200';
      case 'store':
        return 'bg-gradient-to-br from-purple-100 to-purple-200';
      default:
        return 'bg-gradient-to-br from-gray-100 to-gray-200';
    }
  };

  const renderOffice = () => (
    <div className="relative h-full">
      {/* Desk */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-amber-600 rounded-t-lg">
        <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded"></div>
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded"></div>
      </div>
      
      {/* Computer */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gray-800 rounded">
        <div className="absolute top-1 left-1 w-14 h-8 bg-green-400 rounded-sm"></div>
      </div>
      
      {/* Decorations */}
      {decorations.map((decoration, index) => (
        <div
          key={decoration.id}
          className="absolute animate-bounce"
          style={{
            top: `${20 + (index * 15)}%`,
            left: `${10 + (index * 20)}%`,
            animationDelay: `${index * 0.5}s`
          }}
        >
          <div className="text-2xl">{decoration.icon}</div>
        </div>
      ))}
      
      {/* Company Logo */}
      {child?.companyProfile?.companyName && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
          <div className="text-sm font-bold text-gray-800">{child.companyProfile.companyName}</div>
        </div>
      )}
    </div>
  );

  const renderLibrary = () => (
    <div className="relative h-full">
      {/* Bookshelf */}
      <div className="absolute bottom-0 left-4 w-24 h-32 bg-amber-800 rounded">
        <div className="grid grid-cols-2 gap-1 p-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-6 bg-red-500 rounded-sm"></div>
          ))}
        </div>
      </div>
      
      {/* Reading Chair */}
      <div className="absolute bottom-0 right-8 w-16 h-20 bg-green-600 rounded-t-lg">
        <div className="absolute top-2 left-2 w-12 h-16 bg-green-500 rounded"></div>
      </div>
      
      {/* Floating Books */}
      {achievements.filter(a => a.achievementType === 'module-completion').map((achievement, index) => (
        <div
          key={achievement._id}
          className="absolute animate-pulse"
          style={{
            top: `${30 + (index * 10)}%`,
            right: `${20 + (index * 15)}%`
          }}
        >
          <div className="text-xl">📖</div>
        </div>
      ))}
    </div>
  );

  const renderTrophyRoom = () => (
    <div className="relative h-full">
      {/* Trophy Case */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-32 bg-amber-600 rounded-t-lg">
        <div className="grid grid-cols-3 gap-2 p-3">
          {achievements.map((achievement, index) => (
            <div key={achievement._id} className="text-center">
              <div className="text-2xl mb-1">{getAchievementIcon(achievement.achievementType)}</div>
              <div className="text-xs text-white font-medium">{achievement.title}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Celebration Effects */}
      {achievements.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className="text-4xl animate-bounce">🎉</div>
        </div>
      )}
    </div>
  );

  const renderStore = () => (
    <div className="relative h-full">
      {/* Store Counter */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-amber-600 rounded-t-lg">
        <div className="absolute top-2 left-2 w-8 h-8 bg-green-500 rounded"></div>
        <div className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded"></div>
      </div>
      
      {/* Items for Sale */}
      <div className="absolute top-8 left-4 grid grid-cols-2 gap-2">
        <div className="bg-white p-2 rounded shadow text-center">
          <div className="text-lg">🎨</div>
          <div className="text-xs">50 pts</div>
        </div>
        <div className="bg-white p-2 rounded shadow text-center">
          <div className="text-lg">🎵</div>
          <div className="text-xs">75 pts</div>
        </div>
        <div className="bg-white p-2 rounded shadow text-center">
          <div className="text-lg">🎮</div>
          <div className="text-xs">100 pts</div>
        </div>
        <div className="bg-white p-2 rounded shadow text-center">
          <div className="text-lg">🌟</div>
          <div className="text-xs">150 pts</div>
        </div>
      </div>
      
      {/* Points Display */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
        <div className="text-sm font-bold text-gray-800">Your Points</div>
        <div className="text-xl font-bold text-blue-600">{points}</div>
      </div>
    </div>
  );

  const renderRoomContent = () => {
    switch (selectedRoom) {
      case 'office': return renderOffice();
      case 'library': return renderLibrary();
      case 'trophy': return renderTrophyRoom();
      case 'store': return renderStore();
      default: return renderOffice();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiHome className="w-6 h-6 mr-2" />
            <h3 className="text-lg font-semibold">Virtual Office</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Level {level}
            </div>
            <div className="text-sm">
              {points} pts
            </div>
          </div>
        </div>
      </div>

      {/* Room Navigation */}
      <div className="flex border-b">
        {[
          { id: 'office', name: 'Office', icon: FiHome },
          { id: 'library', name: 'Library', icon: FiUser },
          { id: 'trophy', name: 'Trophies', icon: FiAward },
          { id: 'store', name: 'Store', icon: FiGift }
        ].map((room) => {
          const IconComponent = room.icon;
          return (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                selectedRoom === room.id
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <IconComponent className="w-4 h-4 mr-2" />
              {room.name}
            </button>
          );
        })}
      </div>

      {/* Room Content */}
      <div className={`h-64 ${getRoomBackground(selectedRoom)}`}>
        {renderRoomContent()}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Earn points by completing modules and activities!
          </div>
          <div className="flex items-center">
            <FiStar className="w-4 h-4 mr-1 text-yellow-500" />
            {achievements.length} achievements
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualOffice;
