import React, { Component } from 'react';
import './App.scss';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dice: [
      { key: 1, value: 1, locked: 0, dq:false, hasScore: false },
      { key: 2, value: 1, locked: 0, dq:false, hasScore: false },
      { key: 3, value: 1, locked: 0, dq:false, hasScore: false },
      { key: 4, value: 1, locked: 0, dq:false, hasScore: false },
      { key: 5, value: 1, locked: 0, dq:false, hasScore: false },
      { key: 6, value: 1, locked: 0, dq:false, hasScore: false },
      ],
      currentScore: 0,
      bust: false,
      tempScoreReasons: [],
      lockedScoreReasons: [],
      score: 0,
      rolls: 0,
      turns: 0,
      message: ''
    };
    
    this.roll = this.roll.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.endTurn = this.endTurn.bind(this);
  }
  
  // Lock or unlock a die from being rerolled.
  toggleLock(e) {
    console.log(e);
    if(this.state.rolls === 0) {
      this.setState({ message: 'You can\'t lock dice before your first roll!' });
      return;
    }
    console.log(e.target);
    let index = e.target.getAttribute('data-index');
    let { dice } = this.state;
    dice = dice.slice(0, dice.length);
    let die = dice[index];
    if(!die.locked) die.locked = 1;
    else if (die.locked === 1) die.locked = 0;
    this.setState({ dice })
  }
  
  // Update total score and save state to server.
  endTurn = async() => {
    const response = await fetch('/api/endturn', {
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    });
    
    const newState = await response.json();
    
    this.setState(JSON.parse(newState));
  }
  
  // Roll the dice
  roll = async() => {
    const response = await fetch('/api/roll', {
      method: 'POST',
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    });
    
    const newState = await response.json();
    
    this.setState(JSON.parse(newState));
  }
  
  render() {
    let allScoreReasons = this.state.lockedScoreReasons.concat(this.state.tempScoreReasons);
    return(
      <div className="game">
        <div className="dice">
          {this.state.dice.map((die, i) =>
           <div
             className="die"
             data-index={i}
             key={i}
             data-locked={die.locked}
             data-hasscore={die.hasScore}
             onClick={this.toggleLock}>{die.value}</div>)}
        </div>
        <div className="buttons">
          <button onClick={this.roll}>Roll</button>
          <button onClick={this.endTurn}>End turn</button>
        </div>
        <div className="score">
          <p>Current score: {this.state.currentScore} {allScoreReasons.length ? `(${allScoreReasons.join(', ')})` : ''}</p>
          <p>Total score: {this.state.score}</p>
          <p>Turns taken: {this.state.turns}</p>
          <p className="message">{this.state.message}</p>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Game />
        </header>
      </div>
    );
  }
}

export default App;
