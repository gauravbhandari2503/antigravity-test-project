<script setup lang="ts">
import { ref } from 'vue'

interface Cell {
  r: number
  c: number
  hasShip: boolean
  isHit: boolean
  isMiss: boolean
}

const SIZE = 10
const SHIPS = [5, 4, 3, 3, 2] // Ship lengths

const playerBoard = ref<Cell[][]>([])
const computerBoard = ref<Cell[][]>([])
const playerTurn = ref(true)
const gameOver = ref(false)
const winner = ref<'Player' | 'Computer' | null>(null)
const message = ref('Your Turn')

const initBoard = () => {
  const board: Cell[][] = []
  for (let r = 0; r < SIZE; r++) {
    const row: Cell[] = []
    for (let c = 0; c < SIZE; c++) {
      row.push({ r, c, hasShip: false, isHit: false, isMiss: false })
    }
    board.push(row)
  }
  return board
}

const placeShips = (board: Cell[][]) => {
  SHIPS.forEach(length => {
    let placed = false
    while (!placed) {
      const horizontal = Math.random() > 0.5
      const r = Math.floor(Math.random() * (horizontal ? SIZE : SIZE - length + 1))
      const c = Math.floor(Math.random() * (horizontal ? SIZE - length + 1 : SIZE))
      
      let canPlace = true
      for (let i = 0; i < length; i++) {
        if (horizontal) {
          if (board[r]?.[c + i]?.hasShip) canPlace = false
        } else {
          if (board[r + i]?.[c]?.hasShip) canPlace = false
        }
      }
      
      if (canPlace) {
        for (let i = 0; i < length; i++) {
          if (horizontal) {
            const cell = board[r]?.[c + i]
            if (cell) cell.hasShip = true
          } else {
            const cell = board[r + i]?.[c]
            if (cell) cell.hasShip = true
          }
        }
        placed = true
      }
    }
  })
}

const startNewGame = () => {
  playerBoard.value = initBoard()
  computerBoard.value = initBoard()
  placeShips(playerBoard.value)
  placeShips(computerBoard.value)
  playerTurn.value = true
  gameOver.value = false
  winner.value = null
  message.value = 'Your Turn'
}

const handleCellClick = (r: number, c: number) => {
  if (gameOver.value || !playerTurn.value) return
  
  const cell = computerBoard.value[r]?.[c]
  if (!cell || cell.isHit || cell.isMiss) return

  if (cell.hasShip) {
    cell.isHit = true
    message.value = 'Hit!'
    checkWin()
  } else {
    cell.isMiss = true
    message.value = 'Miss!'
    playerTurn.value = false
    setTimeout(computerTurn, 1000)
  }
}

const computerTurn = () => {
  if (gameOver.value) return
  
  message.value = "Computer's Turn"
  
  // Simple AI: Random valid move
  let validMove = false
  while (!validMove) {
    const r = Math.floor(Math.random() * SIZE)
    const c = Math.floor(Math.random() * SIZE)
    const cell = playerBoard.value[r]?.[c]
    
    if (cell && !cell.isHit && !cell.isMiss) {
      validMove = true
      if (cell.hasShip) {
        cell.isHit = true
        checkWin()
        if (!gameOver.value) setTimeout(computerTurn, 1000) // Hit again
      } else {
        cell.isMiss = true
        playerTurn.value = true
        message.value = 'Your Turn'
      }
    }
  }
}

const checkWin = () => {
  const playerLost = playerBoard.value.every(row => row.every(cell => !cell.hasShip || cell.isHit))
  const computerLost = computerBoard.value.every(row => row.every(cell => !cell.hasShip || cell.isHit))
  
  if (playerLost) {
    gameOver.value = true
    winner.value = 'Computer'
    message.value = 'Computer Wins!'
  } else if (computerLost) {
    gameOver.value = true
    winner.value = 'Player'
    message.value = 'You Win!'
  }
}

startNewGame()
</script>

<template>
  <div class="battleship">
    <div class="status">
      <h2 :class="{ 'winner': winner === 'Player', 'loser': winner === 'Computer' }">
        {{ message }}
      </h2>
    </div>

    <div class="game-area">
      <div class="board-container">
        <h3>Your Board</h3>
        <div class="board">
          <div v-for="(row, r) in playerBoard" :key="r" class="row">
            <div 
              v-for="(cell, c) in row" 
              :key="c" 
              class="cell"
              :class="{ 
                'ship': cell.hasShip, 
                'hit': cell.isHit, 
                'miss': cell.isMiss 
              }"
            ></div>
          </div>
        </div>
      </div>

      <div class="board-container">
        <h3>Computer Board</h3>
        <div class="board">
          <div v-for="(row, r) in computerBoard" :key="r" class="row">
            <div 
              v-for="(cell, c) in row" 
              :key="c" 
              class="cell enemy"
              :class="{ 
                'hit': cell.isHit, 
                'miss': cell.isMiss 
              }"
              @click="handleCellClick(r, c)"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="gameOver" class="reset-btn" @click="startNewGame">New Game</button>
  </div>
</template>

<style scoped>
.battleship {
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

.game-area {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.board-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.board-container h3 {
  color: white;
  margin: 0;
}

.board {
  display: grid;
  gap: 1px;
  background: #2d3436;
  padding: 2px;
  border: 2px solid #636e72;
}

.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  background: #0984e3;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.cell.ship {
  background: #636e72;
}

.cell.hit {
  background: #ff7675;
}

.cell.miss {
  background: #dfe6e9;
}

.cell.enemy {
  cursor: pointer;
}

.cell.enemy:hover:not(.hit):not(.miss) {
  background: #74b9ff;
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
