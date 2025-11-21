<script setup lang="ts">
import { ref } from 'vue'

const BINGO_LETTERS = ['B', 'I', 'N', 'G', 'O']
const BOARD_SIZE = 5

interface Cell {
  value: number | string
  marked: boolean
  isFree: boolean
}

const board = ref<Cell[][]>([])
const drawnNumbers = ref<number[]>([])
const currentNumber = ref<number | null>(null)
const gameState = ref<'playing' | 'won'>('playing')
const message = ref('Click "Call Number" to start!')
const autoPlay = ref(false)
let autoPlayInterval: any = null

const generateBoard = () => {
  const newBoard: Cell[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  const usedNumbers = new Set<number>()

  // Columns ranges: B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
  for (let col = 0; col < BOARD_SIZE; col++) {
    const min = col * 15 + 1
    const max = min + 14
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (col === 2 && row === 2) {
        newBoard[row]![col] = { value: 'FREE', marked: true, isFree: true }
        continue
      }

      let num
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min
      } while (usedNumbers.has(num))
      
      usedNumbers.add(num)
      newBoard[row]![col] = { value: num, marked: false, isFree: false }
    }
  }
  board.value = newBoard
}

const callNumber = () => {
  if (gameState.value === 'won') return

  let num
  do {
    num = Math.floor(Math.random() * 75) + 1
  } while (drawnNumbers.value.includes(num) && drawnNumbers.value.length < 75)

  if (drawnNumbers.value.length >= 75) {
    message.value = "All numbers called!"
    stopAutoPlay()
    return
  }

  currentNumber.value = num
  drawnNumbers.value.unshift(num)
  message.value = `Called: ${getLetterForNumber(num)} ${num}`
  
  // Auto-mark for improved UX (optional, but good for single player)
  markNumber(num)
}

const getLetterForNumber = (num: number) => {
  if (num <= 15) return 'B'
  if (num <= 30) return 'I'
  if (num <= 45) return 'N'
  if (num <= 60) return 'G'
  return 'O'
}

const markNumber = (num: number) => {
  if (!board.value.length) return
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = board.value[r]?.[c]
      if (cell && cell.value === num) {
        cell.marked = true
        checkWin()
      }
    }
  }
}

const toggleAutoPlay = () => {
  autoPlay.value = !autoPlay.value
  if (autoPlay.value) {
    callNumber()
    autoPlayInterval = setInterval(callNumber, 2000)
  } else {
    stopAutoPlay()
  }
}

const stopAutoPlay = () => {
  autoPlay.value = false
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

const checkWin = () => {
  if (!board.value.length) return

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = board.value[r]
    if (row && row.every(cell => cell.marked)) {
      win()
      return
    }
  }

  // Check cols
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (board.value.every(row => row && row[c] && row[c]!.marked)) {
      win()
      return
    }
  }

  // Check diagonals
  if (board.value.every((row, i) => row && row[i] && row[i]!.marked)) {
    win()
    return
  }
  if (board.value.every((row, i) => row && row[BOARD_SIZE - 1 - i] && row[BOARD_SIZE - 1 - i]!.marked)) {
    win()
    return
  }
}

const win = () => {
  gameState.value = 'won'
  message.value = 'BINGO! You Won!'
  stopAutoPlay()
}

const resetGame = () => {
  stopAutoPlay()
  gameState.value = 'playing'
  drawnNumbers.value = []
  currentNumber.value = null
  message.value = 'Click "Call Number" to start!'
  generateBoard()
}

// Initialize
generateBoard()
</script>

<template>
  <div class="bingo">
    <div class="game-container">
      <div class="board-area">
        <div class="bingo-header">
          <div v-for="letter in BINGO_LETTERS" :key="letter" class="header-cell">
            {{ letter }}
          </div>
        </div>
        <div class="bingo-grid">
          <div v-for="(row, rIndex) in board" :key="rIndex" class="row">
            <div 
              v-for="(cell, cIndex) in row" 
              :key="cIndex" 
              class="cell"
              :class="{ 'marked': cell.marked, 'free': cell.isFree }"
            >
              {{ cell.value }}
            </div>
          </div>
        </div>
      </div>

      <div class="controls-area">
        <div class="current-call" v-if="currentNumber">
          <div class="ball">
            <span class="letter">{{ getLetterForNumber(currentNumber) }}</span>
            <span class="number">{{ currentNumber }}</span>
          </div>
        </div>
        
        <div class="message">{{ message }}</div>

        <div class="buttons">
          <button 
            class="btn call" 
            @click="callNumber" 
            :disabled="gameState === 'won' || autoPlay"
          >
            Call Number
          </button>
          <button 
            class="btn auto" 
            @click="toggleAutoPlay" 
            :class="{ 'active': autoPlay }"
            :disabled="gameState === 'won'"
          >
            {{ autoPlay ? 'Stop Auto' : 'Auto Play' }}
          </button>
          <button class="btn reset" @click="resetGame">New Game</button>
        </div>

        <div class="history">
          <h3>Called Numbers ({{ drawnNumbers.length }})</h3>
          <div class="history-grid">
            <span v-for="n in drawnNumbers" :key="n" class="history-num">{{ n }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bingo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.game-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: center;
  align-items: flex-start;
}

.board-area {
  background: #ecf0f1;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.bingo-header {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 10px;
}

.header-cell {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2c3e50;
  text-align: center;
  text-shadow: 2px 2px 0 #bdc3c7;
}

.bingo-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.cell {
  width: 60px;
  height: 60px;
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  transition: all 0.3s;
}

.cell.marked {
  background: #e74c3c;
  color: white;
  border-color: #c0392b;
  transform: scale(0.95);
}

.cell.free {
  background: #f1c40f;
  font-size: 1rem;
  border-color: #f39c12;
}

.controls-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 300px;
  align-items: center;
}

.current-call {
  display: flex;
  justify-content: center;
}

.ball {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle at 30% 30%, #3498db, #2980b9);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ball .letter { font-size: 1.5rem; font-weight: bold; }
.ball .number { font-size: 2.5rem; font-weight: 900; line-height: 1; }

.message {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  text-align: center;
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 8px;
  width: 100%;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.btn {
  padding: 12px;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.1s;
}

.btn:active { transform: translateY(2px); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.call { background: #2ecc71; color: white; }
.auto { background: #3498db; color: white; }
.auto.active { background: #e74c3c; }
.reset { background: #95a5a6; color: white; }

.history {
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 10px;
  width: 100%;
}

.history h3 {
  margin: 0 0 10px 0;
  color: #f1c40f;
  font-size: 1rem;
  text-align: center;
}

.history-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
  max-height: 150px;
  overflow-y: auto;
}

.history-num {
  background: white;
  color: #2c3e50;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

@keyframes pop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
