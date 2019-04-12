const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const handlebars = require('handlebars');
const session = require('express-session');
const YAML = require('yaml');

const router = require('./app/routes');
const cfg = require('./config/default');

// init mongodb
mongoose.connect(require('./config/db').url, {
  useNewUrlParser: true
}).catch(err => {
  console.log('mongodb unavailable ... see the error below\n'+err);
});

// init express
let app = express();

let localeDirs = fs.readdirSync(path.join(__dirname, './config/locales'));
let locales = {};
localeDirs.forEach((localeFile) => {
  var p = path.parse(localeFile);
  var n = p.name;
  var nsplit = n.split('_');
  var content = YAML.parse(fs.readFileSync(path.join(__dirname, './config/locales', localeFile)).toString('utf8'));
  if(nsplit.length >= 2) {
    if(typeof locales[nsplit[0]] !== 'object') {
      locales[nsplit[0]] = {}
    }
    locales[nsplit[0]][nsplit[1]] = content;
  } else {
    if(typeof locales[n] !== 'object') {
      locales[n] = {value: content};
    } else {
      locales[n].value = content;
    }
  }
});

function getLocaleString(l, key) {
  if(typeof l == 'string') {
    var locale = l.split(',')[0].split(';')[0];
    var lsplit = locale.split('-');
    if(lsplit.length >= 2) {
      try {
        return locales[lsplit[0]][lsplit[1]][key];
      } catch (err) {
        return locales[lsplit[0]].value[key];
      }
    } else {
      try {
        return locales[lsplit[0]].value[key];
      } catch (err) {
        return key;
      }
    }
  } else {
    return locale["en"].value[key];
  }
}

let hbs = handlebars.create();
hbs.registerHelper('text', function(req, key) {
  return getLocaleString(req.headers["accept-language"], key);
});

app.engine('hbs', expressHandlebars({
  extname: 'hbs',
  handlebars: hbs,
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}))

var sess = {
  secret: "why are you not laughing",
  resave: false,
  saveUninitialized: true,
}

app.set('view engine', 'hbs');
if(app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie = {secure: true}
}


app.use(bodyParser.urlencoded({
  extended: true,
  type: 'application/x-www-form-urlencoded'
}));

app.use(bodyParser.json({
  type: 'application/json'
}));

app.use(function(req, res, next) {
  console.log(`[${new Date()}][${req.method}]${req.path} :\nheaders: ${JSON.stringify(req.headers, null, "  ")}\nbody: ${JSON.stringify(req.body, null, "  ")}`);
  next();
});

app.use(function(req, res, next) {
  res.locals.req = req;
  res.locals.req = req.headers['accept-language'];
  next();
});


app.use(session(sess));

app.use((req, res, next) => {
	console.log("session:", req.session);
	next();
});

router(app);

app.listen(cfg.port, () => {
  console.log(`Server started on port ${cfg.port}`);
});