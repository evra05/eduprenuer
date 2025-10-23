import React, { createContext, useContext, useState, useEffect } from 'react';

const ChildContext = createContext();

export const useChild = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
};

export const ChildProvider = ({ children }) => {
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('childToken'));
  const [authChecked, setAuthChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if child token is valid on app load
  useEffect(() => {
    if (authChecked) return; // Prevent multiple auth checks
    
    const checkChildAuth = async () => {
      const storedToken = localStorage.getItem('childToken');
      const childData = localStorage.getItem('childData');
      
      console.log('🔍 Checking child authentication...', { 
        hasToken: !!storedToken, 
        hasChildData: !!childData,
        tokenLength: storedToken?.length 
      });
      
      // If no token, immediately set loading to false and return
      if (!storedToken || storedToken.trim() === '') {
        console.log('❌ No token found, clearing auth state');
        setToken(null);
        setChild(null);
        setLoading(false);
        setAuthChecked(true);
        return;
      }

      // If we have cached child data, use it first to avoid unnecessary API calls
      if (childData) {
        try {
          const parsedChild = JSON.parse(childData);
          setChild(parsedChild);
          setToken(storedToken);
          console.log('✅ Using cached child data');
        } catch (error) {
          console.error('Error parsing cached child data:', error);
          localStorage.removeItem('childData');
        }
      }

      // Only make API call if we have a valid token
      if (storedToken && storedToken.length > 0) {
        try {
          console.log('🔐 Validating token with server...');
          // First try to validate the token
          const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
          const validateResponse = await fetch(`${baseUrl}/api/child/validate-token`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
        
          console.log('🔐 Token validation response:', validateResponse.status);
          
          if (validateResponse.ok) {
            console.log('✅ Token is valid, fetching profile...');
            // Token is valid, now get the profile
            const profileResponse = await fetch(`${baseUrl}/api/child/profile`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (profileResponse.ok) {
              const data = await profileResponse.json();
              setChild(data.data.child);
              setToken(storedToken);
              localStorage.setItem('childData', JSON.stringify(data.data.child));
              console.log('✅ Child authentication validated and profile fetched');
            } else if (profileResponse.status === 401) {
              // Profile fetch failed with 401, token is invalid
              console.log('❌ Child profile fetch failed with 401, clearing auth data');
              localStorage.removeItem('childToken');
              localStorage.removeItem('childData');
              setToken(null);
              setChild(null);
            } else {
              console.warn('Failed to fetch child profile:', profileResponse.status);
              // Keep using cached data if available
              if (childData) {
                setChild(JSON.parse(childData));
                setToken(storedToken);
                console.log('Using cached child data due to profile fetch error');
              }
            }
          } else if (validateResponse.status === 401) {
            console.log('❌ Child token is invalid, clearing auth data');
            localStorage.removeItem('childToken');
            localStorage.removeItem('childData');
            setToken(null);
            setChild(null);
          } else if (validateResponse.status === 500) {
            console.warn('Server error during token validation, using cached data if available');
            // Use cached data if server is having issues
            if (childData) {
              setChild(JSON.parse(childData));
              setToken(storedToken);
              console.log('Using cached child data due to server error');
            } else {
              setToken(null);
              setChild(null);
            }
          } else {
            console.warn('Failed to validate child token:', validateResponse.status);
            // Use cached data if server is unavailable
            if (childData) {
              setChild(JSON.parse(childData));
              setToken(storedToken);
              console.log('Using cached child data due to server error');
            } else {
              setToken(null);
              setChild(null);
            }
          }
        } catch (error) {
          console.error('Child auth check error:', error);
          // Use cached data if available, otherwise clear auth
          if (childData) {
            setChild(JSON.parse(childData));
            setToken(storedToken);
            console.log('Using cached child data due to network error');
          } else {
            localStorage.removeItem('childToken');
            localStorage.removeItem('childData');
            setToken(null);
            setChild(null);
          }
        }
      }
      setLoading(false);
      setAuthChecked(true);
    };

    checkChildAuth();
  }, [authChecked]); // Only run when authChecked changes

  const childLogin = async (loginCode) => {
    try {
      console.log('🔐 Attempting child login with code:', loginCode);
      const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/child/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loginCode: loginCode.trim().toUpperCase() })
      });

      const data = await response.json();
      console.log('🔐 Login response:', data);

      if (data.success) {
        console.log('✅ Child login successful');
        setChild(data.data.child);
        setToken(data.data.token);
        localStorage.setItem('childToken', data.data.token);
        localStorage.setItem('childData', JSON.stringify(data.data.child));
        setAuthChecked(true);
        return { success: true };
      } else {
        console.log('❌ Child login failed:', data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Child login error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const childLogout = () => {
    console.log('🚪 Child logout - clearing all auth data');
    setChild(null);
    setToken(null);
    setAuthChecked(false);
    localStorage.removeItem('childToken');
    localStorage.removeItem('childData');
  };

  const updateChildProfile = (updatedChild) => {
    setChild(updatedChild);
    localStorage.setItem('childData', JSON.stringify(updatedChild));
  };

  // Function to refresh token by re-logging in
  const refreshToken = async () => {
    try {
      const childData = localStorage.getItem('childData');
      if (childData) {
        const child = JSON.parse(childData);
        // Try to re-login using the stored child data
        // This is a fallback - in a real app, you'd have a refresh token endpoint
        console.log('Attempting to refresh token for child:', child.name);
        // For now, we'll just clear the auth data and require re-login
        childLogout();
        return false;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      childLogout();
      return false;
    }
  };

  // Function to handle authentication errors and redirects
  const handleAuthError = (error, context = 'unknown') => {
    console.error(`❌ Authentication error in ${context}:`, error);
    
    // Clear all authentication data
    localStorage.removeItem('childToken');
    localStorage.removeItem('childData');
    setToken(null);
    setChild(null);
    setAuthChecked(false);
    
    // Set redirect flag instead of using window.location.href
    if (window.location.pathname !== '/child-login') {
      console.log('🔄 Setting redirect flag for child login page');
      setShouldRedirect(true);
    }
  };

  // Enhanced API call wrapper that handles 401 errors automatically
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('childToken');
    
    if (!token) {
      console.log('❌ No token available for authenticated request');
      handleAuthError('No token available', 'makeAuthenticatedRequest');
      return null;
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (response.status === 401) {
        console.log('❌ 401 Unauthorized - token is invalid');
        handleAuthError('Token is invalid', 'makeAuthenticatedRequest');
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      return null;
    }
  };

  // Handle redirect when shouldRedirect is true
  useEffect(() => {
    if (shouldRedirect) {
      setShouldRedirect(false);
      window.location.href = '/child-login';
    }
  }, [shouldRedirect]);

  const value = {
    child,
    token,
    childLogin,
    childLogout,
    updateChildProfile,
    refreshToken,
    loading,
    authChecked,
    handleAuthError,
    makeAuthenticatedRequest,
    shouldRedirect
  };

  return (
    <ChildContext.Provider value={value}>
      {children}
    </ChildContext.Provider>
  );
};
