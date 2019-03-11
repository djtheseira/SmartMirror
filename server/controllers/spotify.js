const rp = require("request-promise");
const qs = require("query-string");
require('dotenv').config();

exports.authorizeSpotifyLogin = (req, res) => {
  // process.env.SPOT_SECRET

  let state = generateRandomString(16);
  res.cookie("spotify_auth_state", state);
  console.log('hi');
  console.log('state: ' + state);

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
  // let storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  let storedState = state;
  console.log('header cookies: ' + req.headers.cookie);
  console.log('cookies: ' + req.cookies);
  console.log('state: ' + state);
  console.log('storedState: ' + storedState);

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
        'Authorization': 'Basic ' + (new Buffer(process.env.SPOT_CLIENT + ':' + process.env.SPOT_SECRET).toString('base64'))
      },
      json: true
    };

    rp(authOptions)
    .then(body => {
        let accessToken = body.access_token,
          refreshToken = body.refresh_token;

        var options = {
          uri: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + accessToken },
          json: true
        };

        rp(options)
        .then(results => {
            console.log('results: ' + results);
        })
        .catch(err => {
          console.log('error: ' + err);
        });

        res.redirect('/#' +
          qs.stringify({
            access_token: accessToken,
            refresh_token: refreshToken
          })
        );
      })
    .catch(error => {
      console.log("error: " + error);
      res.redirect('/#' + 
        qs.stringify({
          error: 'invalid_token'
        })
      );
    });
  }
}

let generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};