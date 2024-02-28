import React, {useEffect, useState} from 'react'
import './App.css';
const INITIAL_STATE = {
  board: Array(9).fill(null),
  currentPlayer: 'X',
  winner: null,
};

// const [channel, setChannel] = useState(null);

var channel;
var pieSocket = new PieSocket.default({
  clusterId: "free.blr2",
  apiKey: "TpovmTORDh9Oc2nHJXI6Bd1l6kpKegTlfLpZDB1B",
  notifySelf: true,
  presence: true,
});
const handleSubscribe = () => {
pieSocket.subscribe("game-room").then( ch => {
  channel = ch;
  channel.listen("system:member_joined", function(data){
    console.log( data.member.user + "Joined");

  })
})
}

pieSocket.subscribe("game-room").then( ch => {
  channel = ch;
  channel.listen("system:member_joined", function(data){
    console.log( data.member.user + "Joined");

  })
})


const handleSend = () => {
channel.publish("new_message", {
  sender: "Tarun",
  text: "Hello PieSocket!"
})
}

  if(channel){
  channel.listen("new_message" ,(data, meta) => {
    console.log(data.text)
    const newBoard = JSON.parse(data.text);
      setState({
        board: newBoard,
        currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
        winner: calculateWinner(newBoard),
      });

  })
}



const Game = () => {

  const [state, setState] = useState(INITIAL_STATE);




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

      const handleClick = (index) => {
        if (state.board[index] || state.winner) {
            return;
        }

        const newBoard = state.board.slice();
        newBoard[index] = state.currentPlayer;
        const winner = calculateWinner(newBoard);
    
        setState({
          board: newBoard,
          currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
          winner,
        });

        console.log(state);
        channel.publish('new_message', {
          sender: 'Tarun',
          text: JSON.stringify(newBoard),
        });
      };

      const resetGame = () => {
        setState(INITIAL_STATE);
      };

    


  return (
    <div className="bg-gray-800">
      <button onClick={handleSubscribe}>Subscribe to channel</button>
      <button onClick={handleSend}>Send Message</button>
      {/* <button onClick={handleListen}>Listen</button> */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-md">
        <h1 className="text-3xl font-bold mb-4">Tic-Tac-Toe</h1>
        <Board squares={state.board} onClick={handleClick} />
        <div className="text-xl font-semibold mt-4">
          {state.winner ? `Winner: ${state.winner}` : `Next Player: ${state.currentPlayer}`}
        </div>
        {state.winner || state.board.every((square) => square) ? (
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={resetGame}
          >
            Reset Game
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default Game