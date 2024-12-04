import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Paper, CircularProgress, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, SwipeableDrawer, useTheme, useMediaQuery, Card, CardContent,
  Snackbar, Alert
} from '@mui/material';
import {
  Dashboard as DashboardIcon, EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon, ExitToApp as ExitToAppIcon,
  Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'My Appointments', icon: <EventNoteIcon />, path: '/doctor/appointments' },
  { text: 'My Patients', icon: <EventNoteIcon />, path: '/doctor/patients' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function MyAppointments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

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

  useEffect(() => {
    const fetchAppointments = async () => {
      const doctorId = localStorage.getItem('userId');
      setLoading(true);
      
      try {
        const response = await axios.get(`https://dispensary-management-system-pec.onrender.com/api/doctor/appointments/${doctorId}`);
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

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Mobile Card Component
  const AppointmentCard = ({ appointment }) => (
    <Card sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {appointment.patient.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Time:</strong> {appointment.time}
        </Typography>
      </CardContent>
    </Card>
  );

  const drawer = (
    <Box>
      <Toolbar />
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
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#2196f3'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            Medical Appointment System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            onOpen={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                backgroundColor: '#f5f5f5'
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                backgroundColor: '#f5f5f5'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
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
          ) : appointments.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No appointments found
              </Typography>
            </Paper>
          ) : isMobile ? (
            // Mobile Card View
            <Box sx={{ mt: 2 }}>
              {appointments.map((appointment) => (
                <AppointmentCard key={appointment._id} appointment={appointment} />
              ))}
            </Box>
          ) : (
            // Desktop Table View
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
                    {appointments.map((appointment) => (
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Container>
      </Box>

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
  );
}