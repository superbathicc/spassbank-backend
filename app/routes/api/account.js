const Account = require('../../models/Account');
// eslint-disable-next-line no-unused-vars
const Customer = require('../../models/Customer');
const crypto = require('crypto');
const customerApi = require('./customer');
const atmApi = require('./atm');
const transactionApi = require('./transaction');
const money = require('../../../config/money');
const mongoose = require('mongoose');

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
  if(typeof customer == 'object' && customer instanceof customerApi.Customer) {
    console.log(customer);
  } else if(typeof customer == 'string') {
    customer = await customerApi.getByHash(customer) || await customerApi.getById(customer);
  }

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

async function deposit(account, items, atmId, fuckThis) {
  if(typeof account == 'object' && account instanceof Account || fuckThis) {
    let deposited =  await atmApi.deposit(await atmApi.getById(atmId), items);
    if(!fuckThis) {
      account.balance += deposited;
      return await account.save();
    } else { return null; }
  } else {
    throw new TypeError('account was not an Account');
  }
}

async function withdraw(account, amount, atmId) {
  if(typeof account == 'object' && account instanceof Account) {
    if(account.balance > amount) {
      let atm = await atmApi.getById(atmId);
      let withdrawn = await atmApi.withdraw(atm, amount);
      account.balance -= withdrawn
        .map(w => w.amount * money[w.unit].value)
        .reduce((a, b) => a + b, 0);
      account = await account.save();
      return withdrawn;
    } else throw new Error('Cannot withdraw more than there is on this account.');
  } else {
    throw new TypeError('account was not an Account');
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
    } else throw new Error('amount must be positive');
  }
}

async function handleGetAccount(req, res) {
  if(req.session['Account'] || req.session['Admin']) {
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
        req.session['Account'] = account;
        res.status(200).json(account);
      } else res.sendStatus(401);
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

async function handlePostAccount(req, res) {
  console.log(req.body);

  /** @type {customerApi.Customer.Properties} */
  let customer = await customerApi.getByHash(req.body.customerHash) || await customerApi.getById(req.body.customerId);

  console.log(customer);
  if(customer) {
    try {
      let created = await create(req.body.password, customer);

      created.balance = req.body.balance;

      created = await created.save();

      console.log(created);

      res.status(200).json(created);
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

async function handlePostAccountTransaction(req, res) {
  if(typeof req.session['Account'] == 'object' && req.session['Account'] instanceof Account) {
    if(typeof req.body.accountNumber == 'string' && typeof req.body.amount == 'number') {
      try {
        let target = await getOneByNumber(Number(req.body.accountNumber));
        res.status(201).json(await transactionApi.create(req.session['Account'], target, req.body.amount));
      } catch(err) {
        res.sendStatus(500);
      }
    }
  } else res.sendStatus(500);
}

async function handlePostAccountWithdraw(req, res) {
  let account = await getOneByHash(req.body.accountHash) || await Account.findById(req.body.accountId).exec();
  if(req.body.amount && Number(req.body.amount)) {
    if(req.body.atmId) {
      try {
        res.status(200).json(await withdraw(account, Number(req.body.amount), req.body.atmId));
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
    } else res.sendStatus(400);
  } else res.sendStatus(400);
}

async function handlePostAccountDeposit(req, res) {
  let account = await getOneByHash(req.body.accountHash);
  if(typeof req.body.items == 'object') {
    if(req.body.atmId) {
      try {
        res.status(200).json(await deposit(account, req.body.items, req.body.atmId, typeof req.session['Employee'] == 'object'));
      } catch (err) {
        console.log(err);
        res.sendStatus(500);
      }
    } else res.sendStatus(400);
  } else res.sendStatus(400);
}

async function handleGetAccounts(req, res) {
  var q = Account.find();

  if(req.session['Admin'] || req.session['Employee']) {
    if(req.query.customer) {
      q.where('customer').equals(mongoose.Types.ObjectId(req.query.customer));
    }
  }

  if(req.session['Customer']) {
    q.where('customer').equals(req.session['Customer']._id);
  }

  res.status(200).json(await q.exec());
}

async function handleGetMyAccounts(req, res) {
  if(typeof req.session['Customer'] == 'object') {
    try {
      let q = Account.find();
      q.where('customer', req.session['Customer']._id);
      let accounts = await q.exec();
      res.status(200).json(accounts);
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(401);
  }
}

function router(app) {
  app.get('/api/account/:accountId', handleGetAccount);
  app.get('/api/account', handleGetAccounts);
  app.post('/api/login/account', handlePostLoginAccount);
  app.post('/api/account', handlePostAccount);
  app.post('/api/account/transaction', handlePostAccountTransaction);
  app.post('/api/account/withdraw', handlePostAccountWithdraw);
  app.post('/api/account/deposit', handlePostAccountDeposit);
  app.get('/api/my-accounts', handleGetMyAccounts);
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
};