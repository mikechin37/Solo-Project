const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var request = require('request'); // "Request" library
var querystring = require('querystring');
var SpotifyWebApi = require('spotify-web-api-node');

const client_id = '5356996e785f460699c8ed4c018ba20c';
const client_secret ='4e26d125ead54020952777d45cb99594';
const redirect_uri = 'http://localhost:8080/callback';
const TOKEN = 'https://acounts.spotify.com/api/token';

let spotifyApi = new SpotifyWebApi({
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri,
});

//  app.use(express.static(__dirname + '/public'))
app.use(cors());
app.use(cookieParser());

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'playlist-modify-private playlist-read-private';
  scope += ' user-read-playback-state user-modify-playback-state' 
  scope += ' user-top-read' 
  scope += ' user-follow-modify user-follow-read'
  // SCOPES: 
  // write + read access to a user's private playlists
  // write + read acccess to a user's playback state
  // read access to a user's top artists and tracks
  // write + read acces to the list of artists and other users that the user follows

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

   // dont use this - i just get userToken from old guy, then store in state using componentDidMount
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log('BODY:', body);
        });

        res.cookie('access_token', access_token);
        res.cookie('refresh_token', refresh_token);

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        // we can also pass the token to the browser to make requests from there
        res.redirect('/?' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/?' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/playlists', async(req, res) => {
  try {
    let result = await spotifyApi.getUserPlaylists();
    console.log('BODY', result.body);
    res.status(200).send(result.body);
  } catch (err) {
    res.status(400).send(err);
  }
})

app.get('/onePlaylist', async(req, res) => {
  try {
    let result = await spotifyApi.getPlaylist('233LBuxFduCQqIB5GiWS5d');
    let songs = result.body.tracks.items // -> array of objects (songs)
    const songNames = [];
    const songIds = {};
    const songPopularity = {};

    for (let song of songs) {
      songNames.push(song.track.name);
      songIds[song.track.name] = song.track.id;
      songPopularity[song.track.id] = song.track.popularity
    }
    res.status(200).json({
      songIds: songIds,
      songPopularity: songPopularity
    })

  } catch (err) {
    res.status(400).send(err);
  }
})

app.get('/usersTopTracks', async(req, res) => {
  try {
    let result = await spotifyApi.getMyTopTracks();
    console.log('BODY', result.body);
    const songs = {};
    for (let item of result.body.items) {
      songs[item.artists[0].name] = item.name;
    }
    res.status(200).json({
      topSongs: songs,
      result: result.body
    });
  } catch (err) {
    res.status(400).send(err);
  }
})

if (process.env.NODE_ENV === 'production') {
  // statically serve everything in the build folder on the route '/build'
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on the route '/'
  app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../index.html'));
  });
}

app.listen(3000); //listens on port 3000 -> http://localhost:3000/