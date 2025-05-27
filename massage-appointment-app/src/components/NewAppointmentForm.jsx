// src/components/NewAppointmentForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Adjust path if components folder is deeper
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext'; // Adjust path

function NewAppointmentForm({ onAppointmentAdded }) {
  const { currentUser } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [error, setError] = useState('');

  const addAppointment = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!currentUser) {
      setError('You must be logged in to book an appointment.');
      return;
    }
    if (!selectedService || !selectedDateTime) {
      setError('Please select a service and date/time.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        service: selectedService,
        dateTime: selectedDateTime,
        userId: currentUser.uid,
        clientEmail: currentUser.email,
        bookedAt: new Date().toISOString(),
      });
      console.log("Document written with ID: ", docRef.id);
      setSelectedService('');
      setSelectedDateTime('');
      // Notify parent component (App.jsx) that an appointment was added
      if (onAppointmentAdded) {
        onAppointmentAdded();
      }
      alert('Appointment booked successfully!');
    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Error booking appointment: " + e.message);
    }
  };

  return (
    <section className="appointment-form">
      <h2>Schedule a New Appointment</h2>
      <form onSubmit={addAppointment}>
        {error && <p className="error-message">{error}</p>}
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
  );
}

export default NewAppointmentForm;