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

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
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
    const fetchBookings = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `https://dispensary-management-system-pec.onrender.com/api/patient/bookings/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setBookings(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      }
    };

    fetchBookings();
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
  const BookingCard = ({ booking }) => (
    <Card sx={{ mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {booking.doctorName}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Time:</strong> {booking.time}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Specialty:</strong> {booking.specialty}
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
              My Bookings
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
              My Bookings
            </Typography>

            {bookings.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No bookings available.
                </Typography>
              </Paper>
            ) : isMobile ? (
              // Mobile Card View
              <Box sx={{ mt: 2 }}>
                {bookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </Box>
            ) : (
              // Desktop Table View
              <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Doctor Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Specialty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow 
                          key={booking._id}
                          sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}
                        >
                          <TableCell>{booking.doctorName}</TableCell>
                          <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                          <TableCell>{booking.time}</TableCell>
                          <TableCell>{booking.specialty}</TableCell>
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