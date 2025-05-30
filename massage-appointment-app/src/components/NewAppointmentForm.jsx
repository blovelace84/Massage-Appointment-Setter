// src/components/NewAppointmentForm.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import { generateAvailableSlots, filterBookedSlots, SERVICE_DURATIONS } from '../utils/availability';
import TherapistSelector from './TherapistSelector'; // NEW: Import TherapistSelector

function NewAppointmentForm({ onAppointmentAdded }) {
  const { currentUser } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [error, setError] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // NEW: State for therapist selection
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const [allTherapists, setAllTherapists] = useState([]); // To store all loaded therapists

  // Function to fetch all appointments to check for conflicts (modified for therapist)
  useEffect(() => {
    const fetchAllAppointments = async () => {
      setLoadingSlots(true);
      const allAppointments = [];
      try {
        const q = collection(db, "appointments");
        const querySnapshot = await getDocs(q); // Fetch all appointments
        querySnapshot.forEach(doc => allAppointments.push({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.error("Error fetching all appointments for availability: ", e);
        setError("Failed to load availability. Please try again.");
      } finally {
        setLoadingSlots(false);
      }

      // Generate and filter slots whenever date, service, or therapist changes
      const duration = SERVICE_DURATIONS[selectedService];
      if (selectedService && duration) {
        const generated = generateAvailableSlots(selectedDate, duration, selectedTherapistId); // Pass therapistId
        const filtered = filterBookedSlots(generated, allAppointments, duration, null, selectedTherapistId); // Pass therapistId
        setAvailableTimeSlots(filtered);
        if (!filtered.some(slot => slot.format('HH:mm') === selectedTime)) {
          setSelectedTime('');
        }
      } else {
        setAvailableTimeSlots([]);
        setSelectedTime('');
      }
    };

    fetchAllAppointments();
  }, [selectedDate, selectedService, selectedTherapistId]); // NEW: Add selectedTherapistId to dependencies

  const addAppointment = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be logged in to book an appointment.');
      return;
    }
    if (!selectedService || !selectedDate || !selectedTime || !selectedTherapistId) { // Check selectedTherapistId
      setError('Please select a service, date, time, and therapist.');
      return;
    }

    const finalDateTime = moment(selectedDate).format('YYYY-MM-DD') + 'T' + selectedTime;

    try {
      const docRef = await addDoc(collection(db, "appointments"), {
        service: selectedService,
        dateTime: finalDateTime,
        userId: currentUser.uid,
        clientEmail: currentUser.email,
        bookedAt: new Date().toISOString(),
        therapistId: selectedTherapistId, // NEW: Store the selected therapist ID
      });
      console.log("Document written with ID: ", docRef.id);
      setSelectedService('');
      setSelectedDate(new Date());
      setSelectedTime('');
      setSelectedTherapistId(''); // Reset therapist selection
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

        {/* NEW: Therapist Selector */}
        <TherapistSelector
          selectedTherapistId={selectedTherapistId}
          onSelectTherapist={setSelectedTherapistId}
          onTherapistsLoaded={setAllTherapists} // Get all therapists if needed for complex logic
          disabled={loadingSlots}
        />

        <div>
          <label htmlFor="service">Select Service:</label>
          <select
            id="service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            required
            disabled={loadingSlots}
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
            minDate={new Date()}
            dateFormat="yyyy/MM/dd"
            required
            className="date-picker-input"
            disabled={loadingSlots}
          />
        </div>
        <div>
          <label htmlFor="timeSlot">Select Time Slot:</label>
          {loadingSlots ? (
            <p>Loading available slots...</p>
          ) : availableTimeSlots.length === 0 && selectedService ? (
            <p>No available slots for {selectedService} on {moment(selectedDate).format('YYYY-MM-DD')}{selectedTherapistId ? ` with ${allTherapists.find(t => t.id === selectedTherapistId)?.name}` : ''}.</p>
          ) : (
            <select
              id="timeSlot"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required={selectedService !== '' && selectedTherapistId !== ''}
              disabled={!selectedService || !selectedTherapistId || availableTimeSlots.length === 0 || loadingSlots}
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
        <button type="submit" disabled={loadingSlots || !selectedTime || !selectedService || !selectedTherapistId}>Book Appointment</button>
      </form>
    </section>
  );
}

export default NewAppointmentForm;