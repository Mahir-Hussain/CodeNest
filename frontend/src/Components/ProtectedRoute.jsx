// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const userId = parseInt(localStorage.getItem('userId'), 10);

  // If no valid userId, immediately render a <Navigate> which replaces
  // this entry in history with "/login" (or "/")
  if (!userId || isNaN(userId)) {
    alert("You must be logged in to view that page.");
    return <Navigate to="/" replace />;
  }

  // Otherwise render the protected component tree
  return children;
}
