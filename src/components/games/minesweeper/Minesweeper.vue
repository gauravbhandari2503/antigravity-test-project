<script setup lang="ts">
import { ref } from 'vue'

interface Cell {
  row: number
  col: number
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

const ROWS = 10
const COLS = 10
const MINES = 15

const board = ref<Cell[][]>([])
const gameOver = ref(false)
const won = ref(false)
const mineHit = ref(false)

const initBoard = () => {
  const newBoard: Cell[][] = []
  for (let r = 0; r < ROWS; r++) {
    const row: Cell[] = []
    for (let c = 0; c < COLS; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      })
    }
    newBoard.push(row)
  }

  // Place mines
  let minesPlaced = 0
  while (minesPlaced < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (newBoard[r] && newBoard[r][c] && !newBoard[r][c].isMine) {
      newBoard[r][c].isMine = true
      minesPlaced++
    }
  }

  // Calculate numbers
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = newBoard[r]?.[c]
      if (cell && !cell.isMine) {
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const neighbor = newBoard[nr]?.[nc]
              if (neighbor && neighbor.isMine) {
                count++
              }
            }
          }
        }
        cell.neighborMines = count
      }
    }
  }

  board.value = newBoard
  gameOver.value = false
  won.value = false
  mineHit.value = false
}

const reveal = (r: number, c: number) => {
  const cell = board.value[r]?.[c]
  if (!cell || gameOver.value || cell.isRevealed || cell.isFlagged) return

  cell.isRevealed = true

  if (cell.isMine) {
    gameOver.value = true
    mineHit.value = true
    revealAll()
    return
  }

  if (cell.neighborMines === 0) {
    // Flood fill
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr
        const nc = c + dc
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          reveal(nr, nc)
        }
      }
    }
  }

  checkWin()
}

const toggleFlag = (e: Event, r: number, c: number) => {
  e.preventDefault()
  const cell = board.value[r]?.[c]
  if (!cell || gameOver.value || cell.isRevealed) return
  cell.isFlagged = !cell.isFlagged
}

const revealAll = () => {
  board.value.forEach(row => {
    row.forEach(cell => {
      cell.isRevealed = true
    })
  })
}

const checkWin = () => {
  let revealedCount = 0
  board.value.forEach(row => {
    row.forEach(cell => {
      if (cell.isRevealed) revealedCount++
    })
  })
  if (revealedCount === ROWS * COLS - MINES) {
    won.value = true
    gameOver.value = true
  }
}

initBoard()
</script>

<template>
  <div class="minesweeper">
    <div class="status">
      <h2 v-if="won" class="winner">You Won!</h2>
      <h2 v-else-if="mineHit" class="loser">Boom! Game Over</h2>
      <h2 v-else>Mines: {{ MINES }}</h2>
    </div>

    <div class="board" :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }">
      <div 
        v-for="(row, r) in board" 
        :key="r" 
        class="row"
      >
        <div 
          v-for="(cell, c) in row" 
          :key="c"
          class="cell"
          :class="{ 
            'revealed': cell.isRevealed, 
            'flagged': cell.isFlagged,
            'mine': cell.isRevealed && cell.isMine,
            'safe': cell.isRevealed && !cell.isMine
          }"
          @click="reveal(r, c)"
          @contextmenu="toggleFlag($event, r, c)"
        >
          <span v-if="cell.isRevealed && cell.isMine">💣</span>
          <span v-else-if="cell.isRevealed && cell.neighborMines > 0">{{ cell.neighborMines }}</span>
          <span v-else-if="cell.isFlagged">🚩</span>
        </div>
      </div>
    </div>

    <button class="reset-btn" @click="initBoard">New Game</button>
    <p class="instructions">Left click to reveal, Right click to flag</p>
  </div>
</template>

<style scoped>
.minesweeper {
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
.loser { color: #ff7675 !important; }

.board {
  display: grid;
  gap: 2px;
  background: #2d3436;
  padding: 4px;
  border-radius: 4px;
}

.row {
  display: contents;
}

.cell {
  width: 30px;
  height: 30px;
  background: #636e72;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  transition: background 0.2s;
}

.cell:hover:not(.revealed) {
  background: #b2bec3;
}

.cell.revealed {
  background: #dfe6e9;
  color: #2d3436;
}

.cell.mine {
  background: #ff7675;
}

.cell.flagged {
  background: #ffeaa7;
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

.instructions {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}
</style>
