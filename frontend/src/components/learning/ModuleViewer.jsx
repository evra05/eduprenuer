import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiArrowRight, FiCheck, FiClock, FiStar } from 'react-icons/fi';
import ProgressBar from './ProgressBar';
import QuizComponent from './QuizComponent';
import GameComponent from './GameComponent';
import SimulationComponent from './SimulationComponent';
import WorksheetComponent from './WorksheetComponent';

const ModuleViewer = ({ moduleId, onClose }) => {
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);

  useEffect(() => {
    fetchModule();
    fetchProgress();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/modules/${moduleId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setModule(data.data.module);
      }
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/progress/child/${moduleId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('childToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (completionPercentage, timeSpent = 0) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/progress/child/${moduleId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('childToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            completionPercentage,
            timeSpent,
            status: completionPercentage >= 100 ? 'completed' : 'in-progress'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProgress(data.data.progress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNextLesson = () => {
    if (module && currentLesson < module.content.lessons.length - 1) {
      const newLesson = currentLesson + 1;
      setCurrentLesson(newLesson);
      
      // Update progress
      const progressPercentage = Math.round(((newLesson + 1) / module.content.lessons.length) * 100);
      updateProgress(progressPercentage, 2); // 2 minutes per lesson
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    }
  };

  const handleActivityComplete = (results) => {
    setShowActivity(false);
    setCurrentActivity(null);
    
    // Update progress based on activity results
    const activityProgress = Math.round((results.percentage || 0) * 0.3); // Activities count for 30% of progress
    const lessonProgress = Math.round(((currentLesson + 1) / module.content.lessons.length) * 70); // Lessons count for 70%
    const totalProgress = Math.min(100, activityProgress + lessonProgress);
    
    updateProgress(totalProgress, 5); // 5 minutes for activity
  };

  const handleStartActivity = (activity) => {
    setCurrentActivity(activity);
    setShowActivity(true);
  };

  const handleCompleteModule = () => {
    updateProgress(100, 5); // Complete the module
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">Module not found</p>
          <button onClick={onClose} className="btn-primary mt-4">
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentLessonData = module.content.lessons[currentLesson];
  const isLastLesson = currentLesson === module.content.lessons.length - 1;
  const isCompleted = progress?.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
              <p className="text-sm text-gray-600">
                Lesson {currentLesson + 1} of {module.content.lessons.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <FiClock className="w-4 h-4 mr-1" />
              {module.estimatedDuration} min
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiStar className="w-4 h-4 mr-1" />
              {module.difficultyLevel}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <ProgressBar 
            progress={progress?.completionPercentage || 0} 
            showPercentage={true}
            size="default"
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {currentLessonData.title}
            </h3>
            
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                {currentLessonData.content}
              </p>
            </div>

            {/* Lesson Type Specific Content */}
            {currentLessonData.type === 'interactive' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Interactive Activity</h4>
                <p className="text-blue-800">This is an interactive lesson. Try the activities below to practice what you've learned!</p>
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => {
                      const activity = module.content.activities.find(a => a.type === 'simulation');
                      if (activity) handleStartActivity(activity);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Try Simulation
                  </button>
                  <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                    Learn More
                  </button>
                </div>
              </div>
            )}

            {currentLessonData.type === 'quiz' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Quick Quiz</h4>
                <p className="text-green-800">Test your knowledge with this quick quiz!</p>
                <button 
                  onClick={() => {
                    const activity = module.content.activities.find(a => a.type === 'quiz');
                    if (activity) handleStartActivity(activity);
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Start Quiz
                </button>
              </div>
            )}

            {/* Activities Section */}
            {module.content.activities && module.content.activities.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Practice Activities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.content.activities.map((activity, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-gray-900 mb-2">{activity.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                      <button
                        onClick={() => handleStartActivity(activity)}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          activity.type === 'quiz' ? 'bg-green-600 hover:bg-green-700' :
                          activity.type === 'game' ? 'bg-purple-600 hover:bg-purple-700' :
                          activity.type === 'simulation' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {activity.type === 'quiz' ? 'Start Quiz' :
                         activity.type === 'game' ? 'Play Game' :
                         activity.type === 'simulation' ? 'Run Simulation' :
                         'Start Activity'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePreviousLesson}
            disabled={currentLesson === 0}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiArrowLeft className="mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {module.content.lessons.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentLesson ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {isLastLesson ? (
            <button
              onClick={handleCompleteModule}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiCheck className="mr-2" />
              Complete Module
            </button>
          ) : (
            <button
              onClick={handleNextLesson}
              className="flex items-center px-4 py-2 btn-primary"
            >
              Next
              <FiArrowRight className="ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Activity Components */}
      {showActivity && currentActivity && (
        <>
          {currentActivity.type === 'quiz' && (
            <QuizComponent
              questions={currentActivity.questions}
              onComplete={handleActivityComplete}
              onClose={() => setShowActivity(false)}
            />
          )}
          {currentActivity.type === 'game' && (
            <GameComponent
              questions={currentActivity.questions}
              onComplete={handleActivityComplete}
              onClose={() => setShowActivity(false)}
            />
          )}
          {currentActivity.type === 'simulation' && (
            <SimulationComponent
              simulation={currentActivity}
              onComplete={handleActivityComplete}
              onClose={() => setShowActivity(false)}
            />
          )}
          {currentActivity.type === 'worksheet' && (
            <WorksheetComponent
              worksheet={currentActivity}
              onComplete={handleActivityComplete}
              onClose={() => setShowActivity(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ModuleViewer;
