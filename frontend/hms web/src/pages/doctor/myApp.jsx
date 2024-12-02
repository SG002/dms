// components/doctor/MyAppointments.jsx
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
  Tabs,
  Tab,
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
//   { text: 'Dashboard', icon: <DashboardIcon />, path: '/doctor/dashboard' },
  { text: 'My Appointments', icon: <EventNoteIcon />, path: '/doctor/appointments' },
  { text: 'My Patients', icon: <EventNoteIcon />, path: '/doctor/patients' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
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
      const role = localStorage.getItem('role');
      if (!userId || role !== 'doctor') {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = localStorage.getItem('userId');
      setLoading(true);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/doctor/appointments/${doctorId}`);
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        showSnackbar('Error loading appointments. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
              My Appointments
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
                        <TableCell sx={{ fontWeight: 'bold' }}>Patient Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            <Typography variant="body1" sx={{ py: 2 }}>
                              No appointments found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointments.map((appointment) => (
                          <TableRow
                            key={appointment._id}
                            sx={{
                              '&:hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                          >
                            <TableCell>{appointment.patient.name}</TableCell>
                            <TableCell>
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>{appointment.time}</TableCell>
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