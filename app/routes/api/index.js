const accountApi = require('./account');
const adminApi = require('./admin');
const atmApi = require('./atm');
const customerApi = require('./customer');
const employeeApi = require('./employee');
const transactionApi = require('./transaction');

module.exports = function(app) {
  accountApi.router(app);
  adminApi.router(app);
  atmApi.router(app);
  customerApi.router(app);
  employeeApi.router(app);
  transactionApi.router(app);
}