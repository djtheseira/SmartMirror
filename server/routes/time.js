module.exports = function (app) {
  var timeController = require('../controllers/time');
  app.get('/time', timeController.getCurrentDateAndTime);
}