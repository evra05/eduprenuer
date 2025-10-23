import React from 'react';
import { Navigate } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedChildRoute = ({ children }) => {
  const { child, loading } = useChild();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!child) {
    return <Navigate to="/child-login" replace />;
  }

  return children;
};

export default ProtectedChildRoute;
