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

// ... existing code ...

router.post('/upload-transcript', upload.single('file'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate request body
    if (!req.body.patientId || !req.body.doctorId) {
      // If there's an uploaded file, delete it from Cloudinary
      if (req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
    }

    // Log the received data
    console.log('Received file:', req.file);
    console.log('Received data:', req.body);

    // Create new transcript
    const newTranscript = new Transcript({
      patientId: req.body.patientId,
      doctorId: req.body.doctorId,
      imageUrl: req.file.path,
      cloudinaryId: req.file.filename,
      fileType: req.file.mimetype,
      fileName: req.file.originalname
    });

    // Save to database
    const savedTranscript = await newTranscript.save();
    console.log('Saved transcript:', savedTranscript);

    // Send success response
    res.status(201).json({
      message: 'Transcript uploaded successfully',
      transcript: {
        _id: savedTranscript._id,
        imageUrl: savedTranscript.imageUrl,
        createdAt: savedTranscript.createdAt,
        fileName: savedTranscript.fileName
      }
    });

  } catch (error) {
    console.error('Error in upload-transcript:', error);
    
    // Clean up: Delete file from Cloudinary if there was an error
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
      }
    }

    // Send appropriate error response
    res.status(500).json({ 
      message: 'Error uploading transcript',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/transcripts/:patientId/:doctorId', async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    
    const transcripts = await Transcript.find({
      patientId: patientId,
      doctorId: doctorId,
      status: { $in: ['published', undefined] }
    })
    .sort({ createdAt: -1 }) 
    .select('imageUrl createdAt type title status');

   
    const formattedTranscripts = transcripts.map(transcript => ({
      _id: transcript._id,
      documentUrl: transcript.imageUrl,
      type: transcript.type || 'Medical Document',
      title: transcript.title || 'Medical Record',
      createdAt: transcript.createdAt,
      status: transcript.status || 'published'
    }));

    res.json(formattedTranscripts); 

  } catch (error) {
    console.error('Error fetching transcripts:', error);
    res.status(500).json({ 
      message: 'Error fetching transcripts',
      error: error.message 
    });
  }
});


module.exports = router;