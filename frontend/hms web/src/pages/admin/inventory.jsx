import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, CircularProgress, Container,
  ButtonGroup
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { 
  Dashboard as DashboardIcon, 
  PersonAdd as PersonAddIcon,
  EventNote as EventNoteIcon, 
  CalendarToday as CalendarTodayIcon, 
  ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon, 
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  Remove as RemoveIcon 
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

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updateQuantityDialog, setUpdateQuantityDialog] = useState({
    open: false,
    medicineId: null,
    currentQuantity: 0,
    adjustment: 0
  });
  const [formData, setFormData] = useState({
    medicineName: '',
    quantity: '',
    expirationDate: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/inventory');
      setMedicines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddMedicine = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/inventory/add', formData);
      setMedicines([...medicines, response.data.newMedicine]);
      setOpen(false);
      setFormData({ medicineName: '', quantity: '', expirationDate: '' });
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/inventory/${medicineId}`);
      setMedicines(medicines.filter(medicine => medicine._id !== medicineId));
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const handleUpdateQuantity = async (medicineId, currentQuantity, adjustment) => {
    try {
      const newQuantity = Math.max(0, currentQuantity + adjustment);
      const response = await axios.put(`http://localhost:5000/api/admin/inventory/${medicineId}`, {
        quantity: newQuantity
      });
      
      setMedicines(medicines.map(medicine => 
        medicine._id === medicineId ? response.data.medicine : medicine
      ));
      
      setUpdateQuantityDialog(prev => ({
        ...prev,
        open: false
      }));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const openQuantityDialog = (medicine) => {
    setUpdateQuantityDialog({
      open: true,
      medicineId: medicine._id,
      currentQuantity: medicine.quantity,
      adjustment: 0
    });
  };

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
            <Typography variant="h6" noWrap component="div">
              Inventory Management
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
                  <ListItemButton 
                    onClick={item.text === 'Logout' ? handleLogout : () => window.location.href = item.path}
                  >
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
                Manage Inventory
              </Typography>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Add New Medicine
              </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
              {medicines.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No medicines found. Add a new medicine to get started.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine Name</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Expiration Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {medicines.map((medicine) => (
                        <TableRow key={medicine._id}>
                          <TableCell>{medicine.medicineName}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              {medicine.quantity}
                              <ButtonGroup size="small">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleUpdateQuantity(medicine._id, medicine.quantity, 1)}
                                >
                                  <AddIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  onClick={() => handleUpdateQuantity(medicine._id, medicine.quantity, -1)}
                                  disabled={medicine.quantity <= 0}
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </ButtonGroup>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openQuantityDialog(medicine)}
                              >
                                Update
                              </Button>
                            </Box>
                          </TableCell>
                          <TableCell>{new Date(medicine.expirationDate).toLocaleDateString()}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteMedicine(medicine._id)}
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

          {/* Add Medicine Dialog */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogContent>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Fill in the details below to add a new medicine.
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
                <TextField
                  name="medicineName"
                  label="Medicine Name"
                  fullWidth
                  value={formData.medicineName}
                  onChange={handleInputChange}
                />
                <TextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  fullWidth
                  value={formData.quantity}
                  onChange={handleInputChange}
                />
                <TextField
                  name="expirationDate"
                  label="Expiration Date"
                  type="date"
                  fullWidth
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAddMedicine}>
                Add Medicine
              </Button>
            </DialogActions>
          </Dialog>

          {/* Update Quantity Dialog */}
          <Dialog 
            open={updateQuantityDialog.open} 
            onClose={() => setUpdateQuantityDialog(prev => ({ ...prev, open: false }))}
          >
            <DialogTitle>Update Quantity</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <TextField
                  label="Adjustment"
                  type="number"
                  fullWidth
                  value={updateQuantityDialog.adjustment}
                  onChange={(e) => setUpdateQuantityDialog(prev => ({
                    ...prev,
                    adjustment: parseInt(e.target.value) || 0
                  }))}
                  helperText={`Current quantity: ${updateQuantityDialog.currentQuantity}`}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpdateQuantityDialog(prev => ({ ...prev, open: false }))}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => handleUpdateQuantity(
                  updateQuantityDialog.medicineId,
                  updateQuantityDialog.currentQuantity,
                  updateQuantityDialog.adjustment
                )}
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
}