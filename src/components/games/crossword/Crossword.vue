<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Clue {
  number: number
  direction: 'across' | 'down'
  text: string
  answer: string
  row: number
  col: number
}

interface Cell {
  row: number
  col: number
  letter: string
  number: number | null
  active: boolean
  correct: boolean | null // null = unchecked, true = correct, false = incorrect
  isBlack: boolean
}

const GRID_SIZE = 10
const grid = ref<Cell[][]>([])
const clues = ref<Clue[]>([
  { number: 1, direction: 'across', text: 'Vue.js framework creator', answer: 'EVAN', row: 0, col: 0 },
  { number: 2, direction: 'across', text: 'Web page structure language', answer: 'HTML', row: 2, col: 0 },
  { number: 3, direction: 'across', text: 'Styling language', answer: 'CSS', row: 4, col: 0 },
  { number: 4, direction: 'down', text: 'Programming language of the web', answer: 'JS', row: 0, col: 3 },
  { number: 5, direction: 'down', text: 'Not false', answer: 'TRUE', row: 0, col: 1 },
  { number: 6, direction: 'down', text: 'A collection of data', answer: 'ARRAY', row: 0, col: 5 },
  { number: 7, direction: 'across', text: 'Key-value pair container', answer: 'OBJECT', row: 6, col: 2 },
  { number: 8, direction: 'down', text: 'Looping construct', answer: 'FOR', row: 5, col: 7 },
])

const activeDirection = ref<'across' | 'down'>('across')
const selectedCell = ref<{ r: number, c: number } | null>(null)
const message = ref('Click a cell to start solving!')

const initializeGrid = () => {
  const newGrid: Cell[][] = []
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: Cell[] = []
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push({
        row: r,
        col: c,
        letter: '',
        number: null,
        active: false,
        correct: null,
        isBlack: true // Default to black
      })
    }
    newGrid.push(row)
  }

  // Fill in white squares based on clues
  clues.value.forEach(clue => {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i
      const c = clue.direction === 'across' ? clue.col + i : clue.col
      
      if (newGrid[r] && newGrid[r][c]) {
        newGrid[r][c].isBlack = false
        if (i === 0) {
          newGrid[r][c].number = clue.number
        }
      }
    }
  })

  grid.value = newGrid
}

const selectCell = (r: number, c: number) => {
  if (grid.value[r][c].isBlack) return

  if (selectedCell.value?.r === r && selectedCell.value?.c === c) {
    // Toggle direction if clicking same cell
    activeDirection.value = activeDirection.value === 'across' ? 'down' : 'across'
  } else {
    selectedCell.value = { r, c }
  }
}

const handleInput = (e: KeyboardEvent) => {
  if (!selectedCell.value) return

  const { r, c } = selectedCell.value
  const key = e.key.toUpperCase()

  if (key.length === 1 && key >= 'A' && key <= 'Z') {
    grid.value[r][c].letter = key
    moveFocus(1)
  } else if (key === 'BACKSPACE') {
    grid.value[r][c].letter = ''
    moveFocus(-1)
  } else if (key === 'ARROWUP') {
    moveSelection(-1, 0)
  } else if (key === 'ARROWDOWN') {
    moveSelection(1, 0)
  } else if (key === 'ARROWLEFT') {
    moveSelection(0, -1)
  } else if (key === 'ARROWRIGHT') {
    moveSelection(0, 1)
  }
}

const moveFocus = (step: number) => {
  if (!selectedCell.value) return
  let { r, c } = selectedCell.value

  if (activeDirection.value === 'across') {
    c += step
  } else {
    r += step
  }

  if (grid.value[r] && grid.value[r][c] && !grid.value[r][c].isBlack) {
    selectedCell.value = { r, c }
  }
}

const moveSelection = (dr: number, dc: number) => {
  if (!selectedCell.value) return
  const { r, c } = selectedCell.value
  const nr = r + dr
  const nc = c + dc

  if (grid.value[nr] && grid.value[nr][nc] && !grid.value[nr][nc].isBlack) {
    selectedCell.value = { r: nr, c: nc }
  }
}

