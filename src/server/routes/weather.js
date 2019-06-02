module.exports = function (app) {
  var weatherControllers = require('../controllers/weather');

  // app.get('/weather', weatherControllers.getWeather);
  // app.get('/weather', weatherControllers.getCurrentWeather);
  app.get('/weather/:cityId(\\d+)', weatherControllers.getWeather);
  app.get('/weather/location/', weatherControllers.getCityData);

}