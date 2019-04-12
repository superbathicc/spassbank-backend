const mongoose = require('mongoose');

let atmModel = new mongoose.Schema({
  password: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  hash: {
    type: String,
    required: false
  },
  status: {
    maintenanceRequired: {
      type: Boolean,
      required: true,
      default: false,
    }
  },
  inventory: {
    "1ct": {
      type: Number,
      default: 0,
      max: 500
    },
    "2ct": {
      type: Number,
      default: 0,
      max: 500
    },
    "5ct": {
      type: Number,
      default: 0,
      max: 500
    },
    "10ct": {
      type: Number,
      default: 0,
      max: 500,
    },
    "20ct": {
      type: Number,
      default: 0,
      max: 500,
    },
    "50ct": {
      type: Number,
      default: 0,
      max: 500
    },
    "1eur": {
      type: Number,
      default: 0,
      max: 500
    },
    "2eur": {
      type: Number,
      default: 0,
      max: 500
    },
    "5eur": {
      type: Number,
      default: 100,
      max: 250
    },
    "10eur": {
      type: Number,
      default: 100,
      max: 250
    },
    "20eur": {
      type: Number,
      default: 100,
      max: 250
    },
    "50eur": {
      type: Number,
      default: 100,
      max: 250
    },
    "100eur": {
      type: Number,
      default: 100,
      max: 250
    },
    "200eur": {
      type: Number,
      default: 100,
      max: 250
    },
  }
})

module.exports = mongoose.model("ATM", atmModel);