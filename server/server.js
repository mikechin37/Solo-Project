const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// let localStorage = window.localStorage;


const clientID = '5356996e785f460699c8ed4c018ba20c';
const clientSecret ='4e26d125ead54020952777d45cb99594';
const redirect_uri = 'http://localhost:8080/';

app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log('GET /');
})

app.get('/redirectSpotify', (req, res) => {
  // redirect to Spotify OAuth
  console.log('redirectSpotify route reached');

  let authorizeUrl = 'https://accounts.spotify.com/authorize';
  authorizeUrl += `?client_id=${clientID}`
  authorizeUrl += '&response_type=code'
  authorizeUrl += `&redirect_uri=${encodeURI(redirect_uri)}`
  authorizeUrl += '&show_dialog=true'
  // SCOPES: 
  // write + read access to a user's private playlists
  // write + read acccess to a user's playback state
  // read access to a user's top artists and tracks
  // write + read acces to the list of artists and other users that the user follows
  authorizeUrl += '&scope=playlist-modify-private playlist-read-private' 
  authorizeUrl += ' user-read-playback-state user-modify-playback-state' 
  authorizeUrl += ' user-top-read' 
  authorizeUrl += ' user-follow-modify user-follow-read'
  console.log('AUTHURL', authorizeUrl);

  res.redirect(302, authorizeUrl);
})

app.get('/getAccessToken', (req, res) => {
  console.log('Reached route getAccessToken');
  let code = req.query.code;
  let body = 'grant-type=authorization_code';
  body += `&code=${code}`;
  body += `&redirect_uri=${encodeURI(redirect_uri)}`;
  body += `&client_id=${clientID}`;
  body += `&client_secret=${clientSecret}`;
  // res.redirect(307, body);
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