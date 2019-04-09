const accountApi = require('../routes/api/account');
const customerApi = require('../routes/api/customer');
const employeeApi = require('../routes/api/employee');
const adminApi = require('../routes/api/admin');

[accountApi, customerApi, employeeApi, adminApi].forEach(api => console.log(api));

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

function getCheckAuthFunction(key, api) {
  return async function(req, res, next) {
    try {
      let auth = parseHeader(req);
      if(typeof auth[key] == 'string') {
        let _ = await api.getOneByHash(auth[key]);
        if(_) {
          req.session[key] = _;
          next()
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(401);
      }
    } catch(err) {
      if(req.session[key]) {
        let _ = await api.getOneByHash(req.session[key].hash);
        if(admin) {
          req.session[key] = _;
          next();
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(401);
      }
    }
  }
}

module.exports = {
  checkAccountAuth: getCheckAuthFunction("Account", accountApi),
  checkCustomerAuth: getCheckAuthFunction("Customer", customerApi),
  checkEmployeeAuth: getCheckAuthFunction("Employee", employeeApi),
  checkAdminAuth: getCheckAuthFunction("Admin", adminApi)
}