module.exports = function(app) {
  require('./api')(app);
  require('./docs')(app);
}