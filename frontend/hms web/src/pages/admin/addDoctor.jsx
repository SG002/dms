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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Container,
  CircularProgress,
  Grid
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    password: ''
  });
  const [doctors, setDoctors] = useState([]);
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

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/doctors');
      setDoctors(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
      setLoading(false);
      setDoctors([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddDoctor = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/add-doctor', formData);
      if (response.data && response.data.doctor) {
        setDoctors(prev => [...prev, response.data.doctor]);
        setOpen(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          specialty: '',
          password: ''
        });
      }
    } catch (err) {
      console.error('Error adding doctor:', err);
      alert(err.response?.data?.message || 'Error adding doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-doctor/${doctorId}`);
      setDoctors(prev => prev.filter(doctor => doctor._id !== doctorId));
    } catch (err) {
      console.error('Error deleting doctor:', err);
      alert(err.response?.data?.message || 'Error deleting doctor');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

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
              {menuItems.map((item,index) => (
                <ListItem key={index} disablePadding>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Manage Doctors
              </Typography>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Add New Doctor
              </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
              {doctors.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No doctors found. Add a new doctor to get started.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Specialty</TableCell>
                        <TableCell>Phone Number</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {doctors.map((doctor) => (
                        <TableRow key={doctor._id}>
                          <TableCell>{doctor.name}</TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.specialty}</TableCell>
                          <TableCell>{doctor.phone}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDoctor(doctor._id)}
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
            </Paper>
          </Container>

          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Doctor</DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Fill in the details below to add a new doctor.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
                <TextField
                  name="name"
                  label="Full Name"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <TextField
                  name="phone"
                  label="Phone Number"
                  fullWidth
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <TextField
                  name="specialty"
                  label="Specialty"
                  fullWidth
                  value={formData.specialty}
                  onChange={handleInputChange}
                />
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddDoctor}>
                Add Doctor
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
}