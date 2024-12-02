const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    specialty: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false }, // Session availability
});
  
  module.exports = mongoose.model('Session', sessionSchema);
  