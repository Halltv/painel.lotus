import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Compara as permissões ignorando letras maiúsculas/minúsculas
  if (allowedRoles && user.role) {
    const userRole = String(user.role).toUpperCase();
    const hasRole = allowedRoles.some(r => r.toUpperCase() === userRole);
    
    if (!hasRole) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
}