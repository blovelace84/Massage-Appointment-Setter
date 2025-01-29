import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BookingForm from "./components/BookingForm";
import AppointmentList from "./components/AppointmentsList";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>welcome to Massage Appointment Setter</h1>} />
        <Route path="/book" element={<BookingForm />} />
        <Route path="/appointments" element={<AppointmentList />} />
      </Routes>
    </Router>
  );
}

export default App;