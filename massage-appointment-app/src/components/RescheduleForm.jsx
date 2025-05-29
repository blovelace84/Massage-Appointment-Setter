// src/components/RescheduleForm.jsx
import React, { useState, useEffect } from 'react'; // NEW: useEffect
import { db } from '../firebaseConfig';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore'; // NEW: getDocs, collection
import { useAuth } from '../AuthContext';
import DatePicker from 'react-datepicker'; // NEW
import 'react-datepicker/dist/react-datepicker.css'; // NEW: Import styles
import moment from 'moment'; // NEW
import { generateAvailableSlots, filterBookedSlots, SERVICE_DURATIONS } from '../utils/availability'; // NEW

function RescheduleForm({ appointment, onRescheduleComplete }) {
  const { currentUser } = useAuth();
  // Initialize date picker with current appointment date
  const [selectedDate, setSelectedDate] = useState(moment(appointment.dateTime).toDate());
  // Initialize time slot with current appointment time
  const [selectedTime, setSelectedTime] = useState(moment(appointment.dateTime).format('HH:mm'));
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false); // NEW

  // Fetch all appointments to check for conflicts (excluding the current one)
  useEffect(() => {
    const fetchAllAppointmentsAndFilterSlots = async () => {
      setLoadingSlots(true);
      const allAppointments = [];
      try {
        const querySnapshot = await getDocs(collection(db, "appointments"));
        querySnapshot.forEach(doc => allAppointments.push({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error("Error fetching all appointments for availability: ", e);
        setError("Failed to load availability. Please try again.");
      } finally {
        setLoadingSlots(false);
      }

      const duration = SERVICE_DURATIONS[appointment.service]; // Use the original service duration
      if (duration) {
        const generated = generateAvailableSlots(selectedDate, duration);
        // Exclude the current appointment from conflict check
        const filtered = filterBookedSlots(generated, allAppointments, duration, appointment.id);
        setAvailableTimeSlots(filtered);
        // Ensure selectedTime is still valid or clear it
        if (!filtered.some(slot => slot.format('HH:mm') === selectedTime)) {
          setSelectedTime('');
        }
      } else {
        setAvailableTimeSlots([]);
        setSelectedTime('');
      }
    };

    fetchAllAppointmentsAndFilterSlots();
  }, [selectedDate, appointment.service, appointment.id]); // Re-run when date or service changes

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to reschedule an appointment.');
      setLoading(false);
      return;
    }
    if (!selectedDate || !selectedTime) {
      setError('Please select a new date and time.');
      setLoading(false);
      return;
    }

    const finalDateTime = moment(selectedDate).format('YYYY-MM-DD') + 'T' + selectedTime;

    try {
      const appointmentRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentRef, {
        dateTime: finalDateTime,
        rescheduledAt: new Date().toISOString(),
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
    <section className="appointment-form">
      <h2>Reschedule Appointment</h2>
      {error && <p className="error-message">{error}</p>}
      <p>Original: <strong>{appointment.service}</strong> on {new Date(appointment.dateTime).toLocaleString()}</p>
      <form onSubmit={handleRescheduleSubmit}>
        <div>
          <label>Select New Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()}
            dateFormat="yyyy/MM/dd"
            required
            className="date-picker-input"
            disabled={loading || loadingSlots}
          />
        </div>
        <div>
          <label htmlFor="newTimeSlot">Select New Time Slot:</label>
          {loadingSlots ? (
            <p>Loading available slots...</p>
          ) : availableTimeSlots.length === 0 ? (
            <p>No available slots for {appointment.service} on {moment(selectedDate).format('YYYY-MM-DD')}.</p>
          ) : (
            <select
              id="newTimeSlot"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
              disabled={loading || availableTimeSlots.length === 0}
            >
              <option value="">-- Choose a Time --</option>
              {availableTimeSlots.map(slot => (
                <option key={slot.format('HH:mm')} value={slot.format('HH:mm')}>
                  {slot.format('hh:mm A')}
                </option>
              ))}
            </select>
          )}
        </div>
        <button type="submit" disabled={loading || loadingSlots || !selectedTime}>
          {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
        <button
          type="button"
          onClick={onRescheduleComplete}
          disabled={loading || loadingSlots}
          style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
        >
          Cancel
        </button>
      </form>
    </section>
  );
}

export default RescheduleForm;