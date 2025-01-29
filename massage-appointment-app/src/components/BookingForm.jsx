import { useState } from 'react';
import { supabase } from '../supabaseClient';

const BookingForm = () => {
    const [ clientName, setClientName ] = useState('');
    const [ therapistId, setTherapistId ] = useState('');
    const [ appointmentDate, setAppointmentDate ] = useState('');

    const handleBooking = async () => {
        const { data, error } = await supabase
            .from("appointments")
            .insert([{ client_id: 1, therapist_id: therapistId, appointment_date: appointmentDate }]);

        if(error) {
            console.error(error);
        }else{
            alert("Appointment booked successfully!");
        }
    };

    return(
        <div>
            <h2>Book an Appointment</h2>
            <input
        type="text"
        placeholder="Client Name"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Therapist ID"
        value={therapistId}
        onChange={(e) => setTherapistId(e.target.value)}
      />
      <input
        type="datetime-local"
        value={appointmentDate}
        onChange={(e) => setAppointmentDate(e.target.value)}
      />
      <button onClick={handleBooking}>Book Appointment</button>
    </div>
    );
};

export default BookingForm;