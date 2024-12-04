const express = require('express');
const Doctor = require('../models/Doctor');
const Session = require('../models/Session');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();



// Route: GET 
router.get('/dashboard', async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    res.json({ totalDoctors, totalPatients, todayAppointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET 
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password'); // Exclude password field
    console.log('Found doctors:', doctors);
    res.json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/sessions/:doctorId', async (req, res) => {
  try {
    const sessions = await Session.find({ doctor: req.params.doctorId }).populate('doctor');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
  
  

// Route: POST 
router.post('/sessions', async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    
    console.log('Received session data:', { doctorId, date, time });

    // Fetch the doctor to get the specialty
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    console.log('Found doctor:', doctor);

    const session = new Session({
      doctor: doctorId,
      specialty: doctor.specialty,
      date,
      time,
      isBooked: false
    });

    console.log('Created session object:', session);

    await session.save();
    console.log('Session saved successfully');

    const populatedSession = await session.populate('doctor');
    res.json(populatedSession);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: error.stack 
    });
  }
});

  
  // Route: DELETE 
  router.delete('/sessions/:id', async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session) {
        return res.status(404).json({ msg: 'Session not found' });
      }
  
      await Session.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Session removed', sessionId: req.params.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });
  
  // Route: GET 
  router.get('/appointments', async (req, res) => {
    try {
      const appointments = await Appointment.find()
        .populate('patient', 'name')
        .populate('doctor', 'name specialty')
        .populate('session', 'date time')
        .sort({ date: -1 });
      res.json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });
  
  

  //Inventory
  router.get('/inventory', async (req, res) => {
    try {
      const medicines = await Inventory.find();
      res.json(medicines);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });
  
  router.post('/inventory/add', async (req, res) => {
    const { medicineName, quantity, expirationDate } = req.body;
  
    try {
      const newMedicine = new Inventory({
        medicineName,
        quantity,
        expirationDate,
      });
  
      await newMedicine.save();
      res.json({ msg: 'Medicine added successfully', newMedicine });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  router.put('/inventory/:id', async (req, res) => {
    const { quantity } = req.body;
  
    try {
      if (quantity < 0) {
        return res.status(400).json({ msg: 'Quantity cannot be negative' });
      }

      let medicine = await Inventory.findById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ msg: 'Medicine not found' });
      }
  
      medicine.quantity = quantity;
      medicine.lastUpdated = new Date();
      await medicine.save();
  
      res.json({ msg: 'Medicine updated successfully', medicine });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

  router.delete('/inventory/:id', async (req, res) => {
    try {
      await Inventory.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Medicine deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

  //Add Doctor
  router.post('/add-doctor', async (req, res) => {
    const { name, email, phone, specialty, password } = req.body;
  
    try {
      let doctor = await Doctor.findOne({ email });
      if (doctor) {
        return res.status(400).json({ msg: 'Doctor already exists' });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      doctor = new Doctor({
        name,
        email,
        phone,
        specialty,
        password: hashedPassword
      });
  
      await doctor.save();
      // Return the doctor object without the password
      const doctorResponse = doctor.toObject();
      delete doctorResponse.password;
      
      res.json({ msg: 'Doctor added successfully', doctor: doctorResponse });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });
  
  
  // DELETE /api/admin/delete-doctor/:id
  router.delete('/delete-doctor/:id', async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.params.id);
      if (!doctor) {
        return res.status(404).json({ msg: 'Doctor not found' });
      }
  
      await Doctor.findByIdAndDelete(req.params.id);
      res.json({ msg: 'Doctor removed', doctorId: req.params.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });

  // Get analytics data
  router.get('/analytics', async (req, res) => {
    try {
      // Get total counts
      const totalAppointments = await Appointment.countDocuments();
      const totalMedicines = await Inventory.countDocuments();

      // Get today's appointments
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const todayAppointments = await Appointment.countDocuments({
        date: { $gte: startOfDay, $lt: endOfDay }
      });

      // Get appointments by date (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const appointmentTrends = await Appointment.aggregate([
        {
          $match: {
            date: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$date",
                timezone: "UTC" 
              } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Get appointment distribution by time
      const appointmentsByTime = await Appointment.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$time", "Unspecified"] },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Get low stock medicines (less than 10)
      const lowStockCount = await Inventory.countDocuments({ quantity: { $lt: 10 } });

      // Get expiring medicines (within next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringCount = await Inventory.countDocuments({
        expirationDate: { 
          $gte: new Date(), 
          $lte: thirtyDaysFromNow 
        }
      });

      // Get medicines by expiration status
      const medicinesByExpiration = await Inventory.aggregate([
        {
          $group: {
            _id: {
              $cond: {
                if: { $lt: ['$expirationDate', new Date()] },
                then: 'Expired',
                else: {
                  $cond: {
                    if: { $lt: ['$expirationDate', thirtyDaysFromNow] },
                    then: 'Expiring Soon',
                    else: 'Valid'
                  }
                }
              }
            },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get appointments by specialty
      const appointmentsBySpecialty = await Appointment.aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        {
          $unwind: { 
            path: '$doctorInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: { $ifNull: ['$doctorInfo.specialty', 'Unspecified'] },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get doctor workload
      const doctorWorkload = await Appointment.aggregate([
        {
          $lookup: {
            from: 'doctors',
            localField: 'doctor',
            foreignField: '_id',
            as: 'doctorInfo'
          }
        },
        {
          $unwind: { 
            path: '$doctorInfo',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$doctor',
            doctorName: { $first: { $ifNull: ['$doctorInfo.name', 'Unknown Doctor'] } },
            specialty: { $first: { $ifNull: ['$doctorInfo.specialty', 'Unspecified'] } },
            appointmentCount: { $sum: 1 }
          }
        },
        {
          $project: {
            doctorName: 1,
            specialty: 1,
            appointmentCount: 1,
            _id: 0
          }
        },
        {
          $sort: { appointmentCount: -1 }
        }
      ]);

      // 2. Weekly Appointment Distribution
      const weeklyDistribution = await Appointment.aggregate([
        {
          $group: {
            _id: { $dayOfWeek: '$date' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            day: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
                  { case: { $eq: ['$_id', 2] }, then: 'Monday' },
                  { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
                  { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
                  { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
                  { case: { $eq: ['$_id', 6] }, then: 'Friday' },
                  { case: { $eq: ['$_id', 7] }, then: 'Saturday' }
                ]
              }
            },
            count: 1,
            _id: 0
          }
        },
        {
          $sort: { day: 1 }
        }
      ]);

      // 3. Appointment Booking Lead Time
      const currentDate = new Date();
      const bookingLeadTime = await Appointment.aggregate([
        {
          $project: {
            leadTime: {
              $divide: [
                { $subtract: ['$date', '$createdAt'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            averageLeadTime: { $avg: '$leadTime' },
            minLeadTime: { $min: '$leadTime' },
            maxLeadTime: { $max: '$leadTime' }
          }
        }
      ]);

      // 4. Session Utilization Rate
      const sessionUtilization = await Session.aggregate([
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            bookedSessions: {
              $sum: { $cond: ['$isBooked', 1, 0] }
            }
          }
        },
        {
          $project: {
            utilizationRate: {
              $multiply: [
                { $divide: ['$bookedSessions', '$totalSessions'] },
                100
              ]
            },
            totalSessions: 1,
            bookedSessions: 1,
            _id: 0
          }
        }
      ]);

      // 5. Medicine Inventory Status
      const medicineInventoryStatus = await Inventory.aggregate([
        {
          $project: {
            medicineName: 1,
            status: {
              $switch: {
                branches: [
                  { case: { $lt: ['$quantity', 10] }, then: 'Critical' },
                  { case: { $lt: ['$quantity', 30] }, then: 'Low' },
                  { case: { $gte: ['$quantity', 30] }, then: 'Adequate' }
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        summary: {
          totalAppointments,
          totalMedicines,
          todayAppointments,
          lowStockCount,
          expiringCount,
          sessionUtilization: sessionUtilization[0] || { 
            utilizationRate: 0, 
            totalSessions: 0, 
            bookedSessions: 0 
          },
          leadTime: bookingLeadTime[0] || { 
            averageLeadTime: 0, 
            minLeadTime: 0, 
            maxLeadTime: 0 
          }
        },
        trends: {
          appointmentTrends,
          appointmentsByTime,
          medicinesByExpiration,
          appointmentsBySpecialty,
          doctorWorkload,
          weeklyDistribution,
          medicineInventoryStatus 
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  });
  

module.exports = router;