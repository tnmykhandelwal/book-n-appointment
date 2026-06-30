import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // 1. If no token or user object exists, redirect straight to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a role is specified and the logged-in user doesn't match, send them to their own dashboard
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'doctor') {
      return <Navigate to="/doctor-dashboard" replace />;
    } else {
      return <Navigate to="/patient-dashboard" replace />;
    }
  }

  // 3. If everything is verified, render the target dashboard component safely
  return children;
}

export default ProtectedRoute;