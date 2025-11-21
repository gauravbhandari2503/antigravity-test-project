<script setup lang="ts">
import { ref } from 'vue'

type Player = 'X' | 'O'
type Cell = Player | null

const board = ref<Cell[]>(Array(9).fill(null))
const currentPlayer = ref<Player>('X')
const winner = ref<Player | 'Draw' | null>(null)

const winningCombinations: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
]

const checkWinner = (squares: Cell[]): Player | 'Draw' | null => {
  for (const combo of winningCombinations) {
    const a = combo[0]
    const b = combo[1]
    const c = combo[2]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return squares.every(cell => cell !== null) ? 'Draw' : null
}

const makeMove = (index: number) => {
  if (board.value[index] || winner.value) return

  board.value[index] = currentPlayer.value
  const result = checkWinner(board.value)

  if (result) {
    winner.value = result
  } else {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X'
  }
}

const resetGame = () => {
  board.value = Array(9).fill(null)
  currentPlayer.value = 'X'
  winner.value = null
}
</script>

<template>
  <div class="tic-tac-toe">
    <div class="status">
      <h2 v-if="winner">
        {{ winner === 'Draw' ? "It's a Draw!" : `Winner: ${winner}` }}
      </h2>
      <h2 v-else>Player {{ currentPlayer }}'s Turn</h2>
    </div>

    <div class="board">
      <div 
        v-for="(cell, index) in board" 
        :key="index" 
        class="cell"
        :class="{ 'x': cell === 'X', 'o': cell === 'O', 'winner': winner }"
        @click="makeMove(index)"
      >
        {{ cell }}
      </div>
    </div>

    <button class="reset-btn" @click="resetGame">Reset Game</button>
  </div>
</template>

<style scoped>
.tic-tac-toe {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

.status h2 {
  font-size: 2rem;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  aspect-ratio: 1;
}

.cell {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid rgba(255, 255, 255, 0.05);
}

.cell:hover:not(.winner):not(:has(> *)) {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.02);
}

.cell.x {
  color: #4facfe;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
}

.cell.o {
  color: #f093fb;
  text-shadow: 0 0 10px rgba(240, 147, 251, 0.5);
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
