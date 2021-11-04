import React, { Component } from 'react';
import Row from './Row';
let sessionStorage = window.sessionStorage;

function getAuth() {
  console.log('Reached function getAuth');
  window.location.href = 'http://localhost:8080/login';
}

function getAllPlaylists() {
  console.log('Reached function getAllPlaylists');
  window.location.href = 'http://localhost:8080/playlists';
}

function onePlaylist() {
  window.location.href = 'http://localhost:8080/onePlaylist';
}

function topTracks() {
  window.location.href = 'http://localhost:8080/usersTopTracks';
}

function handleRedirect() {
  const accessToken = getTokens().accessToken;
  const refreshToken = getTokens().refreshToken;

  console.log('GRABBED ACCESSTOKEN: ', accessToken);
  console.log('GRABBED REFRESHTOKEN: ', refreshToken);
  sessionStorage.setItem('access_token', accessToken);
  sessionStorage.setItem('refresh_token', refreshToken);

  fetch('/onePlaylist')
    .then(result => result.json())
    .then(result => {
      console.log('RESULT', result);
      console.log('SONGART', result.songArt);
      let songArt = result.songArt;
      let songLinks = result.songLinks
      sessionStorage.setItem('playlistName', result.playlistName)
      storeDisplayArt(songArt);
      storeSongLinks(songLinks);
    })
  console.log('FETCH DONE');
}

function storeDisplayArt(songArt) {
  console.log('storeDisplayArt reached!');
  let arrSongArt = Object.entries(songArt);
  console.log(arrSongArt);
  sessionStorage.setItem('songArt', JSON.stringify(arrSongArt));
}

function storeSongLinks(songLinks) {
  console.log('storeSongLinks reached!');
  let arrSongLinks = Object.entries(songLinks);
  console.log(arrSongLinks);
  sessionStorage.setItem('songLinks', JSON.stringify(arrSongLinks));
}

function getTokens() {
  const queryString = window.location.search;
  let accessToken = null;
  let refreshToken = null;
  if (queryString.length > 0) {
    accessToken = new URLSearchParams(queryString).get('access_token');
    refreshToken = new URLSearchParams(queryString).get('refresh_token');
  }
  return {
    accessToken: accessToken,
    refreshToken: refreshToken
  }
}

function reset() {
  return {
    rows: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
    playlist: sessionStorage.getItem('playlistName')
  };
}

function fetchAllPlaylists() {
  console.log('Reached fetchAllPlaylists!');
  fetch('/playlists')
    .then(result => result.json())
    .then(result => result.playlistNames)
    .then(result => {
      console.log('PLAYLISTNAMES', result);
      addPlaylist(result);
    })
}

function addPlaylist(playlists) {
  for (let key in playlists) {
    let node = document.createElement('option');
    node.value = playlists[key];
    node.innerHTML = key;
    document.getElementById('playlists').appendChild(node);
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    // this will start the reset method at the moment of load!! problem
    this.state = reset();
  }
  componentDidMount() {
    if (window.location.search.length > 0) {
      handleRedirect();
    }
  }
  handleClick(songUrl) {
    // handles click on board
    window.open(songUrl, '_blank').focus();
  }

  render() {
    const { rows, playlist, winner, gameList } = this.state;
    const handleClick = this.handleClick;

    let songArt = JSON.parse(sessionStorage.getItem('songArt'));
    let songLinks = JSON.parse(sessionStorage.getItem('songLinks'));

    console.log('SONGART', songArt);
    console.log('SONGLINKS', songLinks);

    if (!songArt) songArt =['','','','','','','','',''];
    if (!songLinks) songLinks =['','','','','','','','',''];
    
    const rowElements = rows.map((letters, i) => (
      <Row 
      key={i} row={i} letters={letters} handleClick={handleClick} 
      artUrl={[songArt[i*3][1], songArt[i*3 + 1][1], songArt[i*3 + 2][1],]} 
      songUrl={[songLinks[i*3][1], songLinks[i*3 + 1][1], songLinks[i*3 + 2][1],]} 
      />
    ));

    let infoDiv = (<div>
      <div id="playlistSection" className="row">
        <div className="col">
          <div className="mb-3">
            <label htmlFor="playlists" className="form-label">Choose a Playlist:</label>
            <select id="playlists" className="form-control"></select>
            <input className="btn-primary" type="button" onClick={fetchAllPlaylists()} value="Refresh Playlists"/>
          </div>
        </div>
      </div>
      <br/>
      <br/>
      Current Playlist: {playlist}
    </div>);

    return (
      <div>
        {infoDiv}
        <div id="board">
          {rowElements}
        </div>
        <button id="reset" onClick={() => this.setState(reset())}>Reset</button>
        <button id="oauth" onClick={() => getAuth()}>Spotify OAuth!</button>
        <button id="playlists" onClick={() => getAllPlaylists()}>Get Playlists!</button>
        <button id="oneplaylist" onClick={() => onePlaylist()}>Get Data on One Playlist!</button>
        <button id="topTracks" onClick={() => topTracks()}>Get Data on my Top Tracks!</button>
      </div>
    );
  }
}

export default App;
