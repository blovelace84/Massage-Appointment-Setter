// src/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener observes changes to the user's sign-in state.
    // It gets called immediately after the listener is registered,
    // and whenever the user's sign-in state changes.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading // Expose loading state so components can wait for auth to initialize
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children when the authentication state has been determined */}
      {!loading && children}
    </AuthContext.Provider>
  );
};