const mongoose = require('mongoose');

let atmModel = new mongoose.Schema({
  password: {
    type: String,
    required: true
  },
  status: {
    maintenanceRequired: {
      type: Boolean,
      required: true
    },
    contains: {
      "1ct": {
        type: Number
      },
      "2ct": {
        type: Number
      },
      "5ct": {
        type: Number
      },
      "10ct": {
        type: Number
      },
      "20ct": {
        type: Number
      },
      "50ct": {
        type: Number
      },
      "1€": {
        type: Number
      },
      "2€": {
        type: Number
      },
      "5€": {
        type: Number
      },
      "10€": {
        type: Number
      },
      "20€": {
        type: Number
      },
      "50€": {
        type: Number
      },
      "100€": {
        type: Number
      },
      "200€": {
        type: Number
      },
      "500€": {
        type: Number
      }
    }
  }
})

module.exports = mongoose.model("ATM", atmModel);