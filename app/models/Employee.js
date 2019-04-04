const mongoose = require('mongoose');

let employeeSchema = new mongoose.Schema({
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
  userName: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  }
});