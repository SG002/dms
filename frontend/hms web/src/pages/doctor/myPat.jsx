import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  ExitToApp as ExitToAppIcon,
  Upload as UploadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const drawerWidth = 240;
const theme = createTheme();

const menuItems = [
  { text: 'My Appointments', icon: <EventNoteIcon />, path: '/doctor/appointments' },
  { text: 'My Patients', icon: <EventNoteIcon />, path: '/doctor/patients' },
  { text: 'Logout', icon: <ExitToAppIcon />, onClick: 'logout' }
];

export default function MyPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [patientTranscripts, setPatientTranscripts] = useState([]);

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
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const doctorId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const response = await axios.get(
        `https://dispensary-management-system-pec.onrender.com/api/doctor/patients/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const uniquePatients = Array.from(new Map(
        response.data.map(patient => [patient._id, patient])
      ).values());
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showSnackbar('Error loading patients. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // const handleFileSelect = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

  const handleUploadClick = (patientId) => {
    setSelectedPatientId(patientId);
    setUploadDialogOpen(true);
  };

  // ... existing imports ...

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  // Add file validation
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      showSnackbar('Please select a valid image (JPEG, PNG) or PDF file', 'error');
      event.target.value = ''; // Reset file input
      return;
    }

    if (file.size > maxSize) {
      showSnackbar('File size should be less than 5MB', 'error');
      event.target.value = ''; // Reset file input
      return;
    }
  }
  setSelectedFile(file);
};

const handleUploadSubmit = async () => {
  if (!selectedFile) {
    showSnackbar('Please select a file first', 'error');
    return;
  }

  // Create FormData and log its contents
  const formData = new FormData();
  formData.append('file', selectedFile); // Changed from 'transcript' to 'file'
  formData.append('patientId', selectedPatientId);
  formData.append('doctorId', localStorage.getItem('userId'));

  // Log the data being sent
  console.log('File:', selectedFile);
  console.log('Patient ID:', selectedPatientId);
  console.log('Doctor ID:', localStorage.getItem('userId'));

  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Log the request headers
    console.log('Token:', token);

    const response = await axios.post(
      'https://dispensary-management-system-pec.onrender.com/api/doctor/upload-transcript',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 60000, // Increased timeout to 60 seconds
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted, '%');
        }
      }
    );

    console.log('Upload response:', response.data);
    showSnackbar('Transcript uploaded successfully', 'success');
    setUploadDialogOpen(false);
    setSelectedFile(null);
    
    // Refresh the patient data after successful upload
    await fetchPatients();
    
  } catch (error) {
    console.error('Full error object:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Error response headers:', error.response?.headers);

    let errorMessage = 'Error uploading transcript. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later or contact support.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Upload timed out. Please try again with a smaller file.';
    }
    
    showSnackbar(errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};


const handleViewTranscript = async (patientId) => {
  try {
    const doctorId = localStorage.getItem('userId');
    const response = await axios.get(
      `https://dispensary-management-system-pec.onrender.com/api/doctor/transcripts/${patientId}/${doctorId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    setPatientTranscripts(response.data);
    setViewDialogOpen(true);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    showSnackbar('Error loading transcripts. Please try again.', 'error');
  }
};

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

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
            >
              My Patients
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
              </Box>
            ) : patients.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No patients have booked sessions with you yet.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient._id}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell align="center">
                          <Button
                            startIcon={<UploadIcon />}
                            variant="contained"
                            color="primary"
                            onClick={() => handleUploadClick(patient._id)}
                            sx={{ mr: 1 }}
                          >
                            Upload
                          </Button>
                          <Button
                            startIcon={<VisibilityIcon />}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleViewTranscript(patient._id)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Container>
        </Box>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload Medical Transcript</DialogTitle>
        <DialogContent>
  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
    Please select an image (JPEG, PNG) or PDF file less than 5MB
  </Typography>
  <input
    type="file"
    accept=".jpg,.jpeg,.png,.pdf"
    onChange={handleFileSelect}
    style={{ margin: '20px 0' }}
  />
  {selectedFile && (
    <Typography variant="body2" color="primary">
      Selected file: {selectedFile.name}
    </Typography>
  )}
  {loading && (
    <Box display="flex" justifyContent="center" mt={2}>
      <CircularProgress size={24} />
    </Box>
  )}
</DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUploadSubmit} variant="contained" color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
<Dialog
  open={viewDialogOpen}
  onClose={() => setViewDialogOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Medical Transcripts</DialogTitle>
  <DialogContent>
    {patientTranscripts.length > 0 ? (
      <Grid container spacing={2}>
        {patientTranscripts.map((transcript, index) => (
          <Grid item xs={12} key={transcript._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {transcript.title || `Medical Record ${index + 1}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(transcript.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {transcript.type || 'Document'}
                </Typography>
              </CardContent>
              <CardContent>
                {transcript.documentUrl?.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={transcript.documentUrl}
                    width="100%"
                    height="300px"
                    title={`PDF Document ${index + 1}`}
                    style={{ border: 'none' }}
                  />
                ) : (
                  <img
                    src={transcript.documentUrl}
                    alt={`Medical Document ${index + 1}`}
                    style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'path/to/fallback/image.png'; // Add a fallback image
                    }}
                  />
                )}
              </CardContent>
              <CardActions>
                <Button
                  onClick={() => window.open(transcript.documentUrl, '_blank')}
                  color="primary"
                >
                  Open in New Tab
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    ) : (
      <Typography>No transcripts available</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}