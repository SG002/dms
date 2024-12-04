import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import AdminDashboard from './pages/admin/adminDashboard';
import AddDoctor from './pages/admin/addDoctor';
import AddSession from './pages/admin/addSession';
import Appointments from './pages/admin/appointment';
import Inventory from './pages/admin/inventory';
import PatientDashboard from './pages/patient/dash';
import AllDoctors from './pages/patient/allDoc';
import ScheduleSessions from './pages/patient/scheduleSessions';
import MyBookings from './pages/patient/myBooking';
import MyAppointments from './pages/doctor/myApp';
import MyPatients from './pages/doctor/myPat';
import Analytics from './pages/admin/analytics';
import PatientInventory from './pages/patient/inventoryPat';

function App() {
  return (
    <Router>
      <div>
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/add-doctor" element={<AddDoctor />} />
          <Route path="/admin/add-session" element={<AddSession />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          {/*Patient Routes*/}
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/doctors" element={<AllDoctors />} />
          <Route path="/patient/schedule-sessions" element={<ScheduleSessions />} />
          <Route path="/patient/my-bookings" element={<MyBookings />} />
          <Route path="/patient/inventory" element={<PatientInventory />} />
          {/* Doctor Routes */}
          <Route path="/doctor/appointments" element={<MyAppointments />} />
          <Route path="/doctor/patients" element={<MyPatients />} />

          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
