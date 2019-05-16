module.exports = function (app) {
  var newsController = require('../controllers/news');
  app.get('/news', newsController.getFeeds);
  // app.get('/oauthcallback', calendarController.oAuthCallBack);
}