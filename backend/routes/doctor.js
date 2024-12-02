// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Transcript = require('../models/Transcript');
const { upload } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');

// Get all appointments for a doctor
router.get('/appointments/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    console.log('Searching for doctorId:', doctorId);
    
    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name') // Get patient name
      .sort({ date: 1, time: 1 }); // Sort by date and time
    
    console.log('Found appointments:', appointments);

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: err.stack 
    });
  }
});


// Get all patients for a doctor
router.get('/patients/:doctorId', async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    console.log('Fetching patients for doctor:', doctorId);

    // Find all appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email phone') // Get patient details
      .lean(); // Convert to plain JavaScript object

    console.log('Found appointments:', appointments);

    // Extract unique patients from appointments
    const uniquePatients = Array.from(
      new Map(
        appointments.map(app => [
          app.patient._id.toString(),
          app.patient
        ])
      ).values()
    );

    console.log('Unique patients:', uniquePatients);
    res.json(uniquePatients);

  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      stack: err.stack 
    });
  }
});

router.post('/upload-transcript', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const newTranscript = new Transcript({
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename
    });

    await newTranscript.save();

    res.status(201).json({
      message: 'Transcript uploaded successfully',
      transcript: {
        _id: newTranscript._id,
        imageUrl: newTranscript.imageUrl,
        createdAt: newTranscript.createdAt
      }
    });
  } catch (error) {
    console.error('Error uploading transcript:', error);
    // If there's an error, delete the uploaded image from Cloudinary
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    res.status(500).json({ message: 'Error uploading transcript' });
  }
});

// Get transcripts for a specific patient
router.get('/transcript/:patientId/:doctorId', async (req, res) => {  // Changed route pattern
  try {
    const transcripts = await Transcript.find({
      patientId: req.params.patientId,
      doctorId: req.params.doctorId
    }).sort({ createdAt: -1 });

    if (!transcripts || transcripts.length === 0) {  // Added null check
      return res.status(404).json({ message: 'No transcripts found' });
    }

    res.json({
      transcriptUrl: transcripts[0].imageUrl,
      createdAt: transcripts[0].createdAt
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ message: 'Error fetching transcript' });
  }
});


module.exports = router;