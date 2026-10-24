import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listener untuk mengecek status login user dari Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Selesai loading setelah status login dipastikan
    }, (error) => {
      console.error("Firebase auth error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fungsi Login
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = email => sendPasswordResetEmail(auth, email);

  // Fungsi Logout
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
