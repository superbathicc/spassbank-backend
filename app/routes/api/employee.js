const Employee = require('../../models/Employee');
const crypto = require('crypto');

async function getById(id) {
  let q = Employee.findById(id);
  return await q.exec();
}

/**
 * creates a new employee
 * @param {Employee.Properties} properties 
 */
async function create(properties) {
  let employee = new Employee(properties);
  employee.hash = crypto.createHash('sha256').update([
    employee.username,
    employee.password
  ].join('|'))
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

function router(app) {
  app.get('/api/employee/:employeeId', handleGetEmployee);
  app.post('/api/employee', handlePostEmployee);
}

module.exports = {
  router,

  handleGetEmployee,
  
  getById
}