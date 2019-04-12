const mongoose = require('mongoose');

let accountSchema = new mongoose.Schema({
  accountId: {
    type: Number,
    default: function() {
      return Math.floor(Math.random()*9*1000*1000*1000) + 1*1000*1000*1000 - 1
    },
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: false,
    default: 0
  },
  hash: {
    type: String,
    required: false
  },
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "Customer",
    required: true
  }
});

module.exports = mongoose.model("Account", accountSchema);