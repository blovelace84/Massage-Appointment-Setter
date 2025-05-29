// src/components/NewAppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import DatePicker from 'react-datepicker'; // NEW
import 'react-datepicker/dist/react-datepicker.css'; // NEW: Import styles
import moment from 'moment'; // NEW
import { generateAvailableSlots, filterBookedSlots, SERVICE_DURATIONS } from '../utils/availability'; // NEW

function NewAppointmentForm({ onAppointmentAdded }) {
  const { currentUser } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // NEW: Date object for date picker
  const [selectedTime, setSelectedTime] = useState(''); // NEW: String for selected time slot
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // NEW
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false); // NEW

  // Fetch all appointments to check for conflicts
  useEffect(() => {
    const fetchAllAppointments = async () => {
      setLoadingSlots(true);
      const allAppointments = [];
      try {
        // Fetch ALL appointments, not just user's, to check for global conflicts
        const querySnapshot = await getDocs(collection(db, "appointments"));
        querySnapshot.forEach(doc => allAppointments.push({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error("Error fetching all appointments for availability: ", e);
        setError("Failed to load availability. Please try again.");
      } finally {
        setLoadingSlots(false);
      }

      // Generate and filter slots whenever selectedDate or selectedService changes
      const duration = SERVICE_DURATIONS[selectedService];
      if (selectedService && duration) {
        const generated = generateAvailableSlots(selectedDate, duration);
        const filtered = filterBookedSlots(generated, allAppointments, duration);
        setAvailableTimeSlots(filtered);
        // Clear selected time if it's no longer available
        if (!filtered.some(slot => slot.format('HH:mm') === selectedTime)) {
          setSelectedTime('');
        }
      } else {
        setAvailableTimeSlots([]);
        setSelectedTime('');
      }
    };

    fetchAllAppointments();
  }, [selectedDate, selectedService]); // Re-run when date or service changes

  const addAppointment = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to book an appointment.');
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime) { // Check selectedTime
      setError('Please select a service, date, and time.');
      return;
    }

    const finalDateTime = moment(selectedDate).format('YYYY-MM-DD') + 'T' + selectedTime;

    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        service: selectedService,
        dateTime: finalDateTime, // Use the combined date and time
        userId: currentUser.uid,
        clientEmail: currentUser.email,
        bookedAt: new Date().toISOString(),
      });
      console.log("Document written with ID: ", docRef.id);
      setSelectedService('');
      setSelectedDate(new Date()); // Reset date
      setSelectedTime(''); // Reset time
      // The useEffect will re-filter slots
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
            {Object.keys(SERVICE_DURATIONS).map(serviceName => (
              <option key={serviceName} value={serviceName}>{serviceName} ({SERVICE_DURATIONS[serviceName]} min)</option>
            ))}
          </select>
        </div>
        <div>
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()} // Prevent selecting past dates
            dateFormat="yyyy/MM/dd"
            required
            className="date-picker-input" // Add a class for custom styling if needed
          />
        </div>
        <div>
          <label htmlFor="timeSlot">Select Time Slot:</label>
          {loadingSlots ? (
            <p>Loading available slots...</p>
          ) : availableTimeSlots.length === 0 && selectedService ? (
            <p>No available slots for {selectedService} on {moment(selectedDate).format('YYYY-MM-DD')}.</p>
          ) : (
            <select
              id="timeSlot"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required={selectedService !== ''} // Only required if service is selected
              disabled={!selectedService || availableTimeSlots.length === 0}
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
        <button type="submit" disabled={loadingSlots || !selectedTime}>Book Appointment</button>
      </form>
    </section>
  );
}

export default NewAppointmentForm;