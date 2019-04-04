const mongoose = require('mongoose');

let atmModel = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  maintenanceRequired: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model("ATM", atmModel);