
# Jeopardy Game 1.0

<p align="center">
  <img src="[def]" alt="Jeopardy Game Screenshot" width="700" />
</p>

This project is a **web-based Jeopardy trivia game** built using **Vue 3** (Options API) and **Vite**. It utilizes the [Open Trivia Database API](https://opentdb.com/) to dynamically populate the board with real-world trivia questions, organized by category and difficulty.


## Features

- **Dynamic player and category configuration** (2–6 players, any number of categories)
- **Double Jeopardy support** with wagered scoring
- **Turn-based gameplay**
- **Question grid with dynamic categories × 5 values**
- **Dynamic fetching of trivia questions from the API**
- **Automatic placeholder replacement with live data every 5 seconds**
- **Correct/incorrect feedback with visual indicators**
- **Player scoring and winner detection**
- **Session token handling to prevent duplicate questions**
- **Full error handling and retry logic (including rate limits and token errors)**


## Game Rules Summary

- A **Double Jeopardy event** triggers with a ~10% chance when a question is selected.
  - If triggered and the player's score exceeds the question's value, they can wager any amount up to their score.
  - The result of the wager (win/lose) applies to the player's balance.


- Players take turns selecting a question from the board.
- Each cell corresponds to a difficulty:
  - `$100–200`: Easy
  - `$300–400`: Medium
  - `$500`: Hard
- Selecting a question shows it to the current player only.
- Answering correctly adds the value to their score.
- Answering incorrectly subtracts the value and passes the turn.
- The board disables completed questions.
- Placeholder cells appear when no suitable question is available and auto-update once fetched.
- Game ends after all questions are answered.


## Tech Stack

- **Vue 3** + **Vite**
- **JavaScript (ES6+)**
- **Composition API via `<script setup>`**
- **HTML/CSS (Scoped styles)**


## API Integration Details

- Uses the [Open Trivia DB](https://opentdb.com/api_config.php) API.
- Fetches boolean questions (`True/False`) only.
- API requests:
  - Max 50 questions per request
  - Rate-limited: 1 request every 5 seconds
  - Caching managed using `session token`
- If placeholder questions are needed, the app:
  - Inserts them visually
  - Automatically refills every 5 seconds until the board is complete
- If token errors occur (`response_code 5`), the app retries up to 4 times (every 2 seconds).


## Instructor/Grading Notes

Meeting all assignment requirements:

- Uses Vue 3 + Vite correctly
- All core logic is handled client-side (no server needed)
- No external libraries used outside of Vue/Vite itself
- Fully functional trivia game using live data
- Placeholder handling is graceful and automated
- Visual and user feedback is clear and effective
- Clean separation of components: `App.vue`, `GameBoard`, `PlayerPanel`, `QuestionDisplay`, and `triviaService.js`


## Project Setup Instructions

Install project dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```


## File Overview

| File / Folder            | Purpose                                       |
|--------------------------|-----------------------------------------------|
| `App.vue`                | Main controller for game state and logic      |
| `components/GameBoard.vue` | Renders question grid, handles selection   |
| `components/PlayerPanel.vue` | Displays player scores and active player |
| `components/QuestionDisplay.vue` | Handles question UI and answer input |
| `components/SettingsPanel.vue` | Provides UI for changing players and categories |
| `triviaService.js`       | API logic (session tokens, fetching, decoding)|
| `config.js/`                | List of exceptions                    |


## FAQ

**Q: Why are some questions labeled as "please wait..."?**  
A: These are placeholder cells. The app will fetch and replace them automatically every 5 seconds.

**Q: Can the same question repeat?**  
A: No, session tokens prevent duplication until all API questions are exhausted.

**Q: How many categories/questions does the board use?**  
A: example - **4 categories** × 5 values = 20 questions total.


[def]: /screenshot.pn