const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  specialty: { type: String, required: true },
  password: { type: String, required: true }, // Password will be stored as a hash
});

module.exports = mongoose.model('Doctor', doctorSchema);
