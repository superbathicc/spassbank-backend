const mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: false
  }
})

module.exports = mongoose.model("Admin", adminSchema);