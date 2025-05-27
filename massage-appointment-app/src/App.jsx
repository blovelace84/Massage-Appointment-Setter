// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Import your Firestore instance
import { collection, addDoc, getDocs } from 'firebase/firestore';
import './App.css'; // For basic styling

function App() {
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [clientName, setClientName] = useState('');

  // Function to fetch appointments from Firestore
  const fetchAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    const fetchedAppointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAppointments(fetchedAppointments);
  };

  // Function to add a new appointment to Firestore
  const addAppointment = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!selectedService || !selectedDateTime || !clientName) {
      alert('Please fill in all fields!');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        service: selectedService,
        dateTime: selectedDateTime,
        clientName: clientName,
        bookedAt: new Date().toISOString(), // Use ISO string for consistent date storage
      });
      console.log("Document written with ID: ", docRef.id);
      // Refresh the list after adding
      fetchAppointments();
      // Clear form fields
      setSelectedService('');
      setSelectedDateTime('');
      setClientName('');
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="App">
      <h1>Massage Appointment Setter</h1>

      <section className="appointment-form">
        <h2>Schedule a New Appointment</h2>
        <form onSubmit={addAppointment}>
          <div>
            <label htmlFor="clientName">Your Name:</label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
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
              type="datetime-local" // This input type provides a date and time picker
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
        <h2>Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments scheduled yet.</p>
        ) : (
          <ul>
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <strong>{appointment.clientName}</strong> - {appointment.service} on {new Date(appointment.dateTime).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;