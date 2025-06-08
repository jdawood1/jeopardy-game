<template>
  <div class="app-container">
    <h1>Jeopardy Game</h1>
    <SettingsPanel
      v-model:showSettings="inMenu"
      @update-settings="updateSettings"
    />

    <PlayerPanel :players="players" :currentPlayer="currentPlayer" />

    <GameBoard
      :categories="categories"
      :questions="questions"
      :answered="answeredMap"
      :selected="selectedQuestion && {
        categoryId: selectedQuestion.categoryId,
        questionIndex: selectedQuestion.questionIndex,
        playerIndex: currentPlayer
      }"
      :disabled="!!selectedQuestion"
      @selectQuestion="handleQuestionSelection"
    />

    <transition name="fade">
      <QuestionDisplay
        v-if="selectedQuestion"
        :question="selectedQuestion"
        :player="players[currentPlayer]"
        @answer="handleAnswer"
      />
    </transition>

    <div v-if="selectionSummary || lastOutcome" class="feedback-box">
      <p v-if="selectionSummary" class="selection">{{ selectionSummary }}</p>
      <p
        v-if="lastOutcome"
        :class="['outcome', lastOutcome === 'Correct!' ? 'correct-text' : 'incorrect-text']"
      >
        {{ lastOutcome }}
      </p>
      <p v-if="!selectedQuestion">Player {{ currentPlayer + 1 }} to select</p>
    </div>

    <div v-if="isGameOver" class="winner-banner">
      🏆 {{ getWinner() }} has won the game!
      <button @click="restartGame">Play Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watchEffect } from 'vue'
import PlayerPanel from './components/PlayerPanel.vue'
import GameBoard from './components/GameBoard.vue'
import QuestionDisplay from './components/QuestionDisplay.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import {
  initSessionToken,
  fetchTriviaQuestions,
  fetchValidCategories
} from './triviaService.js'

const players = ref([
  { name: 'Player 1', score: 0 },
  { name: 'Player 2', score: 0 },
  { name: 'Player 3', score: 0 }
])

const categories = ref([])
const questions = ref({})
const selectedQuestion = ref(null)
const currentPlayer = ref(0)
const answeredMap = ref({})

const inMenu = ref(false)
const numCategories = ref(4)

const selectionSummary = ref(null)
const lastOutcome = ref(null)

const isGameOver = computed(() => {
  const totalQuestions = numCategories.value * 5
  return Object.keys(answeredMap.value).length === totalQuestions
})

function getWinner() {
  return [...players.value].sort((a, b) => b.score - a.score)[0].name
}

async function updateSettings({ players: p, categories: c }) {
  players.value = Array.from({ length: p }, (_, i) => ({
    name: `Player ${i + 1}`,
    score: 0
  }))
  numCategories.value = c

  await initSessionToken()
  const rawQuestions = await fetchTriviaQuestions(50)
  const validCats = await fetchValidCategories()
  const { categories: cats, questionMap } = distributeQuestions(rawQuestions, validCats)

  categories.value = cats
  questions.value = questionMap
  answeredMap.value = {}
  selectedQuestion.value = null
  currentPlayer.value = 0

  selectionSummary.value = null
  lastOutcome.value = null

  startFillerInterval()
}

function handleQuestionSelection(q) {
  selectedQuestion.value = q
  const player = players.value[currentPlayer.value]
  selectionSummary.value = `${player.name} selects ${q.category} for $${q.value}:`
  lastOutcome.value = null
}

function handleAnswer(isCorrect, value) {
  const idx = currentPlayer.value
  const player = players.value[idx]
  player.score += isCorrect ? value : -value

  const key = `${selectedQuestion.value?.categoryId}-${selectedQuestion.value?.questionIndex}`
  answeredMap.value[key] = `P${idx + 1}-${isCorrect ? 'correct' : 'incorrect'}`

  lastOutcome.value = isCorrect ? 'Correct!' : 'Incorrect!'
  selectedQuestion.value = null

  if (!isCorrect) {
    currentPlayer.value = (idx + 1) % players.value.length
  }
}

function restartGame() {
  window.location.reload()
}

