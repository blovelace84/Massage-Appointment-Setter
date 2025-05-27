// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'; // NEW: query, where for filtering
import './App.css';
import { useAuth } from './AuthContext'; // NEW: Import useAuth hook
import AuthForms from './AuthForms'; // NEW: Import AuthForms component

function App() {
  const { currentUser, loading } = useAuth(); // Get auth state
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  // clientName will now be derived from currentUser.email for authenticated users
  // You might still keep a separate clientName state if you want to allow guests or
  // if the client's name isn't always their email. For now, let's link it.

  // Function to fetch appointments from Firestore
  const fetchAppointments = async () => {
    if (!currentUser) { // Don't fetch if not logged in
      setAppointments([]);
      return;
    }

    // NEW: Filter appointments by the current user's UID
    const q = query(
      collection(db, "appointments"),
      where("userId", "==", currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const fetchedAppointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAppointments(fetchedAppointments);
  };

  // Function to add a new appointment to Firestore
  const addAppointment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please log in to book an appointment!');
      return;
    }
    if (!selectedService || !selectedDateTime) { // Removed clientName check here
      alert('Please select a service and date/time!');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        service: selectedService,
        dateTime: selectedDateTime,
        // NEW: Store user ID and email with the appointment
        userId: currentUser.uid,
        clientEmail: currentUser.email, // Storing email for display/admin
        bookedAt: new Date().toISOString(),
      });
      console.log("Document written with ID: ", docRef.id);
      fetchAppointments(); // Refresh the list after adding
      setSelectedService('');
      setSelectedDateTime('');
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error booking appointment: " + e.message);
    }
  };

  // Fetch appointments whenever currentUser changes
  useEffect(() => {
    if (!loading) { // Ensure authentication state is determined
      fetchAppointments();
    }
  }, [currentUser, loading]); // Depend on currentUser and loading state

  if (loading) {
    return <div className="App">Loading authentication...</div>;
  }

  return (
    <div className="App">
      <h1>Massage Appointment Setter</h1>

      <AuthForms /> {/* Render the authentication forms */}

      {/* Conditionally render appointment sections based on login status */}
      {currentUser ? (
        <>
          <section className="appointment-form">
            <h2>Schedule a New Appointment</h2>
            <form onSubmit={addAppointment}>
              {/* Removed clientName input as it's now tied to logged-in user */}
              <div>
                <label htmlFor="service">Select Service:</label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Service --</option>
                  <option value="Swedish Massage">Swedish Massage (60 min)</option>
                  <option value="Deep Tissue Massage">Deep Tissue Massage (90 min)</option>
                  <option value="Hot Stone Therapy">Hot Stone Therapy (75 min)</option>
                  <option value="Aromatherapy Massage">Aromatherapy Massage (60 min)</option>
                </select>
              </div>
              <div>
                <label htmlFor="dateTime">Date and Time:</label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  value={selectedDateTime}
                  onChange={(e) => setSelectedDateTime(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Book Appointment</button>
            </form>
          </section>

          <section className="appointment-list">
            <h2>Your Upcoming Appointments</h2>
            {appointments.length === 0 ? (
              <p>You have no appointments scheduled yet.</p>
            ) : (
              <ul>
                {appointments.map((appointment) => (
                  <li key={appointment.id}>
                    <strong>{appointment.clientEmail}</strong> - {appointment.service} on {new Date(appointment.dateTime).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <p>Please log in or sign up to schedule and view your appointments.</p>
      )}
    </div>
  );
}

export default App;