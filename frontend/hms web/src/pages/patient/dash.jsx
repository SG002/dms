import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Paper, CircularProgress, Container,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Card, CardContent,
  CardActions, Grid, Snackbar, Alert, IconButton, SwipeableDrawer, useTheme, useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon, EventNote as EventNoteIcon, CalendarToday as CalendarTodayIcon,
  ExitToApp as ExitToAppIcon, LocalPharmacy as LocalPharmacyIcon, Description as DescriptionIcon,
  Menu as MenuIcon
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

export default function PatientDashboard() {
  const [totalDoctors, setTotalDoctors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [transcripts, setTranscripts] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      if (!userId || role !== 'patient') {
        window.location.href = '/login';
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        // Fetch total doctors
        const doctorsResponse = await axios.get('https://dispensary-management-system-pec.onrender.com/api/patient/dashboard');
        setTotalDoctors(doctorsResponse.data.totalDoctors);
        
        // Fetch user name
        const userResponse = await axios.get(
          `https://dispensary-management-system-pec.onrender.com/api/patient/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setUserName(userResponse.data.name);
        
        // Fetch transcripts
        const transcriptsResponse = await axios.get(
          `https://dispensary-management-system-pec.onrender.com/api/patient/transcripts/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setTranscripts(transcriptsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error loading dashboard data. Please try again.', 'error');
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleViewTranscript = (transcript) => {
    setSelectedTranscript(transcript);
    setViewDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
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
              Patient Dashboard
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
              keepMounted: true, // Better mobile performance
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
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {userName}
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: 3, textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Available Doctors
                  </Typography>
                  <Typography variant="h2" color="primary">
                    {totalDoctors}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
                  My Medical Transcripts
                </Typography>
                {transcripts.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No medical transcripts available yet.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {transcripts.map((transcript) => (
                      <Grid item xs={12} sm={6} md={4} key={transcript._id}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {transcript.title || 'Medical Transcript'} 
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Doctor: {transcript.doctorName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date: {new Date(transcript.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Type: {transcript.type || 'Document'} 
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button
                              startIcon={<DescriptionIcon />}
                              onClick={() => handleViewTranscript(transcript)}
                              fullWidth
                            >
                              View Document
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* View Transcript Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTranscript?.title || 'Medical Document'}
          <Typography variant="subtitle2" color="text.secondary">
            {selectedTranscript && `Dr. ${selectedTranscript.doctorName} - ${new Date(selectedTranscript.createdAt).toLocaleDateString()}`}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTranscript && (
            selectedTranscript.documentUrl?.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={selectedTranscript.documentUrl}
                width="100%"
                height="600px"
                title="PDF Viewer"
                style={{ border: 'none' }}
              />
            ) : (
              <img
                src={selectedTranscript.documentUrl}
                alt="Medical Document"
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => {
                  e.target.onerror = null;
                  showSnackbar('Error loading image', 'error');
                }}
              />
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => window.open(selectedTranscript?.documentUrl, '_blank')}
            color="primary"
          >
            Open in New Tab
          </Button>
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