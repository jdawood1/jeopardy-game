<template>
  <div class="question-box">
    <h2>
      Question for {{ player.name }}
      <span v-if="isDoubleJeopardy" style="color: #FF66CC"> - Double Jeopardy!</span>
    </h2>

    <p class="question-text" v-html="question.question"></p>

    <div v-if="isDoubleJeopardy && player.score > question.value" class="wager-box">
      <label>
        Wager amount ({{ question.value }} - {{ player.score }}):
        <input type="number" v-model.number="wager" :min="question.value" :max="player.score" />
      </label>
      <p v-if="wagerError" class="wager-error">{{ wagerError }}</p>
    </div>

    <div class="options" v-if="!question.placeholder">
      <button @click="submitAnswer(true)">True</button>
      <button @click="submitAnswer(false)">False</button>
    </div>

    <div class="loading-message" v-else>
      Loading question, please wait...
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: Object,
  player: Object
})

const emit = defineEmits(['answer'])

const isDoubleJeopardy = ref(Math.random() < 0.1)
const wager = ref(null)
const wagerError = ref('')

function submitAnswer(answer) {
  let value = props.question.value

  if (isDoubleJeopardy.value && props.player.score > value) {
    if (wager.value === null) {
      wagerError.value = 'Please enter your wager.'
      return
    }
    const w = parseInt(wager.value)
    if (isNaN(w) || w < value || w > props.player.score) {
      wagerError.value = `Wager must be between ${value} and ${props.player.score}`
      return
    }
    value = w
  }

  const correct = props.question.correct_answer === (answer ? 'True' : 'False')
  emit('answer', correct, value)
}
</script>

<style scoped>
.question-box {
  background-color: #000080;
  color: white;
  padding: 2rem;
  margin: 2rem auto 0;
  border-radius: 12px;
  text-align: center;
  border: 3px solid #FFCC00;
  max-width: 800px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
}

.question-box h2 {
  font-family: 'Impact', 'Arial Black', sans-serif;
  font-size: 1.6rem;
  color: #FFCC00;
  margin-bottom: 1rem;
}

.question-text {
  font-size: 1.4rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-family: 'Georgia', serif;
}

.wager-box {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.wager-box input {
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  width: 100px;
  border-radius: 4px;
  border: none;
}

.wager-error {
  color: #FF6666;
  margin-top: 0.5rem;
  font-weight: bold;
}

.options {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.loading-message {
  font-style: italic;
  color: #ccc;
  font-size: 1.2rem;
}

button {
  padding: 0.75rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #FFCC00;
  color: #000080;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

button:hover {
  transform: scale(1.05);
  background-color: #ffe066;
}
</style>