let accountApi = require('../routes/api/account');
let customerApi = require('../routes/api/customer');
let employeeApi = require('../routes/api/employee');
let adminApi = require('../routes/api/admin');

[accountApi, customerApi, employeeApi, adminApi].forEach(api => console.log(api));

function parseHeader(req) {
  var h = req.get('Authorization');
  if(typeof h == 'string') {
    var result = {};
    h.split(',').map(hs => {
      var arr = hs.split(' ').filter(_ => _ !== "");
      var key = arr.shift();
      var value = arr.shift();
      return {key, value};
    }).forEach(hs => {
      result[hs.key] = hs.value;
    });
    return result;
  } else {
    throw new TypeError("Authorization header was not a String");
  }
}

async  function checkAccountAuth(req, res, next) {
  try {
    var auth = parseHeader(req);
    if(typeof auth["Account"] == 'string') {
      var account = await accountApi.getOneByHash(auth["Account"]);
      if(account) {
        req.session.account = account;
        next()
      } else {
        res.sendStatus(401);
      }
    }
  } catch(err) {
    if(req.session.account) {
      var account = await accountApi.getOneByHash(req.session.account.hash);
      if(account) {
        req.session.account = account;
        next();
      } else {
        res.sendStatus(401);
      }
    }
  }
}

async function checkCustomerAuth(req, res, next) {
  try {
    var auth = parseHeader(req);
    if(typeof auth["Customer"] == 'string') {
      var customer = await customerApi.getOneByHash(auth["Customer"]);
      if(customer) {
        req.session.customer = customer;
        next()
      } else {
        res.sendStatus(401);
      }
    }
  } catch(err) {
    if(req.session.customer) {
      var customer = await customerApi.getOneByHash(req.session.customer.hash);
      if(customer) {
        req.session.customer = customer;
        next();
      } else {
        res.sendStatus(401);
      }
    }
  }
}

async function checkEmployeeAuth(req, res, next) {
  try {
    var auth = parseHeader(req);
    if(typeof auth["Employee"] == 'string') {
      var employee = await employeeApi.getOneByHash(auth["Employee"]);
      if(employee) {
        req.session.employee = employee;
        next()
      } else {
        res.sendStatus(401);
      }
    }
  } catch(err) {
    if(req.session.employee) {
      var employee = await employeeApi.getOneByHash(req.session.employee.hash);
      if(employee) {
        req.session.employee = employee;
        next();
      } else {
        res.sendStatus(401);
      }
    }
  }
}

async function checkAdminAuth(req, res, next) {
  console.log('loooooog')
  try {
    var auth = parseHeader(req);
    if(typeof auth["Employee"] == 'string') {
      var admin = await adminApi.getOneByHash(auth["Employee"]);
      if(admin) {
        req.session.admin = admin;
        next()
      } else {
        res.sendStatus(401);
      }
    }
  } catch(err) {
    if(req.session.admin) {
      var admin = await adminApi.getOneByHash(req.session.admin.hash);
      if(admin) {
        req.session.admin = admin;
        next();
      } else {
        res.sendStatus(401);
      }
    }
  }
}

module.exports = {
  checkAccountAuth,
  checkCustomerAuth,
  checkEmployeeAuth,
  checkAdminAuth
}