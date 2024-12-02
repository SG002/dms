import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, CircularProgress, AppBar, Toolbar, Drawer, List, ListItem,
  ListItemIcon, ListItemText, IconButton, useTheme, useMediaQuery, Card, CardContent,
  SwipeableDrawer
} from '@mui/material';
import {
  Dashboard as DashboardIcon, PersonAdd as PersonAddIcon, Event as EventIcon, 
  EventNote as EventNoteIcon, Assignment as AssignmentIcon, ExitToApp as ExitToAppIcon, 
  Analytics as AnalyticsIcon, Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Add Doctor', icon: <PersonAddIcon />, path: '/admin/add-doctor' },
  { text: 'Add Session', icon: <EventIcon />, path: '/admin/add-session' },
  { text: 'Appointments', icon: <AssignmentIcon />, path: '/admin/appointments' },
  { text: 'Inventory', icon: <EventNoteIcon />, path: '/admin/inventory' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' },
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleMenuItemClick = (item) => {
    if (item.text === 'Logout') {
      handleLogout();
    } else {
      window.location.href = item.path;
    }
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get('/api/admin/appointments');
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const drawer = (
    <Box>
      <Typography variant="h6" sx={{ p: 2, color: '#333', fontWeight: 'bold' }}>
        Admin Panel
      </Typography>
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => handleMenuItemClick(item)}
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#555' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: '#555' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const MobileAppointmentCard = ({ appointment }) => (
    <Card sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          <strong>Patient:</strong> {appointment.patient?.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          <strong>Doctor:</strong> {appointment.doctor?.name}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          <strong>Specialty:</strong> {appointment.doctor?.specialty}
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
        </Typography>
        <Typography variant="subtitle1">
          <strong>Time:</strong> {appointment.time}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile Drawer */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', sm: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#f0f0f0',
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>
      ) : (
        // Desktop Drawer
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#f0f0f0',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#fff',
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <AppBar 
          position="static" 
          sx={{ 
            backgroundColor: '#2196f3', 
            boxShadow: 'none',
            mb: 3,
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Appointments
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#333', mb: 2 }}>
            Booked Appointments
          </Typography>

          {isMobile ? (
            // Mobile Card View
            <Box sx={{ mt: 2 }}>
              {appointments.map((appointment) => (
                <MobileAppointmentCard 
                  key={appointment._id} 
                  appointment={appointment} 
                />
              ))}
            </Box>
          ) : (
            // Desktop/Tablet Table View
            <TableContainer 
              component={Paper} 
              sx={{ 
                boxShadow: 'none', 
                border: '1px solid #e0e0e0',
                overflowX: 'auto'
              }}
            >
              <Table sx={{ minWidth: isTablet ? 650 : 750 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Doctor Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Specialty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow 
                      key={appointment._id}
                      sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                    >
                      <TableCell>{appointment.patient?.name}</TableCell>
                      <TableCell>{appointment.doctor?.name}</TableCell>
                      <TableCell>{appointment.doctor?.specialty}</TableCell>
                      <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Appointments;