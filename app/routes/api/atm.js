const ATM = require('../../models/ATM');
const crypto = require('crypto');

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

}

async function deposit(atm, items) {
  if(typeof atm == 'object' && atm instanceof ATM) {
    ["1ct", "2ct", "5ct", "10ct", "20ct", "50ct", "1€", "2€",
    "5€", "10€", "20€", "50€", "100€", "200€"].forEach(t => {
      atm.state.contains[t] += items[t];
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
}