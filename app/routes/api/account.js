const Account = require('../../models/Account');
const query = require('../../lib/tools').query;

async function getById(id, options) {
  var q = Account.findById(id);
  q = await query.handleOptions(q, options);
  return await query.execute(q, options);
}

async function getOneByHash(hash, options) {
  var q = Account.findOne({
    hash: hash
  });
  q = await query.handleOptions(q, options);
  return await query.execute(q, options);
}

async function handleGetAccount(req, res) {
  try {
    res.status(200).json(await getById(req.params.accountId));
  } catch(err) {
    res.status(500).json(err);
  }
}

async function handlePostLoginAccount(req, res) {
  try {
    var acc = await getById(req.body.accountId);
  } catch(err) {
    res.status(500).json(err);
  }
}

function router(app) {
  app.get('/api/account/:accountId', handleGetAccount);
  app.post('/api/login/account', handlePostLoginAccount);
}

module.exports = {
  router,

  handleGetAccount,
  handlePostLoginAccount,

  getById,
  getOneByHash
}