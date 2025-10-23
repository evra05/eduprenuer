import React, { useState, useEffect } from 'react';
import { FiRotateCcw, FiAward, FiStar } from 'react-icons/fi';

const GameComponent = ({ questions, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft > 0 && !completed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !completed) {
      handleNextQuestion();
    }
  }, [timeLeft, completed]);

  const handleAnswerSelect = (answerIndex) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestion].correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(30);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setStreak(0);
    setShowFeedback(false);
    setCompleted(false);
    setTimeLeft(30);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'Amazing! You\'re a money expert! 🌟';
    if (percentage >= 60) return 'Great job! Keep learning! 👍';
    return 'Nice try! Practice makes perfect! 💪';
  };

  if (completed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="mb-4">
              <FiAward className="w-16 h-16 text-yellow-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h3>
            <p className={`text-3xl font-bold ${getScoreColor()}`}>
              {score}/{questions.length}
            </p>
            <p className="text-lg text-gray-600 mt-2">{getScoreMessage()}</p>
            
            {streak > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-800 font-medium">
                    Best Streak: {streak} in a row!
                  </span>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FiRotateCcw className="mr-2" />
                Play Again
              </button>
              <button
                onClick={() => onComplete({ score, total: questions.length, percentage: (score / questions.length) * 100, streak })}
                className="flex-1 btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Coin Sorting Game</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Score: <span className="font-bold">{score}</span>
              </div>
              <div className="text-sm">
                Streak: <span className="font-bold">{streak}</span>
              </div>
              <div className="text-sm">
                Time: <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>
          </div>
          <div className="mt-2 w-full bg-white bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">
            {currentQ.question}
          </h4>
          
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  showFeedback && selectedAnswer === index
                    ? isCorrect
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-red-500 bg-red-50 text-red-900'
                    : showFeedback && index === currentQ.correct
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : selectedAnswer === index
                    ? 'border-primary-600 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                    showFeedback && selectedAnswer === index
                      ? isCorrect
                        ? 'border-green-500 bg-green-500'
                        : 'border-red-500 bg-red-500'
                      : showFeedback && index === currentQ.correct
                      ? 'border-green-500 bg-green-500'
                      : selectedAnswer === index
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {((showFeedback && selectedAnswer === index) || (showFeedback && index === currentQ.correct)) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`mt-4 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? '🎉 Correct! Great job!' : '❌ Not quite right. Keep trying!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Exit Game
          </button>
          {showFeedback && (
            <button
              onClick={handleNextQuestion}
              className="btn-primary"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Game' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameComponent;
