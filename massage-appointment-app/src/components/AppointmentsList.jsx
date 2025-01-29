import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      let { data, error } = await supabase.from("appointments").select("*");
      if (!error) setAppointments(data);
    };
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2>Appointments</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            Appointment ID: {appointment.id}, Therapist: {appointment.therapist_id}, Date: {new Date(appointment.appointment_date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentList;
