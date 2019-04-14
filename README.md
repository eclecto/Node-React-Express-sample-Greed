This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Purpose

This is a coding sample to demonstrate proficiency with Node, React, and Express. It is a basic form of a dice game called 10000 or Greed. [Rules](http://thehobbyts.com/greed-dice-game-rules/)

The app displays the dice and controls in the browser, but calculations and dice rolling are done on the backend by sending requests to Express endpoints. This simulates certain asynchronous online games that use such server side calculations to reduce cheating.

## Available Scripts

In the project directory, you can run:

### `npm run install`

Runs `npm install` in both the root and the React client folder.

### `npm run yarn-install`/`yarn run yarn-install`

Same as above, but uses yarn

### `npm run dev`

Launches both the React client and the Express server in development mode, and kills one process if the other exits with a non zero status code.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.