const Admin = require('../../models/Admin');
const crypto = require('crypto');

async function getById(id) {
  let q = Admin.findById(id);
  return await q.exec();
}

async function getOneByHash(hash) {
  let q = Admin.findOne({
    hash
  });
  return await q.exec();
}

async function getOneByUsernameAndPassword(username, password) {
  let q = Admin.findOne({
    username,
    password
  });
  return await q.exec();
}

async function create(username, password) {
  let admin = new Admin({
    username: username,
    password: crypto.createHash('sha256').update(password).digest('hex')
  });

  admin.hash = crypto.createHash('sha256').update([
    admin.username,
    admin.password
  ].join('|')).digest('hex');

  admin = await admin.save();
  return admin;
}

async function handleGetAdmin(req, res) {
  if(req.params.adminId) {
      getById(req.params.adminId)
      .then(admin => {
        res.status(200).json(admin)
      }).catch(err => {
        console.log(err);
        res.sendStatus(404);
      })
  } else {
    res.sendStatus(400)
  }
}

async function handlePostAdmin(req, res) {
  if(req.body.username && req.body.password) {
    let admin = await create(req.body.username, req.body.password);
    res.status(201).json(admin);
  } else {
    res.sendStatus(400);
  }
}

async function handlePostLoginAdmin(req, res) {
  if(!req.body) res.sendStatus(400);
  if(req.body.username && req.body.password) {
    try {
      let admin = await getOneByUsernameAndPassword(
        req.body.username,
        crypto.createHash('sha256').update(req.body.password).digest('hex')
      );
      if(admin) {
        req.session["Admin"] = admin;
        res.status(200).json(admin);
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

function router(app) {
  let auth = require('../../lib/auth');

  app.get('/api/admin/:adminId', auth.checkAdminAuth, handleGetAdmin);
  app.post('/api/admin', auth.checkAdminAuth, handlePostAdmin);
  app.post('/api/login/admin', handlePostLoginAdmin);
}

new Promise(async (resolve) => {
  if(await Admin.countDocuments().exec() <= 0) {
    resolve(await create("admin", "$admin0!"));
  }
}).then(admin => {
  console.log('created admin', admin);
}).catch(err => {
  console.error(err);
});

module.exports = {
  router,
  
  handleGetAdmin,
  handlePostAdmin,
  handlePostLoginAdmin,
  
  create,
  getById,
  getOneByHash,
  getOneByUsernameAndPassword
};

