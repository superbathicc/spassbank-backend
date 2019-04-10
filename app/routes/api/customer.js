const Customer = require('../../models/Customer');

async function getById(id) {
  let q = Customer.findById(id);
  q.populate("accounts");
  return await q.exec();
}

async function getByUsername(username) {
  let q = Customer.findOne({
    username
  });
  return q.exec;
}

function router(app) {
}

module.exports = {
  router, 


  getById,
  getByUsername
}