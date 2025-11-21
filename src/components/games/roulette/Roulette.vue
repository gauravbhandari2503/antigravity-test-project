<script setup lang="ts">
import { ref } from 'vue'

const NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const selectedBet = ref<string | number | null>(null)
const spinning = ref(false)
const result = ref<number | null>(null)
const message = ref('Place your bet!')
const balance = ref(1000)
const currentBetAmount = ref(10)
const rotation = ref(0)

const getNumberColor = (num: number) => {
  if (num === 0) return 'green'
  return RED_NUMBERS.includes(num) ? 'red' : 'black'
}

const placeBet = (bet: string | number) => {
  if (spinning.value) return
  selectedBet.value = bet
  message.value = `Bet placed on ${bet}. Spin to win!`
}

const spin = () => {
  if (spinning.value || !selectedBet.value) return
  if (balance.value < currentBetAmount.value) {
    message.value = "Insufficient funds!"
    return
  }

  balance.value -= currentBetAmount.value
  spinning.value = true
  message.value = "Spinning..."
  result.value = null

  // Random spin logic
  const randomIndex = Math.floor(Math.random() * NUMBERS.length)
  const winningNumber = NUMBERS[randomIndex]
  
  if (winningNumber === undefined) return

  // Calculate rotation to land on the winning number
  // Each slice is 360 / 37 degrees
  const sliceAngle = 360 / 37
  const extraSpins = 5 * 360 // 5 full rotations
  const targetRotation = extraSpins + (randomIndex * sliceAngle)
  
  rotation.value += targetRotation

  setTimeout(() => {
    spinning.value = false
    result.value = winningNumber
    checkWin(winningNumber)
  }, 3000)
}

const checkWin = (number: number) => {
  let won = false
  let payout = 0

  if (typeof selectedBet.value === 'number') {
    if (selectedBet.value === number) {
      won = true
      payout = currentBetAmount.value * 35
    }
  } else {
    const color = getNumberColor(number)
    const isEven = number !== 0 && number % 2 === 0
    const isOdd = number !== 0 && number % 2 !== 0
    
    if (selectedBet.value === 'red' && color === 'red') won = true
    if (selectedBet.value === 'black' && color === 'black') won = true
    if (selectedBet.value === 'even' && isEven) won = true
    if (selectedBet.value === 'odd' && isOdd) won = true
    
    if (won) payout = currentBetAmount.value * 2
  }

  if (won) {
    balance.value += payout
    message.value = `Winner! ${number} (${getNumberColor(number)}) - You won $${payout}!`
  } else {
    message.value = `Result: ${number} (${getNumberColor(number)}) - Try again!`
  }
}
</script>

<template>
  <div class="roulette">
    <div class="game-area">
      <div class="wheel-container">
        <div class="pointer">▼</div>
        <div 
          class="wheel" 
          :style="{ transform: `rotate(-${rotation}deg)` }"
        >
          <div 
            v-for="(num, index) in NUMBERS" 
            :key="num"
            class="slice"
            :class="getNumberColor(num)"
            :style="{ transform: `rotate(${index * (360/37)}deg)` }"
          >
            <span class="number">{{ num }}</span>
          </div>
        </div>
      </div>

      <div class="betting-board">
        <div class="balance">Balance: ${{ balance }}</div>
        <div class="controls">
          <label>Bet: $</label>
          <input type="number" v-model="currentBetAmount" min="1" :max="balance">
          <button 
            class="spin-btn" 
            @click="spin" 
            :disabled="spinning || !selectedBet"
          >
            SPIN
          </button>
        </div>
        <div class="message">{{ message }}</div>

        <div class="board-grid">
          <div class="zero-row">
            <button 
              class="bet-btn green" 
              :class="{ selected: selectedBet === 0 }"
              @click="placeBet(0)"
            >0</button>
          </div>
          <div class="numbers-grid">
            <button 
              v-for="num in 36" 
              :key="num"
              class="bet-btn"
              :class="[
                getNumberColor(num),
                { selected: selectedBet === num }
              ]"
              @click="placeBet(num)"
            >
              {{ num }}
            </button>
          </div>
          <div class="outside-bets">
            <button 
              class="bet-btn red-bet" 
              :class="{ selected: selectedBet === 'red' }"
              @click="placeBet('red')"
            >RED</button>
            <button 
              class="bet-btn black-bet" 
              :class="{ selected: selectedBet === 'black' }"
              @click="placeBet('black')"
            >BLACK</button>
            <button 
              class="bet-btn" 
              :class="{ selected: selectedBet === 'even' }"
              @click="placeBet('even')"
            >EVEN</button>
            <button 
              class="bet-btn" 
              :class="{ selected: selectedBet === 'odd' }"
              @click="placeBet('odd')"
            >ODD</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roulette {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.game-area {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: center;
  align-items: center;
}

.wheel-container {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 10px solid #2c3e50;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  overflow: hidden;
}

.pointer {
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  color: #f1c40f;
  font-size: 2rem;
  text-shadow: 0 2px 2px rgba(0,0,0,0.5);
}

.wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slice {
  position: absolute;
  top: 0;
  left: 50%;
  width: 20px; /* Approximate width at edge */
  height: 50%;
  transform-origin: bottom center;
  display: flex;
  justify-content: center;
  padding-top: 5px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  clip-path: polygon(0 0, 100% 0, 50% 100%); /* Triangle shape */
  margin-left: -10px; /* Center the slice */
}

.slice.red { background: #e74c3c; }
.slice.black { background: #2c3e50; }
.slice.green { background: #27ae60; }

.betting-board {
  background: #27ae60;
  padding: 2rem;
  border-radius: 10px;
  border: 5px solid #2c3e50;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
}

.balance {
  font-size: 1.5rem;
  color: #f1c40f;
  font-weight: bold;
  text-align: center;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  color: white;
}

.spin-btn {
  padding: 10px 30px;
  background: #f1c40f;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  color: #2c3e50;
}

.spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  background: rgba(0,0,0,0.3);
  color: white;
  padding: 10px;
  text-align: center;
  border-radius: 5px;
  min-height: 40px;
}

.board-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.zero-row {
  display: flex;
  justify-content: center;
}

.numbers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.outside-bets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 10px;
}

.bet-btn {
  padding: 10px;
  border: 2px solid rgba(255,255,255,0.2);
  background: transparent;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.bet-btn:hover {
  background: rgba(255,255,255,0.1);
}

.bet-btn.selected {
  border-color: #f1c40f;
  box-shadow: 0 0 10px #f1c40f;
  background: rgba(241, 196, 15, 0.2);
}

.bet-btn.red { background: #e74c3c; }
.bet-btn.black { background: #2c3e50; }
.bet-btn.green { background: #27ae60; }

.bet-btn.red-bet { background: #e74c3c; }
.bet-btn.black-bet { background: #2c3e50; }
</style>
