// src/components/AppointmentList.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Adjust path
import { collection, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore'; // orderBy for sorting
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

  //Function to handle appointments cancelation
  const handleCancel = async (appointmentId, clientEmail, service, dateTime) => {
    if(window.confirm(`Are you sure you want to cancel the ${service} appointment for ${clientEmail} on ${new Date(dateTime). toLocaleString()}? `)){
      try{
        await deleteDoc(doc(db, "appointments", appointmentId));
        alert('Appointment canceled successfully.');
        fetchAppointments();
      }catch(e) {
        console.error("Error canceling appointment: ", e);
        alert("Failed to cancel appointment: " + e.message);
        setError("Failed to cancel appointment: " + e.message);
      }
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
            <div>
              <strong>{appointment.clientEmail}</strong> - {appointment.service} on {new Date(appointment.dateTime).toLocaleString()}
            </div>
            <button 
              className='cancel-button'
              onClick={() => handleCancel(
                appointment.id,
                appointment.clientEmail,
                appointment.service,
                appointment.dateTime
              )}>
                Cancel Appointment
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AppointmentList;