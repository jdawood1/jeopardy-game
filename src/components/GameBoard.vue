<template>
  <div class="board">
    <div
      class="row header"
      :style="{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }"
    >
      <div
        v-for="category in categories"
        :key="category.id"
        class="cell category"
      >
        {{ categoryNames?.[category.id] || category.name }}
      </div>
    </div>

    <div
      class="row"
      v-for="(value, index) in [100, 200, 300, 400, 500]"
      :key="value"
      :style="{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }"
    >
      <div
        v-for="category in categories"
        :key="category.id"
        class="cell dollar"
        :class="getCellClass(category.id, index)"
        @click="handleClick(category.id, index, value)"
      >
        <span :class="getLabelClass(category.id, index)">
          {{ getCellLabel(category.id, index, value) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: Array,
  questions: Object,
  answered: Object,
  categoryNames: Object,
  selected: Object,
  disabled: Boolean
})

const emit = defineEmits(['selectQuestion'])

function getCellLabel(catId, idx, value) {
  const key = `${catId}-${idx}`
  const result = props.answered[key]

  if (result) {
    return result.split('-')[0]
  }

  if (
    props.selected &&
    props.selected.categoryId === catId &&
    props.selected.questionIndex === idx
  ) {
    return `P${props.selected.playerIndex + 1}`
  }

  return `$${value}`
}

function getLabelClass(catId, idx) {
  const key = `${catId}-${idx}`
  const result = props.answered[key]

  if (result) {
    const [, outcome] = result.split('-')
    return outcome === 'correct' ? 'label-correct' : 'label-incorrect'
  }

  if (
    props.selected &&
    props.selected.categoryId === catId &&
    props.selected.questionIndex === idx
  ) {
    return 'label-selected'
  }

  return ''
}

function getCellClass(catId, idx) {
  const key = `${catId}-${idx}`
  const result = props.answered[key]

  if (result) {
    const [, outcome] = result.split('-')
    return outcome === 'correct' ? 'correct' : 'incorrect'
  }

  return ''
}

function handleClick(catId, index, value) {
  if (props.disabled) return

  const key = `${catId}-${index}`
  if (props.answered[key]) return

  const question = props.questions[catId]?.[index]
  if (!question) return

  emit('selectQuestion', {
    ...question,
    categoryId: catId,
    questionIndex: index,
    value
  })
}
</script>

<style scoped>
.board {
  display: grid;
  grid-template-rows: auto;
  gap: 2px;
  background-color: black;
  border: 4px solid black;
  padding: 4px;
  font-family: 'Impact', 'Arial Black', sans-serif;
  max-width: 1000px;
  min-width: 1000px;
  margin: auto;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.cell {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  font-weight: bold;
  font-size: 1.6rem;
  user-select: none;
  border: 2px solid black;
  text-align: center;
  cursor: pointer;
  min-height: 80px;
  text-shadow: 1px 1px 1px #000;
}

.category {
  background-color: #000080;
  color: white;
  font-size: 0.85rem;
  text-transform: uppercase;
  padding: 4px;
  line-height: 1.2;
  word-break: break-word;
}

.dollar {
  background-color: #000080;
  color: #FFCC00;
  font-size: 1.8rem;
}

.correct {
  background-color: #004400;
}

.incorrect {
  background-color: #660000;
}

.label-correct {
  color: #00FF00;
}

.label-incorrect {
  color: #FF6666;
}

.label-selected {
  color: white;
}

.cell:hover:not(.correct):not(.incorrect):not(.category) {
  background-color: #0011aa;
}
</style>