const mongoose = require('mongoose');

let transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  },
  amount: {
    type: Number,
  },
  time: {
    type: Number,
    default: function() {
      return new Date().getTime()
    }
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);