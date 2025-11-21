<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 20
const TILE_COUNT = 20
const SPEED = 100

const snake = ref<Position[]>([{ x: 10, y: 10 }])
const food = ref<Position>({ x: 15, y: 15 })
const velocity = ref<Position>({ x: 0, y: 0 })
const score = ref(0)
const gameOver = ref(false)
const gameLoop = ref<number | null>(null)

const spawnFood = () => {
  food.value = {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
  }
  // Ensure food doesn't spawn on snake
  if (snake.value.some(segment => segment.x === food.value.x && segment.y === food.value.y)) {
    spawnFood()
  }
}

const update = () => {
  if (gameOver.value || snake.value.length === 0) return

  const head: Position = { ...snake.value[0]! }
  head.x += velocity.value.x
  head.y += velocity.value.y

  // Wall collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver.value = true
    return
  }

  // Self collision
  if (snake.value.some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver.value = true
    return
  }

  snake.value.unshift(head as Position)

  // Eat food
  if (head.x === food.value.x && head.y === food.value.y) {
    score.value++
    spawnFood()
  } else {
    snake.value.pop()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp':
      if (velocity.value.y !== 1) velocity.value = { x: 0, y: -1 }
      break
    case 'ArrowDown':
      if (velocity.value.y !== -1) velocity.value = { x: 0, y: 1 }
      break
    case 'ArrowLeft':
      if (velocity.value.x !== 1) velocity.value = { x: -1, y: 0 }
      break
    case 'ArrowRight':
      if (velocity.value.x !== -1) velocity.value = { x: 1, y: 0 }
      break
  }
}

const startGame = () => {
  if (gameLoop.value) clearInterval(gameLoop.value)
  snake.value = [{ x: 10, y: 10 }]
  velocity.value = { x: 1, y: 0 }
  score.value = 0
  gameOver.value = false
  spawnFood()
  gameLoop.value = window.setInterval(update, SPEED)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  startGame()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoop.value) clearInterval(gameLoop.value)
})
</script>

<template>
  <div class="snake-game">
    <div class="status">
      <h2>Score: {{ score }}</h2>
      <h2 v-if="gameOver" class="game-over">Game Over!</h2>
    </div>

    <div class="board" :style="{ width: `${TILE_COUNT * GRID_SIZE}px`, height: `${TILE_COUNT * GRID_SIZE}px` }">
      <div 
        v-for="(segment, index) in snake" 
        :key="index"
        class="snake-segment"
        :style="{ left: `${segment.x * GRID_SIZE}px`, top: `${segment.y * GRID_SIZE}px`, width: `${GRID_SIZE - 2}px`, height: `${GRID_SIZE - 2}px` }"
      ></div>
      <div 
        class="food"
        :style="{ left: `${food.x * GRID_SIZE}px`, top: `${food.y * GRID_SIZE}px`, width: `${GRID_SIZE - 2}px`, height: `${GRID_SIZE - 2}px` }"
      ></div>
    </div>

    <button class="reset-btn" @click="startGame">Restart Game</button>
    <p class="controls">Use Arrow Keys to Move</p>
  </div>
</template>

<style scoped>
.snake-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status h2 {
  color: white;
  margin: 0;
}

.game-over {
  color: #ff6b6b !important;
  animation: pulse 1s infinite;
}

.board {
  background: #2d3436;
  position: relative;
  border: 4px solid #636e72;
  border-radius: 4px;
}

.snake-segment {
  position: absolute;
  background: #55efc4;
  border-radius: 2px;
}

.food {
  position: absolute;
  background: #ff7675;
  border-radius: 50%;
  box-shadow: 0 0 10px #ff7675;
}

.reset-btn {
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s;
  margin-top: 1rem;
}

.reset-btn:hover {
  transform: translateY(-2px);
}

.controls {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
