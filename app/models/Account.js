const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

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
  },
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "Customer",
    required: true
  }
});

accountSchema.plugin(AutoIncrement, {inc_field: 'accountId'});

module.exports = mongoose.model("Account", accountSchema);