import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Jika tidak ada user yang terautentikasi, tendang kembali ke halaman login admin
  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Jika terautentikasi (admin login), izinkan akses render komponen anak
  return children;
};

export default ProtectedRoute;
