import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  CssBaseline, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Grid,
  Paper,
  Container
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  PersonAdd as PersonAddIcon, 
  EventNote as EventNoteIcon, 
  CalendarToday as CalendarTodayIcon, 
  ExitToApp as ExitToAppIcon,
  Analytics as AnalyticsIcon 
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';  // Import axios to make HTTP requests

const drawerWidth = 240;
const theme = createTheme();

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Add Doctor', icon: <PersonAddIcon />, path: '/admin/add-doctor' },
  { text: 'Add Session', icon: <EventNoteIcon />, path: '/admin/add-session' },
  { text: 'Appointments', icon: <CalendarTodayIcon />, path: '/admin/appointments' },
  { text: 'Inventory', icon: <EventNoteIcon />, path: '/admin/inventory' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' },
];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    todaysAppointments: 0,
  });

  const handleLogout = () => {
    // Clear the JWT token from localStorage (assuming JWT auth)
    localStorage.removeItem('token');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component="a" 
                  onClick={item.text === 'Logout' ? handleLogout : () => window.location.href = item.path}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Total Doctors
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData.totalDoctors}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData.totalPatients}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Today's Appointments
                  </Typography>
                  <Typography component="p" variant="h4">
                    {dashboardData.todaysAppointments}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
