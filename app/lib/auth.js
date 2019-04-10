const accountApi = require('../routes/api/account');
const customerApi = require('../routes/api/customer');
const employeeApi = require('../routes/api/employee');
const adminApi = require('../routes/api/admin');

function parseHeader(req) {
  let h = req.get('Authorization');
  if(typeof h == 'string') {
    let result = {};
    h.split(',').map(hs => {
      let arr = hs.split(' ').filter(_ => _ !== "");
      let key = arr.shift();
      let value = arr.shift();
      return {key, value};
    }).forEach(hs => {
      result[hs.key] = hs.value;
    });
    return result;
  } else {
    throw new TypeError("Authorization header was not a String");
  }
}

/**
 * @typedef {Object} GetCheckAuthFuctionOptions
 * @property {Boolean} endOnFailure ends the request with a status code upon failure
 * 
 * @param {string} key 
 * @param {object} api 
 * @param {GetCheckAuthFuctionOptions} options 
 */
function getCheckAuthFunction(key, api, options) {
  return async function(req, res, next) {
    if(!req.auth) req.auth = {};
    try {
      let auth = parseHeader(req);
      if(typeof auth[key] == 'string') {
        let _ = await api.getOneByHash(auth[key]);
        if(_) {
          req.auth[key] = true;
          req.session[key] = _;
          next()
        } else {
          req.auth[key] = false;
          if(options && options.endOnFailure) res.sendStatus(401);
          else return next();
        }
      } else {
        req.auth[key] = false;
        if(options && options.endOnFailure) res.sendStatus(401);
        else return next();
      }
    } catch(err) {
      if(req.session[key]) {
        let _ = await api.getOneByHash(req.session[key].hash);
        if(_) {
          req.auth[key] = true;
          req.session[key] = _;
          next();
        } else {
          req.auth[key] = false;
          if(options && options.endOnFailure) res.sendStatus(401);
          else return next();
        }
      } else {
        req.auth[key] = false;
        if(options && options.endOnFailure) res.sendStatus(401);
        else return next();
      }
    }
  }
}

module.exports = {
  getCheckAuthFunction,
  checkAccountAuth:     getCheckAuthFunction("Account", accountApi)   || function(req, res, next) { next(); },
  checkCustomerAuth:    getCheckAuthFunction("Customer", customerApi) || function(req, res, next) { next(); },
  checkEmployeeAuth:    getCheckAuthFunction("Employee", employeeApi) || function(req, res, next) { next(); },
  checkAdminAuth:       getCheckAuthFunction("Admin", adminApi)       || function(req, res, next) { next(); },
}