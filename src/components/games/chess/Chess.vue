<script setup lang="ts">
import { ref } from 'vue'

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king'
type PieceColor = 'white' | 'black'

interface Piece {
  type: PieceType
  color: PieceColor
  symbol: string
}

interface Square {
  row: number
  col: number
  piece: Piece | null
}

const BOARD_SIZE = 8
const board = ref<Square[][]>([])
const turn = ref<PieceColor>('white')
const selectedSquare = ref<Square | null>(null)
const validMoves = ref<string[]>([]) // "row,col" strings
const message = ref("White's Turn")
const winner = ref<PieceColor | null>(null)

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
  },
  black: {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
  }
}

const initializeBoard = () => {
  const newBoard: Square[][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: Square[] = []
    for (let c = 0; c < BOARD_SIZE; c++) {
      let piece: Piece | null = null
      
      // Pawns
      if (r === 1) piece = { type: 'pawn', color: 'black', symbol: PIECE_SYMBOLS.black.pawn }
      if (r === 6) piece = { type: 'pawn', color: 'white', symbol: PIECE_SYMBOLS.white.pawn }
      
      // Others
      if (r === 0 || r === 7) {
        const color: PieceColor = r === 0 ? 'black' : 'white'
        const symbols = PIECE_SYMBOLS[color]
        if (c === 0 || c === 7) piece = { type: 'rook', color, symbol: symbols.rook }
        if (c === 1 || c === 6) piece = { type: 'knight', color, symbol: symbols.knight }
        if (c === 2 || c === 5) piece = { type: 'bishop', color, symbol: symbols.bishop }
        if (c === 3) piece = { type: 'queen', color, symbol: symbols.queen }
        if (c === 4) piece = { type: 'king', color, symbol: symbols.king }
      }
      
      row.push({ row: r, col: c, piece })
    }
    newBoard.push(row)
  }
  board.value = newBoard
  turn.value = 'white'
  winner.value = null
  message.value = "White's Turn"
  selectedSquare.value = null
  validMoves.value = []
}

const getSquare = (r: number, c: number) => {
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null
  return board.value[r]?.[c] || null
}

const selectSquare = (square: Square) => {
  if (winner.value) return

  // If selecting own piece
  if (square.piece && square.piece.color === turn.value) {
    selectedSquare.value = square
    calculateValidMoves(square)
    return
  }

  // If moving to a valid square
  if (selectedSquare.value && validMoves.value.includes(`${square.row},${square.col}`)) {
    movePiece(selectedSquare.value, square)
  } else {
    // Deselect if clicking elsewhere
    selectedSquare.value = null
    validMoves.value = []
  }
}

const calculateValidMoves = (square: Square) => {
  const moves: string[] = []
  const piece = square.piece!
  const r = square.row
  const c = square.col

  const addMove = (tr: number, tc: number) => {
    const target = getSquare(tr, tc)
    if (!target) return false // Out of bounds
    
    if (!target.piece) {
      moves.push(`${tr},${tc}`)
      return true // Continue sliding
    } else if (target.piece.color !== piece.color) {
      moves.push(`${tr},${tc}`)
      return false // Capture and stop
    } else {
      return false // Blocked by own piece
    }
  }

  if (piece.type === 'pawn') {
    const direction = piece.color === 'white' ? -1 : 1
    // Move forward 1
    if (getSquare(r + direction, c) && !getSquare(r + direction, c)!.piece) {
      moves.push(`${r + direction},${c}`)
      // Move forward 2 if starting
      if ((piece.color === 'white' && r === 6) || (piece.color === 'black' && r === 1)) {
        if (getSquare(r + direction * 2, c) && !getSquare(r + direction * 2, c)!.piece) {
          moves.push(`${r + direction * 2},${c}`)
        }
      }
    }
    // Capture
    const captureOffsets: [number, number][] = [[direction, -1], [direction, 1]]
    for (const [dr, dc] of captureOffsets) {
      const target = getSquare(r + dr, c + dc)
      if (target && target.piece && target.piece.color !== piece.color) {
        moves.push(`${r + dr},${c + dc}`)
      }
    }
  }

  if (piece.type === 'rook') {
    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    for (const [dr, dc] of directions) {
      let nr = r + dr
      let nc = c + dc
      while (addMove(nr, nc)) {
        nr += dr
        nc += dc
      }
    }
  }

  if (piece.type === 'bishop') {
    const directions: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    for (const [dr, dc] of directions) {
      let nr = r + dr
      let nc = c + dc
      while (addMove(nr, nc)) {
        nr += dr
        nc += dc
      }
    }
  }

  if (piece.type === 'queen') {
    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    for (const [dr, dc] of directions) {
      let nr = r + dr
      let nc = c + dc
      while (addMove(nr, nc)) {
        nr += dr
        nc += dc
      }
    }
  }

  if (piece.type === 'knight') {
    const offsets: [number, number][] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
    for (const [dr, dc] of offsets) {
      addMove(r + dr, c + dc)
    }
  }

  if (piece.type === 'king') {
    const directions: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    for (const [dr, dc] of directions) {
      addMove(r + dr, c + dc)
    }
  }

  validMoves.value = moves
}

