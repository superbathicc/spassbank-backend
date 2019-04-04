const mongoose = require('mongoose');

let accountSchema = new mongoose.Schema({
  pinHash: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Account", accountSchema);