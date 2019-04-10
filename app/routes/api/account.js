const Account = require('../../models/Account');
const crypto = require('crypto')
const customerApi = require('./customer');
const atmApi = require('./atm');
const transactionApi = require('./transaction');

async function getById(id) {
  var q = Account.findById(id);
  return await q.exec();
}

async function getOneByHash(hash) {
  var q = Account.findOne({
    hash: hash
  });
  return q.exec();
}

async function getOneByAccountIdAndPassword(accountId, password) {
  let q = Account.findOne({
    accountId,
    password
  });
  return await q.exec();
}

async function getOneByNumber(accountNumber) {
  let q = Account.findOne({
    accountId: accountNumber
  });
  return await q.exec();
}

async function create(password, customer) {
  let account = new Account({
    password: crypto.createHash('sha256').update(password).digest('hex'),
    customer: cusomter._id
  });

  let created = await account.save();

  created.hash = crypto.createHash('sha256').update([
    created.accountId,
    created.password
  ].join('|')).digest('hex');

  return await created.save();
}

async function deposit(account, items, atmId) {
  if(typeof account == 'object' && account instanceof Account) {
    account.balance += await atmApi.deposit(await atmApi.getById(atmId), items);
    return await account.save();
  } else {
    throw new TypeError("account was not an Account");
  }
}

async function withdraw(account, amount, atmId) {
  if(typeof account == 'object' && account instanceof Account) {
    account.balance -= await atmApi.withdraw(await atmApi.getById(atmId), amount);
    return await account.save();
  } else {
    throw new TypeError("account was not an Account");
  }
}

async function transaction(sender, target, amount) {
  if(typeof sender == 'object' && sender instanceof Account
  && typeof target == 'object' && target instanceof Account) {
    if(amount > 0) {
      sender.balance -= amount;
      target.balance += amount;
      
      sender = await sender.save();
      target = await target.save();

      return await transactionApi.create(sender, target, amount);
    } else throw new Error("amount must be positive");
  }
}

async function handleGetAccount(req, res) {
  if(req.session["Account"] || req.session["Admin"]) {
    try {
      res.status(200).json(await getById(req.params.accountId));
    } catch(err) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
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

async function handlePostAccount(req, res) {
  let customer = customerApi.getByUsername(customer);
  if(customer) {
    try {
      let created = await create(req.body.password, req.body.customerHash);

      res.status(201).json(await created.save())
    } catch (err) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

async function handlePostAccountTransaction(req, res) {
  if(typeof req.session["Account"] == 'object' && req.session["Account"] instanceof Account) {
    if(typeof req.body.accountNumber == 'number' && typeof req.body.amount == 'number') {
      try {
        let target = await getOneByNumber(req.body.accountNumber);
        res.status(201).json(await transactionApi.create(req.session["Account"], target, amount))
      } catch(err) {
        res.sendStatus(500);
      }
    }
  }
}

function router(app) {
  app.get('/api/account/:accountId', handleGetAccount);
  app.post('/api/login/account', handlePostLoginAccount);
  app.post('/api/account', handlePostAccount);
  app.post('/api/account/transaction', handlePostAccountTransaction);
}

module.exports = {
  router,

  handleGetAccount,
  handlePostLoginAccount,

  create,
  deposit,
  withdraw,
  transaction,
  getById,
  getOneByHash
}