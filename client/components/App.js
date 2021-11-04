import React, { Component } from 'react';
import Row from './Row';
let localStorage = window.localStorage;

let gameStore = [];

function getAuth() {
  console.log('Reached function getAuth');
  window.location.href = 'http://localhost:8080/login';
}

function callApi() {
  console.log('Reached function callApi');
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
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);

  fetch('/onePlaylist')
    .then(result => result.json())
    .then(result => {
      console.log('RESULT', result);
      console.log('SONGART', result.songArt);
      let songArt = result.songArt;
      displayArt(songArt);
    })
  console.log('FETCH DONE');
}

function displayArt(songArt) {
  console.log('displayArt reached!');
  let arrSongArt = Object.entries(songArt);
  console.log(arrSongArt);
  localStorage.setItem('songArt', JSON.stringify(arrSongArt));
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
    turn: 'Playlist',
    winner: undefined,
    gameList: gameStore,
  };
}

function checkWin(rows) {
  // check condition??
  const combos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
  ];

  const flattened = rows.reduce((acc, row) => acc.concat(row), []);

  //returns boolean
  return combos.find(combo => (
    flattened[combo[0]] !== '' &&
    flattened[combo[0]] === flattened[combo[1]] &&
    flattened[combo[1]] === flattened[combo[2]]
  ));
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
  handleClick(row, square) {
    // handles click on board
    let { turn, winner } = this.state;
    const { rows } = this.state;
    const squareInQuestion = rows[row][square];

    if (this.state.winner) return;
    if (squareInQuestion) return;

    rows[row][square] = turn;
    turn = turn === 'X' ? 'O' : 'X';
    winner = checkWin(rows);

    // changes state of board
    this.setState({
      rows,
      turn,
      winner,
    });
  }

  render() {
    const { rows, turn, winner, gameList } = this.state;
    const handleClick = this.handleClick;

    const songArt = JSON.parse(localStorage.getItem('songArt'));


    const rowElements = rows.map((letters, i) => (
      <Row key={i} row={i} letters={letters} handleClick={handleClick} artUrl={[songArt[i*3][1], songArt[i*3 + 1][1], songArt[i*3 + 2][1],]} />
    ));

    let infoDiv;
    if (winner) {
      let winTurn = turn === 'X' ? 'O' : 'X';
      infoDiv = (
        <div>
          <div>Player {winTurn} wins with squares {winner.join(', ')}!</div>
        </div>
      );
    } else {
      infoDiv = <div>Playlist: {turn}</div>;
    }

    return (
      <div>
        {infoDiv}
        <div id="board">
          {rowElements}
        </div>
        <button id="reset" onClick={() => this.setState(reset())}>Reset</button>
        <button id="oauth" onClick={() => getAuth()}>Spotify OAuth!</button>
        <button id="playlists" onClick={() => callApi()}>Get Playlists!</button>
        <button id="oneplaylist" onClick={() => onePlaylist()}>Get Data on One Playlist!</button>
        <button id="topTracks" onClick={() => topTracks()}>Get Data on my Top Tracks!</button>
      </div>
    );
  }
}

export default App;
