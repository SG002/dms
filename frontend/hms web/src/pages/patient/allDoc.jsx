import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Paper, CircularProgress, Container,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, SwipeableDrawer, useTheme, useMediaQuery, Card, CardContent
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon, EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon, ExitToApp as ExitToAppIcon,
  Menu as MenuIcon, LocalPharmacy as LocalPharmacyIcon
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

export default function AllDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('https://dispensary-management-system-pec.onrender.com/api/patient/doctors');
        setDoctors(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

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
              <ListItemButton component="a" href={item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Mobile Card View Component
  const DoctorCard = ({ doctor }) => (
    <Card sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {doctor.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Email:</strong> {doctor.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Phone:</strong> {doctor.phone}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Specialty:</strong> {doctor.specialty}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap component="div">
              All Doctors
            </Typography>
          </Toolbar>
        </AppBar>

        {isMobile ? (
          <SwipeableDrawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            onOpen={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', sm: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </SwipeableDrawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
              All Doctors
            </Typography>

            {doctors.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No doctors available.
                </Typography>
              </Paper>
            ) : isMobile ? (
              // Mobile Card View
              <Box sx={{ mt: 2 }}>
                {doctors.map((doctor) => (
                  <DoctorCard key={doctor._id} doctor={doctor} />
                ))}
              </Box>
            ) : (
              // Desktop Table View
              <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow 
                          key={doctor._id}
                          sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                        >
                          <TableCell>{doctor.name}</TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.phone}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}