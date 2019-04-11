const ATM = require('../../models/ATM');
const crypto = require('crypto');
const money = require("../../../config/money");

async function getById(id) {
  let q = ATM.findById(id);
  return await q.exec();
}

async function create(password, description) {
  let atm = new ATM({
    password: crypto.createHash('sha256').update(password).digest('hex'),
    description
  });

  let created = await atm.save();

  created.hash = crypto.createHash('sha256').update([
    created._id,
    created.password
  ].join('|'));

  return await created.save();
}

async function withdraw(atm, amount) {
  if(typeof atm === 'object' && atm instanceof ATM) {
    if(Object.keys(atm.inventory)
    .map(key => money[key].value * atm.inventory[key])
    .reduce((a, b) => a + b, 0) >= amount) {
      var result = money;
      Object.keys(money).sort((a,b) => money[b].value - money[a].value)
      .map(moneyKey => {
        let v = money[moneyKey].value;
        if(amount > v) {
          let needed = Math.trunc(amount / v);
          if(needed <= atm.inventory[moneyKey]) {
            atm.inventory[moneyKey] -= needed;
            amount -= needed * money[moneyKey].value;
            result[moneyKey] = needed;
          } else {
            let took = atm.inventory[moneyKey];
            atm.inventory[moneyKey] = 0;
            amount -= money[moneyKey].value * took;
            result[moneyKey] = took;
          }
        }
      });
      atm = await atm.save();
      return result;
    } else throw new Error("You cannot withdraw more money than stored in the atm")
  }
}

async function deposit(atm, items) {
  if(typeof atm == 'object' && atm instanceof ATM) {
    Object.keys(money).forEach(key => {
      atm.inventory[key] += items[key];
    });
  } else throw new TypeError("atm was not an ATM");
}

async function handleGetATM(req, res) {
  if(req.params.atmId) {
    res.status(200).json(await getById(req.params.atmId));
  } else res.sendStatus(400);
}

async function handleGetATMs(req, res) {
  let q = ATM.find();

  if(req.query.limit) {
    q.limit(Number(req.query.limit));
    if(req.query.page) {
      q.skip(Number(req.query.page));
    }
  }

  var result = await q.exec();
  res.status(200).json(result);
}

async function handlePostATM(req, res) {
  if(req.body && req.body.password) {
    let created = await create(req.body.password, req.body.description);
    res.status(201).json(created);
  } else {
    req.sendStatus(400);
  }
}

function router(app) {
  app.get('/api/atm/:atmId', handleGetATM);
  app.get('/api/atm', handleGetATMs);
  app.post('/api/atm', handlePostATM);
}

module.exports = {
  router,
  
  handleGetATM,
  handleGetATMs,
  handlePostATM,

  create,
  getById,
  deposit,
  withdraw
}