const mongoose = require('mongoose');

/**
 * @typedef {Object} Properties
 * @property {Object} name
 * @property {String} name.first
 * @property {String} name.last
 * @property {String} username
 * @property {String} password
 * @property {String} hash
 */

let employeeSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: false
    },
    last: {
      type: String,
      required: false
    }
  },
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
});

module.exports = mongoose.model("Employee", employeeSchema);