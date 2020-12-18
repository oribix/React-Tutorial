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

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
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
    const moves = history.map((step, move) => {
      const desc = move ? `Go to Move #${move}` : `Go to game start`;
      const playerSymbol = '?'; //Todo: get player symbol for this turn
      return (
        <li key={move}>
          <span>{playerSymbol}: </span>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    })

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
          <ol>{moves}</ol>
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
        squares: squares
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
   * 
   * @param {Array<String>} squares 
   */
  calculateWinner(squares) {
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
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);