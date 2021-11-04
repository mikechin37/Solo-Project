const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var request = require('request'); // "Request" library
let XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
// let localStorage = window.localStorage;


const client_ID = '5356996e785f460699c8ed4c018ba20c';
const client_secret ='4e26d125ead54020952777d45cb99594';
const redirect_uri = 'http://localhost:8080/';
const TOKEN = 'https://acounts.spotify.com/api/token';

app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log('GET /');
})

app.get('/redirectSpotify', (req, res) => {
  // redirect to Spotify OAuth
  console.log('redirectSpotify route reached');

  let authorizeUrl = 'https://accounts.spotify.com/authorize';
  authorizeUrl += `?client_id=${client_ID}`
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
  body += `&client_id=${client_ID}`;
  body += `&client_secret=${client_secret}`;
  let xhr = new XMLHttpRequest();
  xhr.open('POST', TOKEN, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic' + btoa(`${client_ID}:${client_secret}`));
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;

  function handleAuthorizationResponse() {
    if (this.status == 200) {
      let data = JSON.parse(this.responseText);
      console.log('DATA', data);
      if (data.access_token != undefined) {
        access_token = data.access_token;
        localStorage.setItem('access_token', access_token);
      }
      if (data.refresh_token != undefined) {
        refresh_token = data.refresh_token;
        localStorage.setItem('refresh_token', refresh_token);
      }
    } else {
      console.log('ERROR in handleAuthorizationResponse', this.reponseText);
    }
  }
});

if (process.env.NODE_ENV === 'production') {
  // statically serve everything in the build folder on the route '/build'
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on the route '/'
  app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../index.html'));
  });
}


app.listen(3000); //listens on port 3000 -> http://localhost:3000/