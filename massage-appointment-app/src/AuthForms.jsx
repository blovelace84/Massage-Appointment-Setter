// src/AuthForms.jsx
import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth } from './AuthContext'; // To get currentUser and access sign out
import './AuthForms.css'; // Import your CSS for styling

function AuthForms() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // Get current user from context

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created successfully! You are now logged in.');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error("Sign Up Error:", err);
      setError(err.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error("Sign In Error:", err);
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    setError(''); // Clear previous errors
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      console.error("Sign Out Error:", err);
      setError(err.message);
    }
  };

  if (currentUser) {
    return (
      <div className="auth-status">
        <p>Logged in as: <strong>{currentUser.email}</strong></p>
        <button onClick={handleSignOut}>Log Out</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>Sign Up / Log In</h2>
      <form onSubmit={handleSignIn}> {/* Default to sign in */}
        {error && <p className="error-message">{error}</p>}
        <div>
          <label htmlFor="auth-email">Email:</label>
          <input
            type="email"
            id="auth-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="auth-password">Password:</label>
          <input
            type="password"
            id="auth-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log In</button>
        <button type="button" onClick={handleSignUp} style={{ marginLeft: '10px' }}>Sign Up</button>
      </form>
    </div>
  );
}

export default AuthForms;