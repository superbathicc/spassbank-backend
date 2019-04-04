const process = require('process');
const url = require('url');

const defaultHost = '127.0.0.1';
const defaultPort = '27017';
const defaultName = 'fun-bank';

var auth;
if(process.env.SBB_MONGODB_USERNAME && process.SBB_MONGODB_PASSWORD) {
  auth = encodeURIComponent(process.env.SBB_MONGODB_USERNAME) +
    ":" +
    encodeURIComponent(process.env.SBB_MONGODB_PASSWORD);
}

var connectionUrl = url.format({
  auth,
  protocol:       'mongodb',
  hostname:       process.env.SBB_MONGODB_HOST || defaultHost,
  port:           process.env.SBB_MONGODB_PORT || defaultPort,
  pathname:       process.env.SBB_MONGODB_NAME || defaultName,
  slashes:        true
}).toString();

module.exports = {
  url: connectionUrl
}