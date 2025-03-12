import { useState } from 'react';


//TODO
/*
  1. For the current move only, show "You are at move #..." instead of a button //DONE
  2. Rewrite Board to use two loops to make the squares instead of hardcoding them //DONE
  3. Add a toggle button that lets you sort the moves in either ascending or descending order // DONE
  4. When someone wins, highlight the three squares that caused the win (and when no one wins, display a message about the result being a draw) // DONE
  5. Display the location for each move in the format (row, col) in the move history list // DONE
*/

function Square({ value, onSquareClick, winner }) {
  return (
    <button 
      className={`square ${winner ? "winner" : ""}`} 
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  for(let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }

  return { winner: null, line: [] };
}

function Board({ xIsNext, squares, onPlay }) {

  function handleClick(i) {
    if(squares[i] || calculateWinner(squares).winner) { return; }

    let coords = { x: null, y: null };

    if(i < 3) {
      coords.y = 1;
      coords.x = i+1;
    } else if (i >= 3 && i < 6) {
      coords.y = 2;
      coords.x = i-coords.y;
    } else {
      coords.y = 3;
      coords.x = (i+1)-coords.y*2;
    }

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, coords);
  }

  const winnerObj = calculateWinner(squares);
  const winner = winnerObj.winner;
  const winLine = winnerObj.line;
  let status = winner ? `Winner ${winner}` : `Next Player: ${xIsNext ? "X" : "O"}`;
  if(!squares.includes(null) && !winner) {
    status = "Draw";
  }

  const createBoard = () => {
    const boardRows = [];
    for(let i = 0; i < 3; i++) {
      const squaresInRow = [];
      for(let j = 0; j < 3; j++) {
        let numSquare = i * 3 + j;
        squaresInRow.push(
          <Square 
            value={squares[numSquare]} 
            onSquareClick={() => handleClick(numSquare)} 
            winner={winLine.includes(numSquare)} 
          />
        );
      }
      boardRows.push(<div key={i} className="board-row">{squaresInRow}</div>);
    }
    return boardRows;
  }

  return (
    <>
      <div className="status">{status}</div>
      {createBoard()}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const [moveCoords, setMoveCoords] = useState([{}]);

  function handlePlay(nextSquares, coords) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    const nextCoords = [...moveCoords.slice(0, currentMove + 1), coords];
    setMoveCoords(nextCoords);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares, move) => {
    if(move === currentMove) {
      let description = `You are at move #${move}`;
      return (
        <li key="move" value={move+1}>
          {description}
        </li>
      );
    }

    let description = move > 0 ? `Go to move #${move}` : `Go to game start`;
    if(move > 0 && moveCoords[move].x) {
      description += `: [${moveCoords[move].y},${moveCoords[move].x}]`;
    }

    return (
      <li key={move} value={move+1}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const moveList = isAscending ? moves.reverse() : moves;

  let ascendDescend = isAscending ? 'Switch to Descending' : 'Switch to Ascending';

  function flipOrder() {
    setIsAscending(!isAscending);
  }

  return (
    <div className="game">  
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button className="switch-moves-order" onClick={() => flipOrder()}>{ascendDescend}</button>
        <ol>{moveList}</ol>
      </div>
    </div>
  );
}