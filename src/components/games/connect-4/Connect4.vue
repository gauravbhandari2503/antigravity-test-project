<script setup lang="ts">
import { ref } from 'vue'

type Player = 'Red' | 'Yellow'
type Cell = Player | null

const ROWS = 6
const COLS = 7
const board = ref<Cell[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)))
const currentPlayer = ref<Player>('Red')
const winner = ref<Player | 'Draw' | null>(null)

const checkWinner = (r: number, c: number, player: Player): boolean => {
  // Directions: [row, col]
  const directions: [number, number][] = [
    [0, 1],  // Horizontal
    [1, 0],  // Vertical
    [1, 1],  // Diagonal /
    [1, -1]  // Diagonal \
  ]

  for (const dir of directions) {
    const dr = dir[0]
    const dc = dir[1]
    let count = 1
    // Check forward
    for (let i = 1; i < 4; i++) {
      const nr = r + dr * i
      const nc = c + dc * i
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board.value[nr] && board.value[nr][nc] === player) {
        count++
      } else {
        break
      }
    }
    // Check backward
    for (let i = 1; i < 4; i++) {
      const nr = r - dr * i
      const nc = c - dc * i
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board.value[nr] && board.value[nr][nc] === player) {
        count++
      } else {
        break
      }
    }
    if (count >= 4) return true
  }
  return false
}

const dropPiece = (colIndex: number) => {
  if (winner.value) return

  // Find the lowest empty row in the selected column
  for (let r = ROWS - 1; r >= 0; r--) {
    const row = board.value[r]
    if (row && !row[colIndex]) {
      row[colIndex] = currentPlayer.value
      
      if (checkWinner(r, colIndex, currentPlayer.value)) {
        winner.value = currentPlayer.value
      } else if (board.value.every(row => row.every(cell => cell !== null))) {
        winner.value = 'Draw'
      } else {
        currentPlayer.value = currentPlayer.value === 'Red' ? 'Yellow' : 'Red'
      }
      return
    }
  }
}

const resetGame = () => {
  board.value = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  currentPlayer.value = 'Red'
  winner.value = null
}
</script>

<template>
  <div class="connect-4">
    <div class="status">
      <h2 v-if="winner">
        {{ winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}` }}
      </h2>
      <h2 v-else>Player <span :class="currentPlayer.toLowerCase()">{{ currentPlayer }}</span>'s Turn</h2>
    </div>

    <div class="board">
      <div v-for="(row, rIndex) in board" :key="rIndex" class="row">
        <div 
          v-for="(cell, cIndex) in row" 
          :key="cIndex" 
          class="cell"
          @click="dropPiece(cIndex)"
        >
          <div class="piece" :class="{ 'red': cell === 'Red', 'yellow': cell === 'Yellow' }"></div>
        </div>
      </div>
    </div>

    <button class="reset-btn" @click="resetGame">Reset Game</button>
  </div>
</template>

<style scoped>
.connect-4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.status h2 {
  font-size: 2rem;
  color: white;
  margin: 0;
}

.status span.red { color: #ff6b6b; }
.status span.yellow { color: #feca57; }

.board {
  background: #2d3436;
  padding: 15px;
  border-radius: 15px;
  border: 4px solid #0984e3;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}

.row {
  display: flex;
}

.cell {
  width: 60px;
  height: 60px;
  background: #0984e3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cell:hover {
  background: #74b9ff;
}

.piece {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #dfe6e9; /* Empty slot color */
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.piece.red {
  background: #ff6b6b;
  box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2);
}

.piece.yellow {
  background: #feca57;
  box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2);
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
}
</style>
