const Employee = require('../../models/Employee');
const crypto = require('crypto');

async function getById(id) {
  let q = Employee.findById(id);
  return await q.exec();
}

async function getByHash(hash) {
  let q = Employee.findOne({
    hash: hash
  });
  return await q.exec();
}

/**
 * creates a new employee
 * @param {Employee.Properties} properties
 */
async function create(properties) {
  delete properties._id;
  delete properties.hash;
  let employee = new Employee(properties);
  employee.hash = crypto.createHash('sha256').update([
    employee.username,
    employee.password
  ].join('|')).digest('hex');
  return await employee.save();
}

async function handleGetEmployee(req, res) {
  if(req.params.employeeId) {
    try {
      res.status(200).json(await getById(req.params.employeeId));
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else res.sendStatus(400);
}

async function handlePostEmployee(req, res) {
  if(req.body && req.body.username && req.body.password) {
    try {
      req.body.password = crypto.createHash('sha256').update(req.body.password).digest('hex');
      res.status(201).json(await create(req.body));
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else res.sendStatus(400);
}

async function handlePostLoginEmployee(req, res) {
  if(!req.body) res.sendStatus(400);
  if(req.body.username && req.body.password) {
    try {
      let employee = await getByHash(crypto.createHash('sha256').update([
        req.body.username,
        crypto.createHash('sha256').update(req.body.password).digest('hex')
      ].join('|')).digest('hex'));
      console.log(employee);
      if(employee) {
        req.session['Employee'] = employee;
        res.status(200).json(employee);
      } else {
        res.sendStatus(401);
      }
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else res.sendStatus(400);
}

async function handleGetEmployees(req, res) {
  try {
    var q = Employee.find();

    if(req.query.username) {
      q.where('username').regex(new RegExp(req.query.username));
    }

    res.status(200).json(await q.exec());
  } catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
}

function router(app) {
  let auth = require('../../lib/auth');

  app.get('/api/employee/:employeeId', handleGetEmployee);
  app.get('/api/employee', auth.checkAdminAuth, handleGetEmployees);
  app.post('/api/employee', auth.checkAdminAuth, handlePostEmployee);
  app.post('/api/login/employee', handlePostLoginEmployee);
}

module.exports = {
  router,

  handleGetEmployee,
  handlePostLoginEmployee,

  getById,
  getByHash,
  create
};