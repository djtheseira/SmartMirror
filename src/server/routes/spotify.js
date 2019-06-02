module.exports = function (app) {
  var spotifyController = require('../controllers/spotify');
  app.get("/login", spotifyController.authorizeSpotifyLogin);
  app.get("/callback", spotifyController.callbackSpotify);
  app.get("/currentSong", spotifyController.getCurrentSongInfo);
  app.get("/currentUser", spotifyController.getUserInfo);
  app.get("/refreshToken", spotifyController.getAccessTokenFromRefresh);
}