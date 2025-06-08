<template>
  <div class="settings-wrapper">
    <button class="gear-button" @click="showSettings = !showSettings">
      <span class="icon">⚙️</span>
    </button>

    <div v-if="showSettings" class="settings-panel">
      <label>
        Number of Players:
        <select v-model.number="players">
          <option v-for="n in [2, 3, 4, 5, 6]" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <label>
        Number of Categories:
        <select v-model.number="categories">
          <option v-for="n in [2, 3, 4, 5, 6]" :key="n" :value="n">{{ n }}</option>
        </select>
      </label>

      <button class="apply-button" @click="applySettings">Apply</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['update-settings', 'update:showSettings'])

const showSettings = ref(false)
const players = ref(3)
const categories = ref(4)

watch(showSettings, (val) => {
  emit('update:showSettings', val)
})

function applySettings() {
  emit('update-settings', {
    players: players.value,
    categories: categories.value
  })
  showSettings.value = false
}
</script>

<style scoped>
.settings-wrapper {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

.gear-button {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #FFCC00;
  text-shadow: 1px 1px 2px black;
}

.settings-panel {
  margin-top: 0.5rem;
  padding: 1rem;
  background: #000;
  border: 2px solid #FFCC00;
  color: white;
  font-family: 'Arial', sans-serif;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0,0,0,0.6);
}

.settings-panel label {
  display: block;
  margin-bottom: 0.5rem;
}

.apply-button {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #FFCC00;
  color: #000080;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}
</style>