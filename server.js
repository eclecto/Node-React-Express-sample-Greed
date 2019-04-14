const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const getDiceWithValue = (dice, value) => {
  return dice.filter(die => die.value === value);
}

const dq = (dice, hasScore = true) => {
  if(dice.length) {
    dice.forEach(die => Object.assign(die, { dq: true, hasScore }));
  } else {
    Object.assign(dice, { dq: true, hasScore });
  }
};

const calculateSubset = (dice) => {
  // Sort dice by value so we can count them.
  let diceValueMap = {};
  for(let i = 1; i <= 6; i++) {
    diceValueMap[i] = (getDiceWithValue(dice, i));
  }

  // First, check for straights
  if(dice.length >= 5 &&
     diceValueMap[2].length &&
     diceValueMap[3].length &&
     diceValueMap[4].length &&
     diceValueMap[5].length &&
     (diceValueMap[1].length || diceValueMap[6].length)
    ) {
    // Disqualify the dice that make up the straight.
    dq(diceValueMap[2][0]);
    dq(diceValueMap[3][0]);
    dq(diceValueMap[4][0]);
    dq(diceValueMap[5][0]);
    diceValueMap[1][0] && dq(diceValueMap[1]);
    diceValueMap[6][0] && dq(diceValueMap[6]);
    
    // Check for large or small straight
    if(diceValueMap[1].length && diceValueMap[6].length) {
      return { score: 1500, reason: 'Six dice straight' };
    } else {
      return { score: 1000, reason: 'Five dice straight' };
    }
  }
  // 3 or more of a kind
  if(dice.length >= 3) {
    for(let i = 1; i <= 6; i++) {
      let kind = diceValueMap[i]
      let valLength = kind.length;
      if(valLength >= 3) {
        let score = (i = 1 ? i * 10 : i) * 100 * Math.pow(2,valLength - 3);
        dq(kind);
        return {
          score,
          reason: valLength + ' of a kind'
        }
      }
    }
  }

  // Individual ones or fives
  let ones = diceValueMap[1];
  if(ones.length) {
    dq(ones);
    return { score: ones.length * 100, reason: ones.length + ' ones' }
  }
  let fives = diceValueMap[1];
  if(fives.length) {
    dq(fives);
    return { score: fives.length * 50, reason: fives.length + ' fives' }
  }
  
  // No more scoring dice; disqualify the rest.
  dq(dice, false);
  return { score: 0 };
};

const calculateScore = (state, lockedFilter) => {
  state.tempScoreReasons = [];
  let { dice, currentScore } = state;
  let scoreReasons = (lockedFilter === 0) ? state.tempScoreReasons : state.lockedScoreReasons;
  let newScore = 0;
  
  let scoreableDice = dice.filter(die => die.locked === lockedFilter);
  
  if(!scoreableDice.length) {
    if(lockedFilter === 1) {
      state.message = 'You need to lock one or more scoring dice before rolling again!';
    } else {
      state.message = 'Wow, all of your dice are scoring! You can\'t roll again; please end your turn.';
    }
    return state;
  }
  
  while(scoreableDice.length) {
    let scoreCheck = calculateSubset(scoreableDice);
    newScore += scoreCheck.score;
    if(scoreCheck.reason) scoreReasons.push(scoreCheck.reason);
    scoreableDice = scoreableDice.filter(die => !die.dq);
  }
  
  // Clear disqualified dice for next score calculation.
  dice.forEach(die => die.locked !== 2 && (die.dq = false));
  
  state.dice = dice;
  if(newScore === 0) {
    if(lockedFilter === 0) {
      state.bust = true;
      state.currentScore = 0;
      state.lockedScoreReasons = [];
      state.tempScoreReasons = ['Busted!'];
    } else {
      state.message = 'The dice you\'ve locked aren\'t scoring! Please lock a different set of dice.';
    }
  } else {
    if(lockedFilter === 0) state.currentScore += newScore;
  }
  return state;
}

const getTempScore = (state) => {
  return calculateScore(state, 0);
}

const getFinalizedScore = (state) => {
  return calculateScore(state, 1);
}



const roll = (state) => {
  state.message = '';
  // If this isn't the first roll, check for scoring temp-locked dice before proceeding.
  if(state.rolls) {
    state = getFinalizedScore(state);
    if(state.message) return state;
  }
  
  state.dice.forEach(die => {
    die.value = die.locked ? die.value : Math.ceil(Math.random() * 6);
    if(die.locked === 1) die.locked = 2;
  });
  
  state.rolls++;
  
  state = getTempScore(state);
  
  return state;
};

app.post('/api/roll', (req, res) => {
  let state = req.body;
  state = roll(state);
  res.json(JSON.stringify(state));
});

const stateReset = {
  rolls: 0,
  currentScore: 0,
  dice: [
  { key: 1, value: 1, locked: 0, dq:false, hasScore: false },
  { key: 2, value: 1, locked: 0, dq:false, hasScore: false },
  { key: 3, value: 1, locked: 0, dq:false, hasScore: false },
  { key: 4, value: 1, locked: 0, dq:false, hasScore: false },
  { key: 5, value: 1, locked: 0, dq:false, hasScore: false },
  { key: 6, value: 1, locked: 0, dq:false, hasScore: false },
  ],
  bust: false,
  tempScoreReasons: [],
  lockedScoreReasons: [],
  rolls: 0,
  message: ''
}

app.post('/api/endturn', (req, res) => {
  let state = req.body;
  state.score += state.currentScore;
  state.turns++;
  Object.assign(state, stateReset);
  res.json(JSON.stringify(state));
});

app.listen(port, () => console.log(`Listening on port ${port}`));