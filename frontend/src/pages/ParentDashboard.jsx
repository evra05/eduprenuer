import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPlus, FiLogOut, FiCreditCard } from 'react-icons/fi';
import AddChildForm from '../components/parent/AddChildForm';
import ChildProfile from '../components/parent/ChildProfile';
import SubscriptionManagement from '../components/parent/SubscriptionManagement';
import ProgressOverview from '../components/parent/ProgressOverview';
import EditChildForm from '../components/parent/EditChildForm';
import DetailedProgressReport from '../components/parent/DetailedProgressReport';

const ParentDashboard = () => {
  const { user, logout, token } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [showProgressReport, setShowProgressReport] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchChildren = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data.data.children);
      } else {
        setError('Failed to load children');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleAddChild = async (childData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', childData.name);
      formData.append('age', childData.age);
      formData.append('gender', childData.gender);
      
      if (childData.profilePicture) {
        formData.append('profilePicture', childData.profilePicture);
      }

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/children`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setChildren([data.data.child, ...children]);
        setError('');
        setSuccess('Child added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add child');
        throw new Error(errorData.message || 'Failed to add child');
      }
    } catch (err) {
      setError(err.message || 'Network error');
      throw err;
    }
  };

  const handleDeleteChild = async (childId) => {
    if (!window.confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/children/${childId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setChildren(children.filter(child => child._id !== childId));
        setError('');
        setSuccess('Child deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete child');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleRegenerateCode = async (childId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/children/${childId}/regenerate-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(children.map(child => 
          child._id === childId 
            ? { ...child, loginCode: data.data.loginCode }
            : child
        ));
        setError('');
        setSuccess('Login code regenerated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to regenerate code');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleEditChild = (child) => {
    setEditingChild(child);
    setShowEditForm(true);
  };

  const handleUpdateChild = (updatedChild) => {
    setChildren(children.map(child => 
      child._id === updatedChild._id ? updatedChild : child
    ));
    setError('');
    setSuccess('Child profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleViewProgress = (childId) => {
    setSelectedChildId(childId);
    setShowProgressReport(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">EduPreneur</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName}</span>
              <button
                onClick={logout}
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Parent Dashboard</h2>
          <p className="text-gray-600">Manage your children's learning journey</p>
        </div>

        {/* Plan Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Plan Type</p>
              <p className="text-xl font-semibold text-primary-600 capitalize">
                {user?.planType} Plan
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {user?.subscriptionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Children Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Children</h3>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Child
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading children...</p>
            </div>
          ) : children.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-gray-400 text-2xl" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No children added yet</h4>
              <p className="text-gray-600 mb-6">
                Add your first child to start their entrepreneurial learning journey
              </p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Your First Child
              </button>
            </div>
          ) : (
            /* Children List */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildProfile
                  key={child._id}
                  child={child}
                  onEdit={handleEditChild}
                  onDelete={handleDeleteChild}
                  onRegenerateCode={handleRegenerateCode}
                  onViewProgress={handleViewProgress}
                />
              ))}
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="mt-8">
          <ProgressOverview children={children} />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-primary-600 text-xl" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Manage Children</h4>
                <p className="text-gray-600">Add, edit, or remove child profiles</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <FiCreditCard className="text-secondary-600 text-xl" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Subscription</h4>
                <p className="text-gray-600">Manage your billing and plan</p>
              </div>
            </div>
            <button
              onClick={() => setShowSubscriptionManagement(true)}
              className="mt-4 w-full px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Manage Subscription
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <FiUser className="text-accent-600 text-xl" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-gray-900">Progress Reports</h4>
                <p className="text-gray-600">View detailed learning analytics</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Child Modal */}
      {showAddForm && (
        <AddChildForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddChild}
        />
      )}

      {/* Subscription Management Modal */}
      {showSubscriptionManagement && (
        <SubscriptionManagement
          onClose={() => setShowSubscriptionManagement(false)}
        />
      )}

      {/* Edit Child Modal */}
      {showEditForm && editingChild && (
        <EditChildForm
          child={editingChild}
          onClose={() => {
            setShowEditForm(false);
            setEditingChild(null);
          }}
          onUpdate={handleUpdateChild}
        />
      )}

      {/* Detailed Progress Report Modal */}
      {showProgressReport && selectedChildId && (
        <DetailedProgressReport
          childId={selectedChildId}
          onClose={() => {
            setShowProgressReport(false);
            setSelectedChildId(null);
          }}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
