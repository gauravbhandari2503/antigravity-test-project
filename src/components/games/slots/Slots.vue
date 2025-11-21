<script setup lang="ts">
import { ref } from 'vue'

const SYMBOLS = ['🍒', '🔔', '🍋', '💎', '7️⃣', '🍇']
const REELS = 3
const ROWS = 3

const balance = ref(1000)
const bet = ref(10)
const spinning = ref(false)
const reels = ref<string[][]>([
  ['7️⃣', '7️⃣', '7️⃣'],
  ['7️⃣', '7️⃣', '7️⃣'],
  ['7️⃣', '7️⃣', '7️⃣']
])
const message = ref('Place your bet and spin!')
const winAmount = ref(0)

const spin = () => {
  if (spinning.value || balance.value < bet.value) return

  balance.value -= bet.value
  spinning.value = true
  message.value = 'Spinning...'
  winAmount.value = 0

  // Animate reels
  let spins = 0
  const interval = setInterval(() => {
    reels.value = reels.value.map(() => 
      Array(ROWS).fill('').map(() => {
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        return (symbol || SYMBOLS[0]) as string
      })
    )
    spins++
    if (spins > 20) {
      clearInterval(interval)
      finalizeSpin()
    }
  }, 100)
}

const finalizeSpin = () => {
  spinning.value = false
  
  // Generate final result
  const result: string[][] = []
  for (let i = 0; i < REELS; i++) {
    const reel: string[] = []
    for (let j = 0; j < ROWS; j++) {
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      reel.push((symbol || SYMBOLS[0]) as string)
    }
    result.push(reel)
  }
  reels.value = result

  checkWin(result)
}

const checkWin = (result: string[][]) => {
  let totalWin = 0

  // Check rows
  for (let r = 0; r < ROWS; r++) {
    const rowSymbols = result.map(reel => reel[r])
    const firstSymbol = rowSymbols[0]
    if (firstSymbol && rowSymbols.every(s => s === firstSymbol)) {
      totalWin += getPayout(firstSymbol)
    }
  }

  // Check diagonals
  const d1_0 = result[0]?.[0]
  const d1_1 = result[1]?.[1]
  const d1_2 = result[2]?.[2]
  
  if (d1_0 && d1_1 && d1_2) {
    const diag1 = [d1_0, d1_1, d1_2]
    if (diag1.every(s => s === diag1[0])) {
      totalWin += getPayout(diag1[0] as string)
    }
  }

  const d2_0 = result[0]?.[2]
  const d2_1 = result[1]?.[1]
  const d2_2 = result[2]?.[0]

  if (d2_0 && d2_1 && d2_2) {
    const diag2 = [d2_0, d2_1, d2_2]
    if (diag2.every(s => s === diag2[0])) {
      totalWin += getPayout(diag2[0] as string)
    }
  }

  if (totalWin > 0) {
    balance.value += totalWin
    winAmount.value = totalWin
    message.value = `BIG WIN! $${totalWin}`
  } else {
    message.value = 'Try again!'
  }
}

const getPayout = (symbol: string) => {
  const base = bet.value
  switch (symbol) {
    case '7️⃣': return base * 50
    case '💎': return base * 25
    case '🔔': return base * 15
    case '🍇': return base * 10
    case '🍋': return base * 5
    case '🍒': return base * 2
    default: return 0
  }
}
</script>

<template>
  <div class="slots">
    <div class="machine">
      <div class="display">
        <div v-for="(reel, i) in reels" :key="i" class="reel">
          <div v-for="(symbol, j) in reel" :key="j" class="symbol">
            {{ symbol }}
          </div>
        </div>
      </div>
      
      <div class="controls">
        <div class="info">
          <div class="balance">Balance: ${{ balance }}</div>
          <div class="win" v-if="winAmount > 0">Win: ${{ winAmount }}</div>
        </div>
        
        <div class="actions">
          <div class="bet-control">
            <label>Bet:</label>
            <input type="number" v-model="bet" min="1" :max="balance">
          </div>
          <button 
            class="spin-btn" 
            @click="spin" 
            :disabled="spinning || balance < bet"
          >
            {{ spinning ? '...' : 'SPIN' }}
          </button>
        </div>
        
        <div class="message">{{ message }}</div>
      </div>
    </div>
    
    <div class="paytable">
      <h3>Paytable</h3>
      <div class="pay-row" v-for="s in SYMBOLS" :key="s">
        <span>{{ s }} {{ s }} {{ s }}</span>
        <span>{{ getPayout(s) / bet }}x</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slots {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.machine {
  background: #2c3e50;
  padding: 2rem;
  border-radius: 20px;
  border: 8px solid #f1c40f;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.display {
  display: flex;
  gap: 10px;
  background: #ecf0f1;
  padding: 15px;
  border-radius: 10px;
  border: 4px solid #95a5a6;
}

.reel {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.symbol {
  width: 80px;
  height: 80px;
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #34495e;
  padding: 1.5rem;
  border-radius: 10px;
}

.info {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1c40f;
}

.win {
  color: #2ecc71;
  animation: pulse 0.5s infinite;
}

.actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.bet-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: bold;
}

input {
  width: 80px;
  padding: 8px;
  border-radius: 5px;
  border: none;
  font-size: 1.1rem;
  text-align: center;
}

.spin-btn {
  padding: 15px 40px;
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to bottom, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 5px 0 #962d22;
  transition: transform 0.1s, box-shadow 0.1s;
}

.spin-btn:active {
  transform: translateY(5px);
  box-shadow: none;
}

.spin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message {
  text-align: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  min-height: 1.5rem;
}

.paytable {
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 10px;
  color: white;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.paytable h3 {
  grid-column: span 2;
  text-align: center;
  margin: 0 0 0.5rem 0;
  color: #f1c40f;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(255,255,255,0.1);
  padding: 5px 10px;
  border-radius: 4px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
