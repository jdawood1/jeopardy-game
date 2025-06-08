<template>
  <div class="players">
    <div
      v-for="(player, index) in players"
      :key="index"
      :class="['player', { active: index === currentPlayer }]"
    >
      {{ player.name }}: ${{ player.score }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  players: Array,
  currentPlayer: Number
})
</script>

<style scoped>
.players {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1rem 0 2rem;
  font-family: 'Impact', 'Arial Black', sans-serif;
}

.player {
  padding: 0.6rem 1.2rem;
  border: 2px solid #FFCC00;
  border-radius: 6px;
  background-color: #000080;
  color: #FFCC00;
  font-size: 1.4rem;
  text-shadow: 1px 1px 2px #000;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s, background-color 0.2s;
}

.player.active {
  background-color: #FFCC00;
  color: #000080;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(255, 204, 0, 0.6);
}
</style>