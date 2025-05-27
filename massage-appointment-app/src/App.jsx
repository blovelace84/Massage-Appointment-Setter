// src/App.jsx
import React, { useState } from 'react'; // Removed useEffect for appointments here
import './App.css';
import { useAuth } from './AuthContext';
import AuthForms from './AuthForms';
import NewAppointmentForm from './components/NewAppointmentForm'; // NEW: Import NewAppointmentForm
import AppointmentList from './components/AppointmentList';     // NEW: Import AppointmentList

function App() {
  const { currentUser, loading } = useAuth();
  // State to trigger re-fetching appointments after a new one is added
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  // Callback to be passed to NewAppointmentForm
  const handleAppointmentAdded = () => {
    setRefreshAppointments(prev => prev + 1); // Increment to trigger AppointmentList refresh
  };

  if (loading) {
    return <div className="App">Loading authentication...</div>;
  }

  return (
    <div className="App">
      <h1>Massage Appointment Setter</h1>

      <AuthForms />

      {/* Conditionally render appointment sections based on login status */}
      {currentUser ? (
        <>
          <NewAppointmentForm onAppointmentAdded={handleAppointmentAdded} />
          <AppointmentList refreshTrigger={refreshAppointments} />
        </>
      ) : (
        <p>Please log in or sign up to schedule and view your appointments.</p>
      )}
    </div>
  );
}

export default App;