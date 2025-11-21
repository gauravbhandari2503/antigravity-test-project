<script setup lang="ts">
import { ref, onMounted } from 'vue'

const BLANK = 0
const SIZE = 9

// Simple pre-generated puzzle for now (can be expanded with a generator)
const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
]

const INITIAL_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

const board = ref<number[][]>([])
const selectedCell = ref<{r: number, c: number} | null>(null)
const won = ref(false)
const mistakes = ref(0)

const initGame = () => {
  board.value = JSON.parse(JSON.stringify(INITIAL_PUZZLE))
  won.value = false
  mistakes.value = 0
  selectedCell.value = null
}

const selectCell = (r: number, c: number) => {
  if (INITIAL_PUZZLE[r]?.[c] !== BLANK) return
  selectedCell.value = { r, c }
}

const inputNumber = (num: number) => {
  if (!selectedCell.value || won.value) return
  
  const { r, c } = selectedCell.value
  
  const currentVal = board.value[r]?.[c]
  if (currentVal === num) return // No change

  if (SOLUTION[r]?.[c] === num) {
    if (board.value[r]) board.value[r][c] = num
    checkWin()
  } else {
    mistakes.value++
  }
}

const checkWin = () => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board.value[r]?.[c] !== SOLUTION[r]?.[c]) return
    }
  }
  won.value = true
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!selectedCell.value) return
  
  const num = parseInt(e.key)
  if (!isNaN(num) && num >= 1 && num <= 9) {
    inputNumber(num)
  }
}

onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="sudoku">
    <div class="status">
      <h2 v-if="won" class="winner">Solved!</h2>
      <h2 v-else>Mistakes: {{ mistakes }}</h2>
    </div>

    <div class="board">
      <div 
        v-for="(row, r) in board" 
        :key="r" 
        class="row"
        :class="{ 'border-bottom': (r + 1) % 3 === 0 && r < 8 }"
      >
        <div 
          v-for="(cell, c) in row" 
          :key="c"
          class="cell"
          :class="{ 
            'border-right': (c + 1) % 3 === 0 && c < 8,
            'selected': selectedCell?.r === r && selectedCell?.c === c,
            'fixed': INITIAL_PUZZLE[r]?.[c] !== 0,
            'filled': cell !== 0 && INITIAL_PUZZLE[r]?.[c] === 0
          }"
          @click="selectCell(r, c)"
        >
          {{ cell !== 0 ? cell : '' }}
        </div>
      </div>
    </div>

    <div class="numpad">
      <button v-for="n in 9" :key="n" @click="inputNumber(n)">{{ n }}</button>
    </div>

    <button class="reset-btn" @click="initGame">Reset Game</button>
  </div>
</template>

<style scoped>
.sudoku {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.status h2 {
  color: white;
  margin: 0;
}

.winner { color: #55efc4 !important; }

.board {
  display: flex;
  flex-direction: column;
  border: 4px solid #2d3436;
  background: #dfe6e9;
}

.row {
  display: flex;
}

.row.border-bottom {
  border-bottom: 2px solid #2d3436;
}

.cell {
  width: 40px;
  height: 40px;
  border: 1px solid #b2bec3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: #2d3436;
  user-select: none;
}

.cell.border-right {
  border-right: 2px solid #2d3436;
}

.cell.fixed {
  background: #b2bec3;
  font-weight: bold;
  cursor: default;
}

.cell.selected {
  background: #74b9ff;
}

.cell.filled {
  color: #0984e3;
}

.numpad {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 5px;
}

.numpad button {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 4px;
  background: #636e72;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.numpad button:hover {
  background: #b2bec3;
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
}

.reset-btn:hover {
  transform: translateY(-2px);
}
</style>
