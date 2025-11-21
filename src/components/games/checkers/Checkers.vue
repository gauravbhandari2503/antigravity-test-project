<script setup lang="ts">
import { ref } from 'vue'

interface Piece {
  player: 'Red' | 'Black'
  isKing: boolean
}

interface Cell {
  r: number
  c: number
  piece: Piece | null
  isHighlighted: boolean
}

const SIZE = 8
const board = ref<Cell[][]>([])
const turn = ref<'Red' | 'Black'>('Black') // Black moves first usually
const selectedCell = ref<{r: number, c: number} | null>(null)
const validMoves = ref<{r: number, c: number}[]>([])
const winner = ref<'Red' | 'Black' | null>(null)

const initBoard = () => {
  const newBoard: Cell[][] = []
  for (let r = 0; r < SIZE; r++) {
    const row: Cell[] = []
    for (let c = 0; c < SIZE; c++) {
      let piece: Piece | null = null
      if ((r + c) % 2 === 1) {
        if (r < 3) piece = { player: 'Red', isKing: false }
        if (r > 4) piece = { player: 'Black', isKing: false }
      }
      row.push({ r, c, piece, isHighlighted: false })
    }
    newBoard.push(row)
  }
  board.value = newBoard
  turn.value = 'Black'
  selectedCell.value = null
  validMoves.value = []
  winner.value = null
}

const getValidMoves = (r: number, c: number, piece: Piece) => {
  const moves: {r: number, c: number, jump?: {r: number, c: number}}[] = []
  const directions = []
  
  if (piece.player === 'Black' || piece.isKing) directions.push([-1, -1], [-1, 1])
  if (piece.player === 'Red' || piece.isKing) directions.push([1, -1], [1, 1])

  directions.forEach(([dr, dc]) => {
    if (dr === undefined || dc === undefined) return
    const nr = r + dr
    const nc = c + dc
    
    if (isValidPos(nr, nc)) {
      const targetCell = board.value[nr]?.[nc]
      if (targetCell && !targetCell.piece) {
        moves.push({ r: nr, c: nc })
      } else if (targetCell?.piece?.player !== piece.player) {
        // Check jump
        const jr = nr + dr
        const jc = nc + dc
        if (isValidPos(jr, jc)) {
          const jumpCell = board.value[jr]?.[jc]
          if (jumpCell && !jumpCell.piece) {
            moves.push({ r: jr, c: jc, jump: { r: nr, c: nc } })
          }
        }
      }
    }
  })
  
  return moves
}

const isValidPos = (r: number, c: number) => {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE
}

const handleCellClick = (r: number, c: number) => {
  if (winner.value) return

  const cell = board.value[r]?.[c]
  if (!cell) return

  // If clicking a valid move for selected piece
  if (selectedCell.value && validMoves.value.some(m => m.r === r && m.c === c)) {
    movePiece(selectedCell.value.r, selectedCell.value.c, r, c)
    return
  }

  // Select piece
  if (cell.piece && cell.piece.player === turn.value) {
    selectedCell.value = { r, c }
    const moves = getValidMoves(r, c, cell.piece)
    // Filter jumps if mandatory jumps rule exists (skipping for simplicity, but prioritizing jumps is standard)
    // For now, just show all valid moves
    validMoves.value = moves.map(m => ({ r: m.r, c: m.c }))
    
    // Highlight
    board.value.forEach(row => row.forEach(c => c.isHighlighted = false))
    moves.forEach(m => {
      const moveCell = board.value[m.r]?.[m.c]
      if (moveCell) moveCell.isHighlighted = true
    })
  } else {
    selectedCell.value = null
    validMoves.value = []
    board.value.forEach(row => row.forEach(c => c.isHighlighted = false))
  }
}

const movePiece = (fromR: number, fromC: number, toR: number, toC: number) => {
  const fromCell = board.value[fromR]?.[fromC]
  const toCell = board.value[toR]?.[toC]
  
  if (!fromCell || !toCell || !fromCell.piece) return

  const piece = fromCell.piece
  const moves = getValidMoves(fromR, fromC, piece)
  const move = moves.find(m => m.r === toR && m.c === toC)
  
  if (!move) return

  // Move piece
  toCell.piece = piece
  fromCell.piece = null

  // Handle jump capture
  if (move.jump) {
    const jumpCell = board.value[move.jump.r]?.[move.jump.c]
    if (jumpCell) jumpCell.piece = null
  }

  // King promotion
  if (piece.player === 'Black' && toR === 0) piece.isKing = true
  if (piece.player === 'Red' && toR === SIZE - 1) piece.isKing = true

  // Clear selection
  selectedCell.value = null
  validMoves.value = []
  board.value.forEach(row => row.forEach(c => c.isHighlighted = false))

  // Check win
  checkWin()

  // Switch turn
  turn.value = turn.value === 'Black' ? 'Red' : 'Black'
}

const checkWin = () => {
  const redPieces = board.value.flat().filter(c => c.piece?.player === 'Red').length
  const blackPieces = board.value.flat().filter(c => c.piece?.player === 'Black').length
  
  if (redPieces === 0) winner.value = 'Black'
  if (blackPieces === 0) winner.value = 'Red'
}

initBoard()
</script>

<template>
  <div class="checkers">
    <div class="status">
      <h2 v-if="winner" :class="winner.toLowerCase()">{{ winner }} Wins!</h2>
      <h2 v-else>Turn: <span :class="turn.toLowerCase()">{{ turn }}</span></h2>
    </div>

    <div class="board">
      <div v-for="(row, r) in board" :key="r" class="row">
        <div 
          v-for="(cell, c) in row" 
          :key="c" 
          class="cell"
          :class="{ 
            'dark': (r + c) % 2 === 1,
            'highlight': cell.isHighlighted,
            'selected': selectedCell?.r === r && selectedCell?.c === c
          }"
          @click="handleCellClick(r, c)"
        >
          <div 
            v-if="cell.piece" 
            class="piece"
            :class="[
              cell.piece.player.toLowerCase(),
              { 'king': cell.piece.isKing }
            ]"
          >
            <span v-if="cell.piece.isKing">👑</span>
          </div>
        </div>
      </div>
    </div>

    <button class="reset-btn" @click="initBoard">New Game</button>
  </div>
</template>

<style scoped>
.checkers {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.status h2 {
  color: white;
  margin: 0;
}

.red { color: #ff7675; }
.black { color: #636e72; } /* Using grey for black to be visible on dark bg */

.board {
  display: flex;
  flex-direction: column;
  border: 4px solid #636e72;
}

.row {
  display: flex;
}

.cell {
  width: 50px;
  height: 50px;
  background: #dfe6e9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cell.dark {
  background: #2d3436;
}

.cell.highlight {
  background: #81ecec; /* Highlight valid moves */
}

.cell.selected {
  background: #74b9ff;
}

.piece {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.piece.red {
  background: #ff7675;
  border: 2px solid #d63031;
}

.piece.black {
  background: #636e72;
  border: 2px solid #2d3436;
}

.piece.king {
  border-color: #ffeaa7;
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