const movePiece = (from: Square, to: Square) => {
  // Capture logic (check if king captured)
  if (to.piece && to.piece.type === 'king') {
    winner.value = from.piece!.color
    message.value = `${winner.value === 'white' ? 'White' : 'Black'} Wins!`
  }

  // Move
  to.piece = from.piece
  from.piece = null
  
  // Pawn promotion (auto-queen for simplicity)
  if (to.piece!.type === 'pawn') {
    if ((to.piece!.color === 'white' && to.row === 0) || (to.piece!.color === 'black' && to.row === 7)) {
      to.piece!.type = 'queen'
      to.piece!.symbol = PIECE_SYMBOLS[to.piece!.color].queen
    }
  }

  if (!winner.value) {
    turn.value = turn.value === 'white' ? 'black' : 'white'
    message.value = `${turn.value === 'white' ? 'White' : 'Black'}'s Turn`
  }
  
  selectedSquare.value = null
  validMoves.value = []
}

// Initialize
initializeBoard()
</script>

<template>
  <div class="chess">
    <div class="game-info">
      <div class="status">{{ message }}</div>
      <button class="btn" @click="initializeBoard">New Game</button>
    </div>

    <div class="board">
      <div v-for="(row, rIndex) in board" :key="rIndex" class="row">
        <div 
          v-for="(square, cIndex) in row" 
          :key="cIndex" 
          class="square"
          :class="[
            (rIndex + cIndex) % 2 === 0 ? 'light' : 'dark',
            { 'selected': selectedSquare === square },
            { 'valid-move': validMoves.includes(`${rIndex},${cIndex}`) }
          ]"
          @click="selectSquare(square)"
        >
          <div 
            v-if="square.piece" 
            class="piece"
            :class="square.piece.color"
          >
            {{ square.piece.symbol }}
          </div>
          <div v-if="validMoves.includes(`${rIndex},${cIndex}`) && !square.piece" class="move-dot"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chess {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.game-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.status {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: rgba(0,0,0,0.5);
  padding: 10px 20px;
  border-radius: 8px;
}

.board {
  display: flex;
  flex-direction: column;
  border: 10px solid #5d4037;
  border-radius: 4px;
}

.row {
  display: flex;
}

.square {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.square.light { background: #f0d9b5; }
.square.dark { background: #b58863; }

.square.selected {
  background: #7b61ff !important;
}

.square.valid-move {
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
}

.piece {
  font-size: 3rem;
  user-select: none;
  line-height: 1;
}

.piece.white { color: white; text-shadow: 0 0 2px black; }
.piece.black { color: black; }

.move-dot {
  width: 15px;
  height: 15px;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
}

.btn {
  padding: 10px 20px;
  font-size: 1.1rem;
  background: #2ecc71;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

@media (max-width: 600px) {
  .square { width: 40px; height: 40px; }
  .piece { font-size: 2rem; }
}
</style>
