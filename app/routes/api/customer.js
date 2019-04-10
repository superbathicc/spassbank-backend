const Customer = require('../../models/Customer');
const crypto = require('crypto');

async function getById(id) {
  let q = Customer.findById(id);
  return await q.exec();
}

async function getByUsername(username) {
  let q = Customer.findOne({
    username
  });
  return q.exec;
}

async function getOneByUsernameAndPassword(username, password) {
  let q = Customer.findOne({
    username,
    password
  });
  return await q.exec();
}

/**
 * crates a new Customer
 * @param {Customer.Properties} properties 
 */
async function create(properties) {
  let customer = new Customer(properties);
  if(!customer.hash) {
    customer.hash = crypto.createHash('sha256').update([
      customer.username,
      customer.password
    ].join('|')).digest('hex');
  }
}

async function handlePostLoginCustomer(req, res) {
  if(!req.body) res.sendStatus(400);
  if(req.body.username && req.body.password) {
    try {
      let customer = await getOneByUsernameAndPassword(
        req.body.username,
        crypto.createHash('sha256').update(req.body.password).digest('hex')
      );
      if(customer) {
        req.session["Customer"] = customer;
        res.status(200).json(customer);
      } else {
        res.sendStatus(401);
      }
    } catch(err) {
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(400);
  }
}

async function handlePostCustomer(req, res) {
  if(req.body.username && req.body.password) {
    let admin = await create(req.body);
    res.status(201).json(admin);
  } else {
    res.sendStatus(400);
  }
}

async function handleGetCustomer(req, res) {
  if(req.params.customerId) {
    try {
      res.status(200).json(await getById(req.params.customerId));
    } catch(err) {
      res.sendStatus(500);
    }
  } else res.sendStatus(400);
}

function router(app) {
  app.get('/api/customer/:customerId', handleGetCustomer);
  app.post('/api/customer', handlePostCustomer);
  app.post('/api/login/customer', handlePostLoginCustomer);
}

module.exports = {
  router, 

  handlePostLoginCustomer,

  create,
  getById,
  getByUsername
}