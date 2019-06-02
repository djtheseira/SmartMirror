const rp = require("request-promise");
const qs = require("query-string");
require('dotenv').config();

exports.authorizeSpotifyLogin = (req, res) => {
  // process.env.SPOT_SECRET
  let state = generateRandomString(16);
  res.cookie("spotify_auth_state", state);
  res.redirect("https://accounts.spotify.com/authorize?" + 
    qs.stringify({
      "response_type": "code",
      "client_id": process.env.SPOT_CLIENT,
      scope: process.env.SPOT_SCOPE,
      redirect_uri: "http://localhost:5001/callback",
      state: state
    })
  );
}

exports.callbackSpotify = (req, res) => {
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      qs.stringify({
        error: 'state_mismatch'
      })
    );
    //res.clearCookie('spotify_auth_state');
  } else {
    let authOptions = {
      method: "POST",
      uri: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: "http://localhost:5001/callback",
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOT_CLIENT + ':' + process.env.SPOT_SECRET).toString('base64'))
      },
      json: true
    };

    rp(authOptions)
    .then(body => {
        let accessToken = body.access_token,
          refreshToken = body.refresh_token;
        res.cookie("access_token", accessToken, { maxAge: 36000});
        res.cookie("refresh_token", refreshToken);
        res.render('spotify_exit', {refreshToken, accessToken, error: null});
      })
    .catch(error => {
      console.error("Callback error: " + error);
      res.render('spotify_exit', {error});
      res.cookie("access_token", { maxAge: Date.now()});
    });
  }
}

exports.getUserInfo = (req, res) => {
  let accessToken = req.query.access_token;
  if (!accessToken) {

  }
  var options = {
    uri: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true,
    resolveWithFullResponse: true
  };
  rp(options)
  .then(results => {
    let statusCode = results.statusCode;
    let success = statusCode == 200 ? 1 : 0;
    let data = results.body;
    res.status(statusCode).send({'success': success, 'data': data});
  })
  .catch(error => {
    console.log('userinfo error: ' + error);
    res.status(400).send({"status": 0, "error": error});
    res.cookie("access_token", { maxAge: Date.now()});
  });
}

exports.getCurrentSongInfo = (req, res) => {
  let accessToken = req.query.access_token;
  var options = {
    uri: 'https://api.spotify.com/v1/me/player/currently-playing?market=US',
    headers: { 'Authorization': 'Bearer ' + accessToken },
    json: true,
    resolveWithFullResponse: true
  };
  rp(options)
  .then(results => {
    let statusCode = results.statusCode;
    if (statusCode == 200) {
      res.status(statusCode).send({"success": 1, "data": results.body});
    } else if (statusCode == 204) {
      res.status(statusCode).send({"success": 1, "data": "No song currently playing."})
    } else {
      res.cookie("refresh_token", "");
      res.status(statusCode).send({"success": 0, "data": results.body});
    }
  })
  .catch(err => {
    console.log('current song error: ' + err);
    res.cookie("access_token", { maxAge: Date.now()});
    res.status(400).send({})
  });
}

exports.getAccessTokenFromRefresh = (req, res) => {
  let refresh = req.query.refresh_token;
  let options = {
    method: "POST",
    uri: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(process.env.SPOT_CLIENT + ":" + process.env.SPOT_SECRET).toString("base64")) },
    form: { 
      grant_type: 'refresh_token',
      refresh_token: refresh
    },
    json: true,
  };

  rp(options)
    .then(results => {
      let accessToken = results.access_token;
      res.cookie("access_token", accessToken, { maxAge: 36000});
      res.status(200).send({accessToken});
    })
    .catch(error => {
      console.error("Get Refresh Token error: " + error);
      res.cookie("access_token", { maxAge: Date.now()});
      res.render('spotify_exit', {error});
    });
}

let generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};