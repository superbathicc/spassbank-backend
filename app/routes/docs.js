const path = require('path');
const fs = require('fs');

module.exports = function(app) {
  app.get('/', (req, res) => {
    res.render('index', {
      req: req
    });
  });

  app.get('/*', (req, res) => {
    var reqP = req.path.split('/');
    reqP.shift();
    reqP = reqP.join('/');
    if(path.parse(reqP).ext != '.hbs') {
      reqP += '.hbs';
    }
    var p = path.join(__dirname, '../../views', reqP);
    if(fs.existsSync(p)) {
      var stat = fs.statSync(p);
      if(stat.isFile()) {
        res.render(path.parse(p).name, {
          req: req
        });
      } else throw new Error(`The file at ${p} was not a file.`);
    } else {
      res.sendStatus(404);
    }
  });
}