const mongoose = require('mongoose');

let customerSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true
    },
    last: {
      type: String,
      required: true
    }
  },
  dateOfBirth: {
    type: Number,
    required: false
  },
  address: {
    country: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    postcode: {
      type: String,
      required: false
    },
    street: {
      type: String,
      required: false
    },
    houseNumber: {
      type: String,
      required: false
    }
  },
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account"
  }]
});

module.exports = mongoose.model("Customer", customerSchema)