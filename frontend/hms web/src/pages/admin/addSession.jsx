import React, { useState, useEffect } from 'react';
import {
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem,
  ListItemIcon, 
  ListItemText, 
  Button, 
  TextField, 
  Dialog, 
  DialogActions,
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Table,
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  EventNote as EventNoteIcon,
  ExitToApp as ExitToAppIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Add Doctor', icon: <PersonAddIcon />, path: '/admin/add-doctor' },
  { text: 'Add Session', icon: <EventIcon />, path: '/admin/add-session' },
  { text: 'Appointments', icon: <AssignmentIcon />, path: '/admin/appointments' },
  { text: 'Inventory', icon: <EventNoteIcon />, path: '/admin/inventory' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

const AddSession = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({ date: '', time: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    // Clear the JWT token from localStorage (assuming JWT auth)
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    console.log('Doctors state updated:', doctors);
  }, [doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      console.log('Fetching doctors...');
      const response = await axios.get('http://localhost:5000/api/admin/doctors');
      console.log('Doctors response:', response);
      console.log('Response headers:', response.headers);
      
      if (response.headers['content-type'].includes('application/json')) {
        if (Array.isArray(response.data)) {
          console.log('Processed doctors data:', response.data);
          setDoctors(response.data);
          setError(null);
        } else {
          console.warn('Response data is not an array:', response.data);
          setError('Invalid data format received from server');
        }
      } else {
        console.error('Received non-JSON response:', response.data);
        setError('Received unexpected response format from server');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(`Failed to fetch doctors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorSessions = async (doctorId) => {
    if (!doctorId) return;

    try {
      console.log('Fetching sessions for doctor:', doctorId);
      const response = await axios.get(`/api/admin/sessions/${doctorId}`);
      console.log('Sessions response:', response.data);
      
      const sessionsData = Array.isArray(response.data) ? response.data : [];
      setSessions(sessionsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to fetch sessions. Please try again.');
    }
  };

  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    console.log('Selected doctor:', doctorId);
    setSelectedDoctor(doctorId);
    if (doctorId) {
      fetchDoctorSessions(doctorId);
    } else {
      setSessions([]);
    }
  };

  const handleAddSession = async () => {
    if (!selectedDoctor || !newSession.date || !newSession.time) {
      setError('Please fill in all fields');
      return;
    }
  
    try {
      const url = `http://localhost:5000/api/admin/sessions`;
      console.log('Adding new session to:', url);
      
      // Convert date string to ISO format
      const isoDate = new Date(newSession.date).toISOString();
      
      const sessionData = {
        doctorId: selectedDoctor,
        date: isoDate,
        time: newSession.time
      };
      
      console.log('Sending session data:', sessionData);
      
      const response = await axios.post(url, sessionData);
      
      console.log('Add session response:', response.data);
      setSessions(prev => [...prev, response.data]);
      setShowPopup(false);
      setNewSession({ date: '', time: '' });
      setError(null);
    } catch (err) {
      console.error('Error adding session:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      setError(`Failed to add session: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`/api/admin/sessions/${sessionId}`);
      setSessions(prev => prev.filter(session => session._id !== sessionId));
      setError(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session. Please try again.');
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            onClick={item.text === 'Logout' ? handleLogout : () => window.location.href = item.path}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading doctors...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            Add Session
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3, marginTop: 8 }}
      >
        <Toolbar />

        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        <div>
          <Typography variant="h6" gutterBottom>Select Doctor</Typography>
          <TextField
            select
            label="Doctor"
            value={selectedDoctor}
            onChange={handleDoctorChange}
            fullWidth
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Choose a Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name} - {doctor.specialty}
              </option>
            ))}
          </TextField>
        </div>

        {sessions.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Specialty</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Booked</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell>{session.doctor?.name}</TableCell>
                    <TableCell>{session.doctor?.specialty}</TableCell>
                    <TableCell>{session.date}</TableCell>
                    <TableCell>{session.time}</TableCell>
                    <TableCell>{session.isBooked ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="secondary"
                        onClick={() => handleDeleteSession(session._id)}
                        disabled={session.isBooked}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 4 }}
          onClick={() => setShowPopup(true)}
          disabled={!selectedDoctor}
        >
          Add Session
        </Button>

        <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
          <DialogTitle>Add New Session</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter the date and time for the new session.
            </DialogContentText>
            <TextField
              margin="dense"
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newSession.time}
              onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPopup(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddSession} color="primary">
              Add Session
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AddSession;