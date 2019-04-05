const mongoose = require('mongoose');

let accountSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  hash: {
    type: String
  }
});

module.exports = mongoose.model("Account", accountSchema);