function distributeQuestions(rawQuestions, validCats) {
  const lookup = {}
  for (const cat of validCats) {
    lookup[cat.name] = cat.id
  }

  const finalCategories = []
  const map = {}
  const used = new Set()

  const valueMap = {
    0: { difficulty: 'easy', value: 100 },
    1: { difficulty: 'easy', value: 200 },
    2: { difficulty: 'medium', value: 300 },
    3: { difficulty: 'medium', value: 400 },
    4: { difficulty: 'hard', value: 500 }
  }

  const questionsByCategory = {}
  for (const q of rawQuestions) {
    if (!questionsByCategory[q.category]) {
      questionsByCategory[q.category] = []
    }
    questionsByCategory[q.category].push(q)
  }

  for (const [catName, questions] of Object.entries(questionsByCategory)) {
    const catId = lookup[catName]
    if (!catId || used.has(catId)) continue

    const slots = []

    for (let i = 0; i < 5; i++) {
      const { difficulty, value } = valueMap[i]
      const match = questions.find(q => q.difficulty === difficulty)

      if (match) {
        questions.splice(questions.indexOf(match), 1)
        slots.push({
          ...match,
          value,
          categoryId: catId,
          questionIndex: i
        })
      } else {
        slots.push({
          question: `🧐 ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} question on the way...`,
          value,
          difficulty,
          correct_answer: null,
          category: catName,
          categoryId: catId,
          questionIndex: i,
          placeholder: true
        })
      }
    }

    finalCategories.push({ id: catId, name: catName })
    map[catId] = slots
    used.add(catId)
    if (finalCategories.length === numCategories.value) break
  }

  return { categories: finalCategories, questionMap: map }
}

async function fillPlaceholders(questionsRef, categories) {
  if (inMenu.value) return

  try {
    const extras = await fetchTriviaQuestions(50)

    for (const cat of categories) {
      const slots = questionsRef[cat.id]
      if (!slots) continue

      for (let i = 0; i < slots.length; i++) {
        const q = slots[i]
        if (!q.placeholder) continue

        const match = extras.find(
          (x) =>
            x.category === cat.name &&
            x.difficulty === q.difficulty
        )

        if (match) {
          extras.splice(extras.indexOf(match), 1)
          slots[i] = {
            ...match,
            value: q.value,
            categoryId: cat.id,
            questionIndex: i
          }
          console.log(`Filled placeholder in ${cat.name} ($${q.value})`)
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch additional questions to fill placeholders.')
  }
}

watchEffect(() => {
  if (
    selectedQuestion.value &&
    selectedQuestion.value.placeholder
  ) {
    const updated = questions.value[selectedQuestion.value.categoryId]?.[selectedQuestion.value.questionIndex]
    if (updated && !updated.placeholder) {
      selectedQuestion.value = {
        ...updated,
        categoryId: selectedQuestion.value.categoryId,
        questionIndex: selectedQuestion.value.questionIndex,
        value: selectedQuestion.value.value
      }
    }
  }
})

onMounted(async () => {
  try {
    await initSessionToken()
    const rawQuestions = await fetchTriviaQuestions(50)
    const validCats = await fetchValidCategories()
    const { categories: cats, questionMap } = distributeQuestions(rawQuestions, validCats)

    categories.value = cats
    questions.value = questionMap

    startFillerInterval()
  } catch (err) {
    console.error(err)
    alert('Error loading questions. Please refresh.')
  }
})

function startFillerInterval() {
  if (window.__fillerInterval) {
    clearInterval(window.__fillerInterval)
  }

  window.__fillerInterval = setInterval(async () => {
    const stillMissing = Object.values(questions.value).some(qList =>
      qList.some(q => q.placeholder)
    )

    if (!stillMissing) {
      clearInterval(window.__fillerInterval)
      console.log('All placeholders filled.')
      return
    }

    try {
      await fillPlaceholders(questions.value, categories.value)
    } catch (e) {
      console.warn('Failed to fill placeholders:', e.message)
    }
  }, 5000)
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
  color: white;
  font-family: 'Impact', 'Arial Black', sans-serif;
  background-color: #111;
}

h1 {
  font-size: 2.5rem;
  margin: 1.5rem 0;
  color: #FFCC00;
  text-shadow: 1px 1px 2px #000;
}

.winner-banner {
  margin-top: 2rem;
  font-size: 1.5rem;
  color: #00ff99;
  background: #000;
  padding: 1rem;
  border: 3px solid #00ff99;
  border-radius: 10px;
}

.winner-banner button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  background-color: #FFCC00;
  color: #000080;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.feedback-box {
  margin-top: 1rem;
  font-size: 1.2rem;
  color: white;
  font-family: 'Georgia', serif;
}

.selection {
  font-weight: bold;
}

.correct-text {
  color: #00FF66;
}

.incorrect-text {
  color: #FF4444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>