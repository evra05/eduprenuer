import React, { useState } from 'react';
import { FiCheck, FiEdit3, FiSave, FiRotateCcw } from 'react-icons/fi';

const WorksheetComponent = ({ worksheet, onComplete, onClose }) => {
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = worksheet.questions.length;

    worksheet.questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && userAnswer.toString().toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim()) {
        correctAnswers++;
      }
    });

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setCompleted(true);
    setShowResults(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setCompleted(false);
    setScore(0);
    setShowResults(false);
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Perfect! You\'re a worksheet wizard! 🌟';
    if (score >= 80) return 'Excellent work! You really understand this! 👍';
    if (score >= 70) return 'Great job! You\'re getting the hang of it! 💪';
    if (score >= 60) return 'Good effort! Keep practicing! 📚';
    return 'Nice try! Review the material and try again! 🎯';
  };

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const isAnswerCorrect = (questionId) => {
    const question = worksheet.questions.find(q => q.id === questionId);
    const userAnswer = answers[questionId];
    if (!userAnswer || !question) return null;
    
    return userAnswer.toString().toLowerCase().trim() === question.correctAnswer.toString().toLowerCase().trim();
  };

  if (showResults) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mb-4">
                <FiCheck className="w-16 h-16 text-green-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Worksheet Complete!</h3>
              <p className={`text-3xl font-bold ${getScoreColor()}`}>
                {score}%
              </p>
              <p className="text-lg text-gray-600 mt-2">{getScoreMessage()}</p>
            </div>

            {/* Results */}
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Your Answers:</h4>
              {worksheet.questions.map((question, index) => {
                const isCorrect = isAnswerCorrect(question.id);
                const userAnswer = answers[question.id];
                
                return (
                  <div key={question.id} className={`border rounded-lg p-4 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        Question {index + 1}
                      </h5>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{question.question}</p>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Your answer:</span> 
                        <span className={`ml-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {userAnswer || 'No answer'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="text-sm">
                          <span className="font-medium">Correct answer:</span> 
                          <span className="ml-2 text-green-800">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FiRotateCcw className="mr-2" />
                Try Again
              </button>
              <button
                onClick={() => onComplete({ score, totalQuestions: worksheet.questions.length })}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{worksheet.title}</h3>
            <div className="text-sm">
              Complete the worksheet below
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Instructions:</h4>
          <p className="text-gray-700">{worksheet.instructions}</p>
        </div>

        {/* Questions */}
        <div className="p-6">
          <div className="space-y-6">
            {worksheet.questions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">
                  Question {index + 1}: {question.question}
                </h5>
                
                {question.type === 'text' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your answer..."
                  />
                )}
                
                {question.type === 'number' && (
                  <input
                    type="number"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter a number..."
                  />
                )}
                
                {question.type === 'textarea' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your answer..."
                  />
                )}
                
                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Exit Worksheet
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex items-center"
          >
            <FiSave className="mr-2" />
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorksheetComponent;

