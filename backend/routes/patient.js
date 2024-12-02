const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor'); // Assuming you have a Doctor model
const Session = require('../models/Session');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Transcript = require('../models/Transcript');
router.use(express.json());

// Add this new route at the top of your routes
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Route to get the total number of doctors for the patient dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    res.status(200).json({ totalDoctors });
  } catch (error) {
    console.error('Error fetching total doctors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/doctors', async (req, res) => {
    try {
      const doctors = await Doctor.find();
      res.status(200).json(doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/sessions/:doctorId', async (req, res) => {
    try {
      const doctorId = req.params.doctorId;
      const sessions = await Session.find({ doctor: doctorId, isBooked: false }) // Find unbooked sessions
      .populate('doctor', 'name specialty');
      res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });


router.post('/book-session', async (req, res) => {
  const { sessionId, patientId } = req.body;

  try {
    // Add input validation
    if (!sessionId || !patientId) {
      return res.status(400).json({ error: 'SessionId and patientId are required' });
    }

    // Find the session and populate doctor information
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Populate doctor info after confirming session exists
    await session.populate('doctor', 'name specialty');
    
    if (session.isBooked) {
      return res.status(400).json({ error: 'This session is already booked' });
    }

    // Find the patient
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Create appointment first to ensure it's valid
    const appointment = new Appointment({
      patient: patientId,
      doctor: session.doctor._id,
      session: sessionId,
      date: session.date,
      time: session.time
    });
    await appointment.save();

    // Update session only after appointment is created
    session.isBooked = true;
    await session.save();

    res.status(200).json({ 
      message: 'Session booked successfully', 
      appointment: appointment 
    });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});



  // Update the my-bookings endpoint
router.get('/my-bookings/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const bookings = await Appointment.find({ patient: patientId })
      .populate('doctor')
      .populate('session');

    // Filter out bookings with deleted doctors or sessions
    const validBookings = bookings.map(booking => {
      if (!booking.doctor || !booking.session) {
        // You might want to automatically cancel these bookings
        handleInvalidBooking(booking._id);
      }
      return booking;
    });

    res.json(validBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});

// Helper function to handle invalid bookings
async function handleInvalidBooking(bookingId) {
  try {
    await Appointment.findByIdAndDelete(bookingId);
    console.log(`Deleted invalid booking: ${bookingId}`);
  } catch (error) {
    console.error(`Error deleting invalid booking ${bookingId}:`, error);
  }
}

// Update the cancel-booking endpoint to handle missing references
router.post('/cancel-booking/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { patientId } = req.body;

    const appointment = await Appointment.findOne({
      session: sessionId,
      patient: patientId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If the session exists, update it
    if (appointment.session) {
      await Session.findByIdAndUpdate(sessionId, { isBooked: false });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(appointment._id);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Error cancelling booking' });
  }
});

// Get all transcripts for a patient
router.get('/transcripts/:userId', async (req, res) => {
  try {
    const transcripts = await Transcript.find({ 
      patientId: req.params.userId,
      // Add status check to ensure document is approved/published
      status: 'published'
    })
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name')
      .select('imageUrl createdAt type title'); // Add type and title fields

    if (!transcripts) {
      return res.status(404).json({ message: 'No records found' });
    }

    // Format the response with more detailed information
    const formattedTranscripts = transcripts.map(transcript => ({
      _id: transcript._id,
      doctorName: transcript.doctorId?.name || 'Unknown Doctor',
      documentUrl: transcript.imageUrl,
      type: transcript.type, // 'medical_record' or 'transcript'
      title: transcript.title,
      createdAt: transcript.createdAt
    }));

    res.json(formattedTranscripts);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ message: 'Error fetching medical records and transcripts' });
  }
});

// Get a specific transcript
router.get('/transcript/:transcriptId', async (req, res) => {
  try {
    const transcript = await Transcript.findOne({
      _id: req.params.transcriptId,
      patientId: req.params.userId, // Changed from req.user.id to req.params.userId
      status: 'published'
    }).populate('doctorId', 'name');

    if (!transcript) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      _id: transcript._id,
      doctorName: transcript.doctorId?.name || 'Unknown Doctor',
      documentUrl: transcript.imageUrl,
      type: transcript.type,
      title: transcript.title,
      createdAt: transcript.createdAt
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
});
  

module.exports = router;
