module.exports = function (app) {
  var calendarController = require('../controllers/calendar');
  app.get('/getuserauth', calendarController.getUserAuth);
  app.get('/oauthcallback', calendarController.oAuthCallBack);
  app.get('/getcalendaritems', calendarController.getCalendarItems);
}