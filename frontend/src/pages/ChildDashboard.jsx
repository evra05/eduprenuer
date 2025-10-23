import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../context/ChildContext';
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi';
import CompanySetup from '../components/child/CompanySetup';
import ModuleCard from '../components/learning/ModuleCard';
import ModuleViewer from '../components/learning/ModuleViewer';
import AchievementDisplay from '../components/child/AchievementDisplay';
import VirtualOffice from '../components/child/VirtualOffice';
import ChildWelcome from '../components/child/ChildWelcome';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { child, childLogout, updateChildProfile, token, loading: authLoading } = useChild();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompanySetup, setShowCompanySetup] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [success, setSuccess] = useState('');
  const [progressData, setProgressData] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);
  const dataLoadedRef = useRef(false);

  const fetchModules = useCallback(async () => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/modules?age=${child?.age || 8}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setModules(data.data.modules);
      } else if (response.status === 429) {
        // Rate limited - wait a bit and retry with longer delay
        console.warn('Rate limited, retrying modules fetch in 3 seconds...');
        setTimeout(() => fetchModules(), 3000);
        return;
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  }, [child?.age]);

  const fetchProgressData = useCallback(async (modulesToFetch) => {
    if (!modulesToFetch?.length || !token || authLoading) return;
    
    setProgressLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
      // Batch requests with delays to avoid rate limiting
      const progressMap = {};
      
      for (let i = 0; i < modulesToFetch.length; i++) {
        const module = modulesToFetch[i];
        
        try {
          const response = await fetch(
            `${baseUrl}/api/progress/child/${module._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            progressMap[module._id] = data.data.progress;
          } else if (response.status === 401) {
            console.warn('Authentication failed for progress request, token may be invalid');
            // Don't redirect immediately, let the context handle it
            console.log('401 error detected, stopping progress fetch');
            return;
          } else if (response.status === 429) {
            console.warn('Rate limited, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Retry once
            const retryResponse = await fetch(
              `${baseUrl}/api/progress/child/${module._id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              progressMap[module._id] = retryData.data.progress;
            } else {
              progressMap[module._id] = null;
            }
          } else {
            progressMap[module._id] = null;
          }
        } catch (error) {
          console.error(`Error fetching progress for module ${module._id}:`, error);
          progressMap[module._id] = null;
        }
        
        // Add delay between requests to avoid rate limiting
        if (i < modulesToFetch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setProgressData(progressMap);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setProgressLoading(false);
    }
  }, [token, authLoading, navigate]);

  const fetchAchievements = useCallback(async () => {
    if (!token || authLoading) return;
    
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/achievements/child`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.data.achievements || []);
      } else if (response.status === 401) {
        console.warn('Authentication failed for achievements request, token may be invalid');
        // Don't redirect immediately, let the context handle it
        console.log('401 error detected, stopping achievements fetch');
        return;
      } else if (response.status === 429) {
        // Rate limited - wait a bit and retry with longer delay
        console.warn('Rate limited, retrying achievements fetch in 3 seconds...');
        setTimeout(() => fetchAchievements(), 3000);
        return;
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  }, [token, authLoading, navigate]);

  useEffect(() => {
    // Only load data after authentication is complete and we have a valid token
    if (authLoading || !token || !child || dataLoadedRef.current) {
      return;
    }
    
    // Mark as loading to prevent multiple calls
    dataLoadedRef.current = true;
    
    // Sequential API calls to prevent rate limiting
    const loadData = async () => {
      await fetchModules();
      // Small delay between calls
      setTimeout(() => {
        fetchAchievements();
      }, 100);
    };
    
    loadData();
  }, [authLoading, token, child, fetchModules, fetchAchievements]);

  // Fetch progress data when modules change
  useEffect(() => {
    if (modules.length > 0 && token && !authLoading) {
      fetchProgressData(modules);
    }
  }, [modules, token, authLoading, fetchProgressData]);

  // Check if child needs onboarding
  useEffect(() => {
    if (child && !authLoading) {
      // Show welcome if child hasn't completed company setup
      if (!child.companyProfile?.companyName) {
        setShowWelcome(true);
      }
    }
  }, [child, authLoading]);

  const handleModuleStart = (module) => {
    setSelectedModule(module._id);
  };

  const handleModuleContinue = (module) => {
    setSelectedModule(module._id);
  };

  const handleModuleClose = () => {
    setSelectedModule(null);
    // Refresh progress data and achievements
    setTimeout(() => {
      fetchProgressData(modules);
      setTimeout(() => {
        fetchAchievements();
      }, 200);
    }, 100);
  };

  const handleCompanySetup = async (companyData) => {
    try {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/child/company-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });

      if (response.ok) {
        const data = await response.json();
        updateChildProfile({
          ...child,
          companyProfile: data.data.companyProfile
        });
        setShowCompanySetup(false);
        setSuccess('Company setup successful!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('Failed to update company profile');
      }
    } catch (error) {
      console.error('Error updating company profile:', error);
    }
  };

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    // If no company profile exists, show company setup
    if (!child?.companyProfile?.companyName) {
      setShowCompanySetup(true);
    }
  };

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!child || !token) {
    navigate('/child-login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">EduPreneur</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {child?.profilePicture && !child.profilePicture.includes('default-avatar') ? (
                  <img
                    src={child.profilePicture}
                    alt={child.name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
                  style={{ display: child?.profilePicture && !child.profilePicture.includes('default-avatar') ? 'none' : 'flex' }}
                >
                  <FiUser className="text-primary-600" />
                </div>
                <span className="text-gray-700">Hi, {child?.name}!</span>
              </div>
              <button
                onClick={childLogout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to {child?.companyProfile?.companyName || 'Your Company'}!
          </h2>
          <p className="text-gray-600">Let's learn about business and money together</p>
        </div>

        {/* Company Profile Setup */}
        {!child?.companyProfile?.companyName && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Up Your Company</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHome className="text-gray-400 text-2xl" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Create Your Business</h4>
              <p className="text-gray-600 mb-6">
                Choose a company name, business type, and create your virtual office
              </p>
              <button 
                onClick={() => setShowCompanySetup(true)}
                className="btn-primary"
              >
                Start Company Setup
              </button>
            </div>
          </div>
        )}

        {/* Company Info Display */}
        {child?.companyProfile?.companyName && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Company</h3>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <FiHome className="text-primary-600 text-2xl" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{child.companyProfile.companyName}</h4>
                <p className="text-gray-600 capitalize">
                  {child.companyProfile.businessType?.replace('-', ' ')} Business
                </p>
                {child.companyProfile.description && (
                  <p className="text-sm text-gray-500 mt-1">{child.companyProfile.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Virtual Office */}
        <div className="mb-8">
          <VirtualOffice child={child} achievements={achievements} />
        </div>

        {/* Learning Modules */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Modules</h3>
          
          {loading || progressLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">
                {loading ? 'Loading modules...' : 'Loading progress...'}
              </p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No modules available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <ModuleCard
                  key={module._id}
                  module={module}
                  progress={progressData[module._id]}
                  onStart={handleModuleStart}
                  onContinue={handleModuleContinue}
                />
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <AchievementDisplay childId={child?._id} />
      </main>

      {/* Welcome Modal */}
      {showWelcome && (
        <ChildWelcome
          child={child}
          onComplete={handleWelcomeComplete}
        />
      )}

      {/* Company Setup Modal */}
      {showCompanySetup && (
        <CompanySetup
          onComplete={handleCompanySetup}
          onCancel={() => setShowCompanySetup(false)}
        />
      )}

      {/* Module Viewer */}
      {selectedModule && (
        <ModuleViewer
          moduleId={selectedModule}
          onClose={handleModuleClose}
        />
      )}
    </div>
  );
};

export default ChildDashboard;
