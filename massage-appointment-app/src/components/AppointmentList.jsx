// src/components/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Adjust path
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'; // orderBy for sorting
import { useAuth } from '../AuthContext'; // Adjust path

function AppointmentList({ refreshTrigger }) {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = async () => {
    if (!currentUser) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Filter appointments by the current user's UID and order by dateTime
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", currentUser.uid),
        orderBy("dateTime", "asc") // Order by date and time
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

  // Fetch appointments whenever currentUser or refreshTrigger changes
  useEffect(() => {
    fetchAppointments();
  }, [currentUser, refreshTrigger]); // Added refreshTrigger to re-fetch when new appointment is added

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
  );
}

export default AppointmentList;