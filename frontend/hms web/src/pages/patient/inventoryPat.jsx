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
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ExitToApp as ExitToAppIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/patient/dashboard' },
    { text: 'All Doctors', icon: <EventNoteIcon />, path: '/patient/doctors' },
    { text: 'Schedule Sessions', icon: <CalendarTodayIcon />, path: '/patient/schedule-sessions' },
    { text: 'My Bookings', icon: <CalendarTodayIcon />, path: '/patient/my-bookings' },
    { text: 'Inventory', icon: <LocalPharmacyIcon />, path: '/patient/inventory' },
    { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function PatientInventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token || role !== 'patient') {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://dispensary-management-system-pec.onrender.com/api/patient/inventory',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMedicines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setError('Failed to load inventory data. Please try again later.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const getStockStatus = (quantity) => {
    if (quantity > 20) return { label: 'In Stock', color: 'success' };
    if (quantity > 10) return { label: 'Moderate', color: 'warning' };
    return { label: 'Low Stock', color: 'error' };
  };

  return (
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
            Available Medicines
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
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                {item.onClick === 'logout' ? (
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                ) : (
                  <ListItemButton
                    component="a"
                    href={item.path}
                    selected={window.location.pathname === item.path}
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
          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : medicines.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No medicines are currently available in the inventory.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine Name</TableCell>
                    <TableCell align="center">Availability Status</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Expiration Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.map((medicine) => {
                    const status = getStockStatus(medicine.quantity);
                    return (
                      <TableRow key={medicine._id}>
                        <TableCell>{medicine.medicineName}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={status.label} 
                            color={status.color} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">{medicine.quantity}</TableCell>
                        <TableCell align="right">
                          {new Date(medicine.expirationDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>
    </Box>
  );
}