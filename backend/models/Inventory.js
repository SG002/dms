const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  medicineName: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0 
  },
  expirationDate: { 
    type: Date, 
    required: true 
  },
  lastUpdated: { 
    type: Date,
    default: Date.now 
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Inventory', inventorySchema);