const checkSolution = () => {
  let allCorrect = true
  
  // Reset correctness
  grid.value.forEach(row => row.forEach(cell => cell.correct = null))

  // Check each clue
  clues.value.forEach(clue => {
    let clueCorrect = true
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i
      const c = clue.direction === 'across' ? clue.col + i : clue.col
      const cell = grid.value[r][c]
      
      if (cell.letter !== clue.answer[i]) {
        clueCorrect = false
        allCorrect = false
        cell.correct = false
      } else if (cell.correct !== false) {
        cell.correct = true
      }
    }
  })

  if (allCorrect) {
    message.value = "Congratulations! Puzzle Solved!"
  } else {
    message.value = "Some answers are incorrect. Keep trying!"
  }
}

const resetPuzzle = () => {
  grid.value.forEach(row => row.forEach(cell => {
    if (!cell.isBlack) {
      cell.letter = ''
      cell.correct = null
    }
  }))
  message.value = 'Puzzle Reset.'
  selectedCell.value = null
}

onMounted(() => {
  initializeGrid()
  window.addEventListener('keydown', handleInput)
})
</script>

<template>
  <div class="crossword">
    <div class="game-container">
      <div class="grid">
        <div v-for="(row, r) in grid" :key="r" class="row">
          <div 
            v-for="(cell, c) in row" 
            :key="c" 
            class="cell"
            :class="{ 
              'black': cell.isBlack, 
              'selected': selectedCell?.r === r && selectedCell?.c === c,
              'correct': cell.correct === true,
              'incorrect': cell.correct === false
            }"
            @click="selectCell(r, c)"
          >
            <span v-if="cell.number" class="number">{{ cell.number }}</span>
            <span v-if="!cell.isBlack" class="letter">{{ cell.letter }}</span>
          </div>
        </div>
      </div>

      <div class="clues-panel">
        <div class="controls">
          <div class="message">{{ message }}</div>
          <div class="buttons">
            <button class="btn check" @click="checkSolution">Check</button>
            <button class="btn reset" @click="resetPuzzle">Reset</button>
          </div>
        </div>

        <div class="clues-list">
          <div class="clue-column">
            <h3>Across</h3>
            <ul>
              <li v-for="clue in clues.filter(c => c.direction === 'across')" :key="clue.number">
                <strong>{{ clue.number }}.</strong> {{ clue.text }}
              </li>
            </ul>
          </div>
          <div class="clue-column">
            <h3>Down</h3>
            <ul>
              <li v-for="clue in clues.filter(c => c.direction === 'down')" :key="clue.number">
                <strong>{{ clue.number }}.</strong> {{ clue.text }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crossword {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.game-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.grid {
  display: flex;
  flex-direction: column;
  border: 4px solid #2c3e50;
  background: #2c3e50;
}

.row {
  display: flex;
}

.cell {
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #bdc3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
  color: black;
}

.cell.black {
  background: #2c3e50;
  border-color: #2c3e50;
  cursor: default;
}

.cell.selected {
  background: #f1c40f;
}

.cell.correct {
  background: #2ecc71;
  color: white;
}

.cell.incorrect {
  background: #e74c3c;
  color: white;
}

.number {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 0.6rem;
  color: #7f8c8d;
}

.cell.correct .number, .cell.incorrect .number {
  color: rgba(255,255,255,0.8);
}

.clues-panel {
  flex: 1;
  min-width: 300px;
  background: rgba(0,0,0,0.5);
  padding: 1.5rem;
  border-radius: 15px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.message {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1c40f;
  min-height: 1.5em;
}

.buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}

.btn.check { background: #3498db; color: white; }
.btn.reset { background: #95a5a6; color: white; }

.clues-list {
  display: flex;
  gap: 2rem;
}

.clue-column {
  flex: 1;
}

.clue-column h3 {
  border-bottom: 2px solid rgba(255,255,255,0.2);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 0.8rem;
  line-height: 1.4;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .clues-list {
    flex-direction: column;
    gap: 1rem;
  }
  
  .cell {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
}
</style>
