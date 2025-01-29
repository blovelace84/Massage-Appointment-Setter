import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/book">Book Appointment</Link></li>
        <li><Link to="/appointments">View Appointments</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
