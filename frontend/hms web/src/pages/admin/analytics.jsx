import React, { useState, useEffect } from 'react';
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
  Grid,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  EventNote as EventNoteIcon,
  Assignment as AssignmentIcon,
  ExitToApp as ExitToAppIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('https://dispensary-management-system-pec.onrender.com/api/admin/analytics');
        console.log('Analytics data:', response.data);
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Analytics Dashboard
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
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={
                    item.text === 'Logout'
                      ? handleLogout
                      : () => (window.location.href = item.path)
                  }
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
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#2196f3',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Typography variant="h6">Total Appointments</Typography>
                <Typography variant="h4">{data.summary.totalAppointments}</Typography>
                <Typography variant="subtitle2">
                  Today: {data.summary.todayAppointments}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#4caf50',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Typography variant="h6">Total Medicines</Typography>
                <Typography variant="h4">{data.summary.totalMedicines}</Typography>
                <Typography variant="subtitle2">
                  Low Stock: {data.summary.lowStockCount}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                sx={{
                  p: 3,
                  bgcolor: '#ff9800',
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              >
                <Typography variant="h6">Expiring Medicines</Typography>
                <Typography variant="h4">{data.summary.expiringCount}</Typography>
                <Typography variant="subtitle2">Within 30 days</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Appointment Trends */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Appointment Trends (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends.appointmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#2196f3"
                      name="Appointments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Medicine Expiration Status */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Medicine Expiration Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.trends.medicinesByExpiration}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {data.trends.medicinesByExpiration.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Appointments by Specialty */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Appointments by Specialty
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={data.trends.appointmentsBySpecialty}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      dataKey="_id"
                      type="category"
                      width={90}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      name="Number of Appointments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Appointments by Time */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Appointments by Time Slot
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.trends.appointmentsByTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#2196f3"
                      name="Number of Appointments"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
{/* Doctor Workload Analysis */}
<Grid item xs={12}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" gutterBottom>
      Doctor Workload Distribution
    </Typography>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data.trends.doctorWorkload}
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 100,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="doctorName"
          angle={-45}
          textAnchor="end"
          interval={0}
          height={100}
        />
        <YAxis label={{ value: 'Number of Appointments', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">
                    <strong>{payload[0].payload.doctorName}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Specialty: {payload[0].payload.specialty}
                  </Typography>
                  <Typography variant="body2">
                    Appointments: {payload[0].value}
                  </Typography>
                </Paper>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="appointmentCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </Paper>
</Grid>

{/* Weekly Appointment Distribution */}
<Grid item xs={12} md={6}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" gutterBottom>
      Weekly Appointment Distribution
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.trends.weeklyDistribution}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" name="Appointments" />
      </BarChart>
    </ResponsiveContainer>
  </Paper>
</Grid>

{/* Session Utilization Card */}
<Grid item xs={12} md={6}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" gutterBottom>
      Session Utilization
    </Typography>
    <Box sx={{ position: 'relative', display: 'inline-flex', m: 2 }}>
      <CircularProgress
        variant="determinate"
        value={data.summary.sessionUtilization.utilizationRate}
        size={120}
        thickness={4}
        sx={{ color: '#4caf50' }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" component="div">
          {Math.round(data.summary.sessionUtilization.utilizationRate)}%
        </Typography>
      </Box>
    </Box>
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">
          Total Sessions
        </Typography>
        <Typography variant="h6">
          {data.summary.sessionUtilization.totalSessions}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" color="text.secondary">
          Booked Sessions
        </Typography>
        <Typography variant="h6">
          {data.summary.sessionUtilization.bookedSessions}
        </Typography>
      </Grid>
    </Grid>
  </Paper>
</Grid>

{/* Medicine Inventory Status */}
<Grid item xs={12} md={6}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" gutterBottom>
      Medicine Inventory Status
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.trends.medicineInventoryStatus}
          dataKey="count"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.trends.medicineInventoryStatus.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry._id === 'Critical' ? '#ff1744' : 
                    entry._id === 'Low' ? '#ffa726' : '#4caf50'}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </Paper>
</Grid>

{/* Appointment Lead Time */}
{/* <Grid item xs={12} md={6}>
  <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="h6" gutterBottom>
      Appointment Booking Lead Time
    </Typography>
    <Grid container spacing={3}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          Average Lead Time
        </Typography>
        <Typography variant="h6">
          {Math.round(data.summary.leadTime.averageLeadTime)} days
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          Minimum Lead Time
        </Typography>
        <Typography variant="h6">
          {Math.round(data.summary.leadTime.minLeadTime)} days
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary">
          Maximum Lead Time
        </Typography>
        <Typography variant="h6">
          {Math.round(data.summary.leadTime.maxLeadTime)} days
        </Typography>
      </Grid>
    </Grid>
  </Paper>
</Grid> */}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Analytics;