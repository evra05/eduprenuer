import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiTarget, FiRotateCcw } from 'react-icons/fi';

const SimulationComponent = ({ simulation, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [money, setMoney] = useState(simulation.initialMoney || 100);
  const [inventory, setInventory] = useState(simulation.initialInventory || {});
  const [decisions, setDecisions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleDecision = (decision) => {
    const newDecisions = [...decisions, decision];
    setDecisions(newDecisions);

    // Apply decision effects
    if (decision.effects) {
      if (decision.effects.money) {
        setMoney(prev => Math.max(0, prev + decision.effects.money));
      }
      if (decision.effects.inventory) {
        setInventory(prev => ({
          ...prev,
          ...decision.effects.inventory
        }));
      }
    }

    // Move to next step
    if (currentStep < simulation.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate final score
      const finalScore = calculateScore();
      setScore(finalScore);
      setCompleted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    
    // Base score from money
    score += Math.floor(money / 10);
    
    // Bonus for good decisions
    decisions.forEach(decision => {
      if (decision.score) {
        score += decision.score;
      }
    });
    
    // Inventory bonus
    Object.values(inventory).forEach(amount => {
      score += amount * 2;
    });
    
    return Math.max(0, score);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setMoney(simulation.initialMoney || 100);
    setInventory(simulation.initialInventory || {});
    setDecisions([]);
    setCompleted(false);
    setScore(0);
  };

  const getScoreMessage = () => {
    if (score >= 80) return 'Outstanding! You\'re a business genius! 🌟';
    if (score >= 60) return 'Great job! You made smart decisions! 👍';
    if (score >= 40) return 'Good work! Keep learning! 💪';
    return 'Nice try! Every entrepreneur learns from experience! 📚';
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-blue-600';
    return 'text-red-600';
  };

  if (completed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="mb-4">
              <FiTrendingUp className="w-16 h-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Simulation Complete!</h3>
            <p className={`text-3xl font-bold ${getScoreColor()}`}>
              {score} points
            </p>
            <p className="text-lg text-gray-600 mt-2">{getScoreMessage()}</p>
            
            <div className="mt-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Final Money:</span>
                  <span className="font-medium">${money}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Decisions Made:</span>
                  <span className="font-medium">{decisions.length}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <FiRotateCcw className="mr-2" />
                Try Again
              </button>
              <button
                onClick={() => onComplete({ score, money, decisions: decisions.length })}
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

  const currentStepData = simulation.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{simulation.title}</h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Money: <span className="font-bold">${money}</span>
              </div>
              <div className="text-sm">
                Step: <span className="font-bold">{currentStep + 1}/{simulation.steps.length}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 w-full bg-white bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / simulation.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scenario */}
        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              {currentStepData.title}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <FiDollarSign className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-green-800">Available Money</div>
                  <div className="text-lg font-bold text-green-900">${money}</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <FiShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-blue-800">Inventory</div>
                  <div className="text-lg font-bold text-blue-900">
                    {Object.keys(inventory).length} items
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Options */}
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 mb-3">What would you do?</h5>
            {currentStepData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleDecision(option)}
                className="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
              >
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 mt-0.5 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">
                      {option.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {option.description}
                    </div>
                    {option.cost && (
                      <div className="text-sm text-red-600 mt-1">
                        Cost: ${option.cost}
                      </div>
                    )}
                    {option.reward && (
                      <div className="text-sm text-green-600 mt-1">
                        Reward: ${option.reward}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Exit Simulation
          </button>
          <div className="text-sm text-gray-600">
            Make smart decisions to maximize your score!
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationComponent;