// components/patient/MyBookings.jsx
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
  Snackbar,
  Alert
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';

const drawerWidth = 240;
const theme = createTheme();

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient/dashboard' },
  { text: 'All Doctors', icon: <EventNoteIcon />, path: '/patient/doctors' },
  { text: 'Schedule Sessions', icon: <CalendarTodayIcon />, path: '/patient/schedule-sessions' },
  { text: 'My Bookings', icon: <CalendarTodayIcon />, path: '/patient/my-bookings' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
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

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const patientId = localStorage.getItem('userId');
      setLoading(true);
      
      try {
        const response = await axios.get(`https://dispensary-management-system-pec.onrender.com/api/patient/my-bookings/${patientId}`);
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        showSnackbar('Error loading bookings. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle booking cancellation
  const handleCancelBooking = async (sessionId) => {
  const patientId = localStorage.getItem('userId');
  
  try {
    await axios.post(`http://localhost:5000/api/patient/cancel-booking/${sessionId}`, {
      patientId
    });
    
    // Refresh the bookings list after cancellation
    const response = await axios.get(`http://localhost:5000/api/patient/my-bookings/${patientId}`);
    setBookings(response.data);
    showSnackbar('Booking cancelled successfully', 'success');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    showSnackbar('Error cancelling booking. Please try again.', 'error');
  }
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
              My Bookings
            </Typography>

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
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              No bookings found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        // ... existing code ...

                        bookings.map((booking) => (
                        <TableRow
                          key={booking._id}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            } 
                          }}
                        >
                            <TableCell>
                            {booking.doctor ? `Dr. ${booking.doctor.name}` : 'Doctor no longer available'}
                          </TableCell>
                            <TableCell>
                            {booking.doctor ? booking.doctor.specialty : 'N/A'}
                            </TableCell>
                              <TableCell>
                            {booking.session ? new Date(booking.session.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Date not available'}
                            </TableCell>
                            <TableCell>
                            {booking.session ? booking.session.time : 'Time not available'}
                            </TableCell>
                            <TableCell>
                            <Typography
                              sx={{
                                color: booking.doctor ? 'success.main' : 'error.main',
                                  fontWeight: 'medium'
                              }}
                            >
                               {booking.doctor ? 'Confirmed' : 'Doctor Unavailable'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleCancelBooking(booking.session?._id)}
                              sx={{
                                textTransform: 'none',
                              '&:hover': {
                                backgroundColor: '#ffebee'
                              }
                              }}
                              >
                                Cancel Booking
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