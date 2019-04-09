const adminApi = require('./admin');

module.exports = function(app) {
  adminApi.router(app);
}