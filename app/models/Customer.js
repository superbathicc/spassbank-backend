const mongoose = require('mongoose');

/**
 * @typedef Properties
 * @property {String} hash
 * @property {String} username
 * @property {String} password
 * @property {Object} name
 * @property {String} name.first
 * @property {String} name.last
 * @property {Number} dateOfBirth
 * @property {Object} address
 * @property {String} address.country
 * @property {String} address.city
 * @property {String} address.postcode
 * @property {String} address.street
 * @property {String} address.houseNumber
 */

let customerSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true
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
});

module.exports = mongoose.model("Customer", customerSchema)