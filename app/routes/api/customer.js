const Customer = require('../../models/Customer');
const queryTools = require('../../lib/tools').query;

async function getById(id, options) {
  var q = Customer.findById(id);
  q.populate("accounts");
  q = await queryTools.handleOptions(q, options);
  return await q.exec();
}

function router(app) {
  app.get('')
}

module.exports = {
  router, 


  getById
}