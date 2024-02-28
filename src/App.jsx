import React, { useEffect, useState } from 'react';
import './App.css';
import Game from './Game';

const INITIAL_STATE = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
  turn: true
};

var channel;

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const Square = ({ value, onClick }) => (
  <button className="boder border-gray-200 min-h-14" onClick={onClick}>
    {value}
  </button>
);

const Board = ({ squares, onClick }) => (
  <div className="grid grid-cols-3">
    {squares.map((value, index) => (
      <Square key={index} value={value} onClick={() => onClick(index)} />
    ))}
  </div>
);

const App = () => {

  const [state, setState] = useState(INITIAL_STATE);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  // const [channel, setChannel] = useState(null);

  const handleSubscribe = () => {
    if (!playerName) {
      alert("Please enter a name")
    }
    var pieSocket = new PieSocket.default({
      clusterId: "free.blr2",
      apiKey: "TpovmTORDh9Oc2nHJXI6Bd1l6kpKegTlfLpZDB1B",
      notifySelf: true,
      presence: true,
      userId: playerName
    });
    pieSocket.subscribe("chat-room").then(ch => {
      channel = ch;

      channel.listen("system:member_joined", function (data) {
        if (data.member.user == playerName) {
          data.member.user = "You";
        }
        else{
          setOpponentName(data.member.user)
        }
        console.log(data.member.user + "joined");
      });
    });
  };

  const handleClick = (index) => {
    if (!channel) {
      alert("Please join a room");
      return;
    }

    if (state.board[index] || state.winner || !state.turn) {
      return;
    }

    const newBoard = state.board.slice();
    newBoard[index] = state.currentPlayer;
    const winner = calculateWinner(newBoard);

    setState({
      board: newBoard,
      currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
      winner: calculateWinner(newBoard),
      turn: false
    });

    console.log(newBoard)

    
    channel.publish('new_message', {
      sender: playerName,
      text: JSON.stringify(newBoard),

    }); 
  };

  useEffect(() => {
    if (channel)
      channel.listen("new_message", function (data, meta) {
        if (data.sender == playerName) {
          return;
        }
        if (data.text === "RESET_BOARD") {
          setState(INITIAL_STATE);
        }
        const newBoard = JSON.parse(data.text);
        setState({
          board: newBoard,
          currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
          winner: calculateWinner(newBoard),
          turn: true
        })
        console.log("Received" + data.sender + data.text);
        console.log(newBoard)
      })
  })

  const resetGame = () => {
    setState(INITIAL_STATE);
    channel.publish("new_message", {
      text: "RESET_BOARD"
    })
  };


  return (
    <div className="bg-gray-800">
      <div className="bg-gray-800 rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h1>
        <div className='flex justify-between text-xl font-semibold'>
          <h1>You</h1>
          <h2>vs</h2>
          <h1>{opponentName}</h1>
        </div>
        <Board squares={state.board} onClick={handleClick} />
        <div className="text-xl font-semibold mt-4">
          {state.winner ? `Winner: ${state.winner}` : `Next Player: ${state.currentPlayer}`}
        </div>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={resetGame}
          >
            Reset Game
          </button>
      </div>
      <div className='bg-zinc-500 rounded-lg'>

      <input className='p-2 bg-zinc-500 rounded-lg' type="text" placeholder='Enter your name' onChange={(e) => setPlayerName(e.target.value)} />
      <button className='bg-gray-700 p-2' onClick={handleSubscribe}>Join Room</button>
      </div>
    </div>
  );
};

export default App;
