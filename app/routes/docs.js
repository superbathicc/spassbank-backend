const path = require('path');
const fs = require('fs');
const filesize = require('filesize');
const mime = require('mime');

module.exports = function(app) {
  app.get('/', (req, res) => {
    res.render('index', {
      req: req
    });
  });

  app.get('/jquery', (req, res) => {
    var p = path.join(__dirname, '../../node_modules/jquery/dist/jquery.min.js');
    if(fs.existsSync(p)) {
      res.set("Content-Type", "text/javascript").status(200).send(fs.readFileSync(p).toString("utf8"));
    } else res.sendStatus(404);
  })

  app.get('/src/*', (req, res) => {
    var rel = path.relative('/src/', req.path);
    var p = path.join(__dirname, '../../src', rel);
    if(fs.existsSync(p)) {
      var stat = fs.statSync(p);
      if(stat.isFile(p)) {
        res.status(200).set('content-type', mime.getType(p)).sendFile(p);
      } else {
        res.render('internal/dir', {
          req,
          path: req.path,
          items: fs.readdirSync(p).map(f => {
            var stat = fs.statSync(path.join(p, f))
            var type = "unknown";
            if(stat.isFile()) type = "file";
            if(stat.isDirectory()) type = 'dir';
            if(stat.isSymbolicLink()) type = 'symlink';
            if(stat.isSocket()) type = 'socket';
            if(stat.isFIFO()) type = 'FIFO';
            if(stat.isBlockDevice()) type = 'blockdevice';
            if(stat.isCharacterDevice()) type = 'characterdevice';

            var result = stat;
            result.type = type;
            result.name = f;
            result.sizeText = filesize(stat.size);
            return result;
          })
        })
      }
    }
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
        res.render(path.relative('/', req.path), {
          req: req
        });
      } else throw new Error(`The file at ${p} was not a file.`);
    } else {
      res.sendStatus(404);
    }
  });
}