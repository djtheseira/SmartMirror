module.exports = function (app) {
  var spotifyController = require('../controllers/spotify');
  app.get("/login", spotifyController.authorizeSpotifyLogin);
  app.get("/callback", spotifyController.callbackSpotify);
}