const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const router = express.Router();
require('dotenv').config();

// Register route remains the same until the JWT generation
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  const validRoles = ['admin', 'doctor', 'patient'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role specified' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    await user.save();

    // Modified JWT payload to use toString() for the user ID
    const payload = {
      userId: user._id.toString(),
      role: user.role
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send back user details with stringified ID
    res.json({
      token,
      role: user.role,
      userId: user._id.toString()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      // Modified JWT payload to use toString() for the user ID
      const payload = {
        userId: user._id.toString(),
        role: user.role
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({
        token,
        role: user.role,
        userId: user._id.toString()
      });
    }

    // If using Doctor schema, modify this part similarly
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const payload = {
        doctorId: doctor._id.toString(),
        role: 'doctor'
      };
      
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({
        token,
        role: 'doctor',
        userId: doctor._id.toString()
      });
    }

    return res.status(400).json({ msg: 'Invalid credentials' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;