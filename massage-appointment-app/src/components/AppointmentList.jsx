// src/components/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import RescheduleForm from './RescheduleForm';
import { SERVICE_DURATIONS } from '../utils/availability'; // Import for consistency
import './AppointmentList.css'; // Import your CSS for styling

function AppointmentList({ refreshTrigger }) {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [therapistNames, setTherapistNames] = useState({}); // NEW: State to store therapist names by ID

  // Fetch therapists names once
  useEffect(() => {
    const fetchTherapistNames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "therapists"));
        const namesMap = {};
        querySnapshot.forEach(doc => {
          namesMap[doc.id] = doc.data().name;
        });
        setTherapistNames(namesMap);
      } catch (e) {
        console.error("Error fetching therapist names: ", e);
        setError("Failed to load therapist names.");
      }
    };
    fetchTherapistNames();
  }, []); // Run once on mount

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
    // ... (no change to this function, it uses appointmentId directly)
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


  const handleRescheduleClick = (appointment) => {
    setEditingAppointment(appointment);
  };

  const handleRescheduleComplete = () => {
    setEditingAppointment(null);
    fetchAppointments();
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
      {editingAppointment ? (
        <RescheduleForm
          appointment={editingAppointment}
          onRescheduleComplete={handleRescheduleComplete}
        />
      ) : appointments.length === 0 ? (
        <p>You have no appointments scheduled yet.</p>
      ) : (
        <ul>
          {appointments.map((appointment) => {
            const therapistName = therapistNames[appointment.therapistId] || 'Unknown Therapist'; // Get name
            return (
              <li key={appointment.id}>
                <div>
                  <strong>{appointment.clientEmail}</strong> - {appointment.service} with <strong>{therapistName}</strong> on {new Date(appointment.dateTime).toLocaleString()}
                </div>
                <div className="appointment-actions">
                  <button
                    className="reschedule-button"
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
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default AppointmentList;