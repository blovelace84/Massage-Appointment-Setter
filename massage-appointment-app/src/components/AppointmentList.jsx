// src/components/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import RescheduleForm from './RescheduleForm'; // NEW: Import RescheduleForm
import './AppointmentList.css'; // NEW: Import CSS for styling

function AppointmentList({ refreshTrigger }) {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null); // NEW: State to hold appointment being edited

  const fetchAppointments = async () => {
    if (!currentUser) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser.uid),
        orderBy("dateTime", "asc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(fetchedAppointments);
    } catch (e) {
      console.error("Error fetching appointments: ", e);
      setError("Failed to load appointments: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId, clientEmail, service, dateTime) => {
    if (window.confirm(`Are you sure you want to cancel the ${service} appointment for ${clientEmail} on ${new Date(dateTime).toLocaleString()}?`)) {
      try {
        await deleteDoc(doc(db, "appointments", appointmentId));
        alert('Appointment cancelled successfully!');
        fetchAppointments(); // Refresh the list after cancellation
      } catch (e) {
        console.error("Error cancelling appointment: ", e);
        alert("Failed to cancel appointment: " + e.message);
        setError("Failed to cancel appointment: " + e.message);
      }
    }
  };

  // NEW: Function to initiate reschedule
  const handleRescheduleClick = (appointment) => {
    setEditingAppointment(appointment); // Set the appointment object to be edited
  };

  // NEW: Callback for when rescheduling is complete (or cancelled)
  const handleRescheduleComplete = () => {
    setEditingAppointment(null); // Clear editing state
    fetchAppointments(); // Refresh the list
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentUser, refreshTrigger]);

  if (!currentUser) {
    return <p>Log in to view your appointments.</p>;
  }

  if (loading) {
    return <p>Loading your appointments...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <section className="appointment-list">
      <h2>Your Upcoming Appointments</h2>
      {editingAppointment ? ( // Conditionally render RescheduleForm
        <RescheduleForm
          appointment={editingAppointment}
          onRescheduleComplete={handleRescheduleComplete}
        />
      ) : appointments.length === 0 ? (
        <p>You have no appointments scheduled yet.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <div>
                <strong>{appointment.clientEmail}</strong> - {appointment.service} on {new Date(appointment.dateTime).toLocaleString()}
              </div>
              <div className="appointment-actions"> {/* NEW: Container for buttons */}
                <button
                  className="reschedule-button" // Add a class for styling
                  onClick={() => handleRescheduleClick(appointment)}
                >
                  Reschedule
                </button>
                <button
                  className="cancel-button"
                  onClick={() => handleCancel(
                    appointment.id,
                    appointment.clientEmail,
                    appointment.service,
                    appointment.dateTime
                  )}
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AppointmentList;