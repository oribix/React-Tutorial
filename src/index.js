import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  /**
   * 
   * @param {Number} squareNumber 
   */
  renderSquare(squareNumber) {
    const playerSymbol = this.props.squares[squareNumber];
    return (
      <Square
        key={squareNumber}
        value={playerSymbol}
        onClick={() => {
          this.props.onClick(squareNumber);
        }}
      />
    );
  }

  render() {
    let boardRows = [];
    for(let row = 0; row < 3; row++) {
      let rowSquares = [];
      for(let col = 0; col < 3; col++){
        const index = (row * 3) + col;
        rowSquares.push(this.renderSquare(index));
      }
      boardRows.push(<div key={row} className="board-row">{rowSquares}</div>);
    }

    return (<div>{boardRows}</div>);
  }
}

class GameHistory extends React.Component {

  render() {
    const history = this.props.history.slice();
    const moves = history.map(this.createMoveEntry.bind(this));

    return (
      <ol>{moves}</ol>
    )
  }

  createMoveEntry(step, moveNumber) {
    let desc = `Go to game start`;
    let playerSymbol = 'P';
    let row = 'R';
    let col = 'C';

    if (moveNumber > 0) {
      desc = `Go to Move #${moveNumber}`;
      playerSymbol = moveNumber % 2 === 0 ? 'O' : 'X';
      row = step.playerMove.row;
      col = step.playerMove.col;
    }

    //bold the list item if this is the currently selected move
    const isCurrentMove = moveNumber === this.props.stepNumber;
    let style = isCurrentMove ? {"font-weight":"bold"} : {};

    return (
      <li key={moveNumber} style={style}>
        <span>({col}, {row}, {playerSymbol})</span>
        <button onClick={() => this.props.jumpTo(moveNumber)}>{desc}</button>
      </li>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        playerMove: {
          row: -1,
          col: -1
        }
      }],
      stepNumber: 0,
      xIsNext: true
    };
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.calculateWinner(current.squares);
    let status = this.getCurrentStatusMessage(winner);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <GameHistory
            history={history}
            jumpTo={this.jumpTo.bind(this)}
            stepNumber={this.state.stepNumber}
          />
        </div>
      </div>
    );
  }

  getCurrentStatusMessage(winner){
    let status;
    if(winner) {
      status = `Winner: ${winner}`;
    }
    else {
      status = `Next player: ${this.getPlayerSymbol()}`;
    }

    return status;
  }

  /**
   * 
   * @param {Number} squareNumber 
   */
  handleClick(squareNumber) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    const isFilledSquare = !!squares[squareNumber];
    const isGameOver = !!this.calculateWinner(squares);
    if(isGameOver || isFilledSquare) { return; }

    const playerSymbol = this.getPlayerSymbol();
    squares[squareNumber] = playerSymbol;
    this.setState({
      history: history.concat([{
        squares: squares,
        playerMove: {
          row: Math.floor(squareNumber / 3),
          col: squareNumber % 3
        }
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  /**
   * Jump to step in game history
   * @param {Number} stepNumber 
   */
  jumpTo(stepNumber) {
    this.setState({
      stepNumber: stepNumber,
      xIsNext: (stepNumber % 2) === 0
    });
  }

  /**
   * Get symbol for the current player's turn
   * @returns {String} symbol
   */
  getPlayerSymbol(){
    return this.state.xIsNext ? "X" : "O";
  }

  /**
   * @param {Array<String>} squares the board squares
   * @returns {String} Winning player or null if there is no winner
   */
  calculateWinner(squares) {
    //possible winning moves
    const winPermutations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for(let winPermutation of winPermutations) {
      const [a, b, c] = winPermutation;
      const playerSymbol = squares[a];
      const isOccupiedSpace = !!playerSymbol;
      const isMatchB = playerSymbol === squares[b];
      const isMatchC = playerSymbol === squares[c];
      const isMatchingSymbols = isMatchB && isMatchC;

      if (isOccupiedSpace && isMatchingSymbols) {
        return playerSymbol;
      }
    }

    //no winner
    return null;
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);