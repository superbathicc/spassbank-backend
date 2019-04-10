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

async function getOneByAccountIdAndPassword(accountId, password) {
  let q = Account.findOne({
    accountId,
    password
  });
  return await q.exec();
}

async function handleGetAccount(req, res) {
  try {
    res.status(200).json(await getById(req.params.accountId));
  } catch(err) {
    res.status(500).json(err);
  }
}

async function handlePostLoginAccount(req, res) {
  if(!req.body) res.sendStatus(400);
  if(req.body.accountId && req.body.password) {
    try {
      let account = await getOneByAccountIdAndPassword(
        req.body.accountId,
        crypto.createHash('sha256').update(req.body.password).digest('hex')
      );
      if(account) {
        req.session["Account"] = account;
        req.status(200).json(account);
      }
    } catch(err) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

function router(app) {
  let auth = require('../../lib/auth');

  app.get('/api/account/:accountId', auth.checkAdminAuth, auth.checkAccountAuth, handleGetAccount);
  app.post('/api/login/account', handlePostLoginAccount);
}

module.exports = {
  router,

  handleGetAccount,
  handlePostLoginAccount,

  getById,
  getOneByHash
}