import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Drawer,
  AppBar,
  CssBaseline,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

const drawerWidth = 240;
const theme = createTheme();

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient/dashboard' },
  { text: 'All Doctors', icon: <EventNoteIcon />, path: '/patient/doctors' },
  { text: 'Schedule Sessions', icon: <CalendarTodayIcon />, path: '/patient/schedule-sessions' },
  { text: 'My Bookings', icon: <CalendarTodayIcon />, path: '/patient/my-bookings' },
  { text: 'Inventory', icon: <LocalPharmacyIcon />, path: '/patient/inventory' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function ScheduleSessions() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, []);

  // Fetch doctors on load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('https://dispensary-management-system-pec.onrender.com/api/patient/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        showSnackbar('Error loading doctors. Please try again.', 'error');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch sessions for selected doctor
  const fetchSessions = async (doctorId) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://dispensary-management-system-pec.onrender.com/api/patient/sessions/${doctorId}`);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showSnackbar('Error loading sessions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle doctor selection
  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
    fetchSessions(event.target.value);
  };

  // Show snackbar helper
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle session booking
  const handleBookSession = async (sessionId) => {
    const patientId = localStorage.getItem('userId');
    
    // Debug logs
    console.log('Booking attempt with:', {
      sessionId,
      patientId,
      sessionIdType: typeof sessionId,
      patientIdType: typeof patientId
    });
  
    if (!patientId) {
      showSnackbar('Please log in to book a session', 'error');
      window.location.href = '/login';
      return;
    }
  
    try {
      const response = await axios.post('https://dispensary-management-system-pec.onrender.com/api/patient/book-session', {
        sessionId: sessionId.toString(), 
        patientId: patientId.toString() 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Booking response:', response.data);
      showSnackbar('Session booked successfully!', 'success');
      
      // Refresh sessions list after booking
      if (selectedDoctor) {
        await fetchSessions(selectedDoctor);
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          'Error booking session. Please try again.';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token'); 
    window.location.href = '/login';
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: '#2196f3'
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Medical Appointment System
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f5f5f5'
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding>
                  {item.onClick === 'logout' ? (
                    <ListItemButton onClick={handleLogout}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  ) : (
                    <ListItemButton
                      component="a"
                      href={item.path}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#e0e0e0'
                        }
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              mb={4}
              color="primary"
            >
              Schedule a Session
            </Typography>

            {/* Doctor Selection */}
            <FormControl
              fullWidth
              sx={{
                mb: 4,
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#2196f3',
                  },
                },
              }}
            >
              <InputLabel>Select a Doctor</InputLabel>
              <Select
                value={selectedDoctor}
                onChange={handleDoctorChange}
                label="Select a Doctor"
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    Dr. {doctor.name} - {doctor.specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loading ? (
              <Box display="flex" justifyContent="center" m={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper
                sx={{
                  width: '100%',
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: 3
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Doctor Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              {selectedDoctor
                                ? 'No available sessions for this doctor'
                                : 'Please select a doctor to view available sessions'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sessions.map((session) => (
                          <TableRow
                            key={session._id}
                            sx={{
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            <TableCell>Dr. {session.doctor.name}</TableCell>
                            <TableCell>{session.specialty}</TableCell>
                            <TableCell>
                              {new Date(session.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>{session.time}</TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleBookSession(session._id)}
                                sx={{
                                  textTransform: 'none',
                                  '&:hover': {
                                    backgroundColor: '#1976d2'
                                  }
                                }}
                              >
                                Book Session
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Container>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{
                width: '100%',
                '& .MuiAlert-message': {
                  fontSize: '1rem'
                }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
}