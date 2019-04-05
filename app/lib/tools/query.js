const mongoose = require('mongoose');

/**
 * @callback QyeryExtensionCallback
 * @param {mongoose.Query} q the query object
 * 
 * @typedef {Object} QueryOptions
 * @property {QueryExtensionCallback} options.queryExtension 
 * a callback like function that can do stuff with the query
 * @property {Boolean} options.ensureDefined
 * throws not found when the result is undefined
 * @property {Number} options.limit
 * the maximum amount of results that may be returned in one go
 * @property {Number} options.page
 * the page of results     
 */

/**
 * handles all pre-execution query options
 * @param {mongoose.Query} query 
 * @param {QueryOptions} options 
 */
async function handleOptions(query, options) {
  if(!(typeof query == 'object')) {
    console.log(query);
    throw new TypeError("query was not a mongoose.Query");
  }
  // if(!(typeof options == 'object')) {
  //   throw new TypeError("options was not an Object");
  // }

  if(typeof options == 'object' && typeof options.queryExtension == 'function') {
    if(options.queryExtension.constructor.name == 'AsyncFunction') {
      await options.queryExtension(query);
    } else {
      var result = options.queryExtension(query);
      if(typeof result == 'object' && result instanceof Promise) {
        await result;
      }
    }
  }

  return query;
}

/**
 * executes the query and handles post execution options
 * @param {mongoose.Query} query 
 * @param {QueryOptions} options 
 */
async function execute(query, options) {
  if(!(typeof query == 'object' && query instanceof mongoose.Query)) {
    throw new TypeError("query is not a Query");
  }

  var result;
  try {
    result = await query.exec();
  } catch(err) {
    throw new Error("unable to execute query");
  }

  if(typeof options == 'object' && options.ensureDefined) {
    if(result) {
      return result;
    } else {
      throw new Error("document not found");
    }
  } else {
    return result;
  }
}

module.exports = {
  handleOptions,
  execute
}