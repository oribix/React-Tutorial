//@ts-check

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const isWinningSquare = props.isWinningSquare;
  /** @type {import('react').CSSProperties} */
  const squareStyle = isWinningSquare ? { backgroundColor: "yellow" } : {};

  return (
    <button
      className="square"
      onClick={props.onClick}
      style={squareStyle}
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
    /** @type {Array<Number>} */ const winningSquares = this.props.winningSquares;
    const isWinningSquare = winningSquares?.includes(squareNumber);

    return (
      <Square
        key={squareNumber}
        value={playerSymbol}
        onClick={() => {
          this.props.onClick(squareNumber);
        }}
        isWinningSquare={isWinningSquare}
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

  constructor(props) {
    super(props);

    this.state = {
      reverseOrder: false
    }
  }

  render() {
    const reverse = this.state.reverseOrder;
    const sortBtnLabel = reverse ? "Sort ascending" : "Sort Descending";

    /** @type {Array<GameHistoryItem>} */
    const history = this.props.history.slice();
    let moves = history.map(this.createMoveEntry.bind(this));
    if(reverse) moves.reverse();

    return (
      <>
        <button onClick={this.reverse.bind(this)}>{sortBtnLabel}</button>
        <ol reversed={this.state.reverseOrder}>{moves}</ol>
      </>
    )
  }

  /**
   * Generates HTML for a move entry
   * @param {GameHistoryItem} gameStep 
   * @param {Number} moveNumber
   * @returns {JSX.Element} move entry
   */
  createMoveEntry(gameStep, moveNumber) {
    let desc = `Go to game start`;
    let playerSymbol = 'P';
    let row = 'R';
    let col = 'C';

    if (moveNumber > 0) {
      desc = `Go to Move #${moveNumber}`;
      playerSymbol = moveNumber % 2 === 0 ? 'O' : 'X';
      row = gameStep.playerMove.row.toString();
      col = gameStep.playerMove.col.toString();
    }

    //bold the list item if this is the currently selected move
    const isCurrentMove = moveNumber === this.props.stepNumber;
    /** @type {import('react').CSSProperties} */
    let moveEntryStyle = isCurrentMove ? {"fontWeight":"bold"} : {};

    return (
      <li key={moveNumber} style={moveEntryStyle}>
        <span>({col}, {row}, {playerSymbol})</span>
        <button onClick={() => this.props.jumpTo(moveNumber)}>{desc}</button>
      </li>
    );
  }

  reverse(){
    this.setState({
      reverseOrder: !this.state.reverseOrder
    });
  }
}

/**
 * @typedef {Object} GameHistoryItem an entry in the Game state's history
 * @property {Array<String>} squares
 * @property {{
 *  row: Number,
 *  col: Number
 * }} playerMove
 */

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /** @type {Array<GameHistoryItem>} */
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
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winInfo = this.calculateWinner(current.squares);
    const winner = winInfo?.winner;
    const winningSquares = winInfo?.winningSquares;
    const status = this.getStatusMessage(winner, stepNumber);

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winningSquares={winningSquares}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <GameHistory
            history={history}
            jumpTo={this.jumpTo.bind(this)}
            stepNumber={stepNumber}
          />
        </div>
      </div>
    );
  }

  /**
   * handles a click on a square
   * @param {Number} squareNumber 
   */
  handleClick(squareNumber) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    //Do nothing if Gameover or Square already filled
    const isFilledSquare = !!squares[squareNumber];
    const isGameOver = !!this.calculateWinner(squares);
    if(isGameOver || isFilledSquare) { return; }

    //insert player symbol into square
    const playerSymbol = this.getPlayerSymbol();
    squares[squareNumber] = playerSymbol;

    //update game state
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
   * returns status message depending on game state
   * @param {String} winner winner of the game
   * @param {Number} stepNumber turn number
   * @return {String} status message
   */
  getStatusMessage(winner, stepNumber) {
    const isFullBoard = stepNumber >= 9;
    const isTie = isFullBoard && !winner;
    const isPlayerWon = !!winner;

    let status = "";
    if(isTie) {
      status = "Tie!"
    }
    else if (isPlayerWon) {
      status = `Winner: ${winner}`;
    }
    else {
      status = `Next player: ${this.getPlayerSymbol()}`
    }

    return status;
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
   * @typedef {Object} WinInfo
   * @property {String} winner the winning player's symbol
   * @property {Array<Number>} winningSquares the squares that consitute the win
   */

  /**
   * @param {Array<String>} squares the board squares
   * @returns {WinInfo} win info or null if there is no winner
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
        return {
          winner: playerSymbol,
          winningSquares: winPermutation
        };
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