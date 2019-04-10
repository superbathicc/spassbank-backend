const Employee = require('../../models/Employee');

async function getById(id) {
  let q = Employee.findById(id);
  return await q.exec();
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

function router(app) {
  app.get('/api/employee/:employeeId', handleGetEmployee);
}

module.exports = {
  router,

  handleGetEmployee,
  
  getById
}