const Account = require('../../models/Account');
const Customer = require('../../models/Customer');
const crypto = require('crypto')
const customerApi = require('./customer');
const atmApi = require('./atm');
const transactionApi = require('./transaction');
const money = require('../../../config/money');

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

async function create(password, customerHash) {
  let customer = await customerApi.getByHash(customerHash);

  let account = new Account({
    password: crypto.createHash('sha256').update(password).digest('hex'),
    customer: customer._id
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
    if(account.balance > amount) {
      let atm = await atmApi.getById(atmId);
      let withdrawn = atmApi.withdraw(atm, amount);
      account.balance -= Object.keys(withdrawn)
      .map(key => withdrawn[key] * money[key].value)
      .reduce((a, b) => a + b, 0);
      acount = await account.save();
      return withdrawn;
    } else throw new Error("Cannot withdraw more than there is on this account.");
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
  let customer = await customerApi.getByUsername(req.body.customerHash);
  if(customer) {
    try {
      let created = await create(req.body.password, req.body.customerHash);

      res.status(201).json(await created.save());
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

async function handlePostAccountTransaction(req, res) {
  if(typeof req.session["Account"] == 'object' && req.session["Account"] instanceof Account) {
    if(typeof req.body.accountNumber == 'string' && typeof req.body.amount == 'number') {
      try {
        let target = await getOneByNumber(Number(req.body.accountNumber));
        res.status(201).json(await transactionApi.create(req.session["Account"], target, amount))
      } catch(err) {
        res.sendStatus(500);
      }
    }
  } else res.sendStatus(500);
}

async function handlePostAccountWithdraw(req, res) {
  if(typeof req.session["Account"] == 'object' && req.session["Account"] instanceof Account) {
    if(req.body.amount && Number(req.body.amount)) {
      if(req.body.atmId) {
        try {
          res.status(200).json(await withdraw(req.session["Account"], Number(req.body.amount), req.body.atmId));
        } catch (err) {
          console.log(err);
          res.sendStatus(500);
        }
      } else res.sendStatus(400);
    } else res.sendStatus(400);
  } else res.sendStatus(500);
}

async function handlePostAccountDeposit(req, res) {
  if(typeof req.session["Account"] == 'object' && req.session["Account"] instanceof Account) {
    if(typeof req.body.items == 'object') {
      if(req.body.atmId) {
        try {
          res.status(200).json(await deposit(req.session["Account"], req.body.items, req.body.atmId));
        } catch (err) {
          console.log(err);
          res.sendStatus(500);
        }
      } else res.sendStatus(400);
    } else res.sendStatus(400);
  } else res.sendStatus(500);
}

async function handleGetAccounts(req, res) {
  var q = Account.find();

  if(req.session["Admin"] || req.session["Employee"]) {
    if(req.query.customer) {
      q.where("customer").equals(mongoose.Types.ObjectId(req.query.customer));
    }
  }

  if(req.session["Customer"]) {
    q.where("customer").equals(req.session["Customer"]._id);
  }

  res.status(200).json(await q.exec());
}

function router(app) {
  app.get('/api/account/:accountId', handleGetAccount);
  app.get('/api/account', handleGetAccounts);
  app.post('/api/login/account', handlePostLoginAccount);
  app.post('/api/account', handlePostAccount);
  app.post('/api/account/transaction', handlePostAccountTransaction);
  app.post('/api/account/withdraw', handlePostAccountWithdraw);
  app.post('/api/account/deposit', handlePostAccountDeposit);
}

module.exports = {
  router,

  handleGetAccount,
  handlePostLoginAccount,
  handlePostAccount,
  handlePostAccountTransaction,
  handlePostAccountWithdraw,
  handlePostAccountDeposit,

  create,
  deposit,
  withdraw,
  transaction,
  getById,
  getOneByHash
}