module.exports = function (app) {
  var marketController = require('../controllers/market');
  app.get('/market', marketController.getMarketPrices);
}