const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  type: { type: String, enum: ['medical_record', 'transcript'], required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  cloudinaryId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transcript', transcriptSchema);