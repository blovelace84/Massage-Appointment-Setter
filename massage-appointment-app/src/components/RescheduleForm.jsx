// src/components/RescheduleForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Adjust path
import { doc, updateDoc } from 'firebase/firestore'; // NEW: updateDoc
import { useAuth } from '../AuthContext'; // Adjust path

function RescheduleForm({ appointment, onRescheduleComplete }) {
  const { currentUser } = useAuth();
  // Initialize state with current appointment's dateTime
  const [newDateTime, setNewDateTime] = useState(appointment.dateTime);
  // Optionally, allow changing service during reschedule (complex, skipping for now)
  // const [newService, setNewService] = useState(appointment.service);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to reschedule an appointment.');
      setLoading(false);
      return;
    }
    if (!newDateTime) {
      setError('Please select a new date and time.');
      setLoading(false);
      return;
    }

    try {
      const appointmentRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentRef, {
        dateTime: newDateTime,
        // If you wanted to allow service change:
        // service: newService,
        rescheduledAt: new Date().toISOString(), // Optional: log when it was rescheduled
      });
      alert('Appointment rescheduled successfully!');
      onRescheduleComplete(); // Notify parent to refresh list and close form
    } catch (e) {
      console.error("Error rescheduling appointment: ", e);
      setError("Failed to reschedule appointment: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="appointment-form"> {/* Re-using form styling */}
      <h2>Reschedule Appointment</h2>
      {error && <p className="error-message">{error}</p>}
      <p>Original appointment: <strong>{appointment.service}</strong> on {new Date(appointment.dateTime).toLocaleString()}</p>
      <form onSubmit={handleRescheduleSubmit}>
        <div>
          <label htmlFor="newDateTime">Select New Date and Time:</label>
          <input
            type="datetime-local"
            id="newDateTime"
            value={newDateTime}
            onChange={(e) => setNewDateTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
        <button
          type="button"
          onClick={onRescheduleComplete} // Cancel button, just closes the form
          disabled={loading}
          style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
        >
          Cancel
        </button>
      </form>
    </section>
  );
}

export default RescheduleForm;