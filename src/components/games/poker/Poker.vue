<script setup lang="ts">
import { ref } from 'vue'

interface Card {
  suit: '♠' | '♥' | '♦' | '♣'
  value: string
  numericValue: number
  color: 'red' | 'black'
  id: string
  held: boolean
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣']
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const deck = ref<Card[]>([])
const hand = ref<Card[]>([])
const credits = ref(1000)
const bet = ref(10)
const gameState = ref<'deal' | 'draw' | 'gameover'>('deal')
const message = ref('Place your bet and deal!')
const lastWin = ref(0)

const createDeck = () => {
  const newDeck: Card[] = []
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      newDeck.push({
        suit,
        value: VALUES[i] || '',
        numericValue: i + 2,
        color: ['♥', '♦'].includes(suit) ? 'red' : 'black',
        id: `${VALUES[i]}${suit}`,
        held: false
      })
    }
  }
  return newDeck.sort(() => Math.random() - 0.5)
}

const deal = () => {
  if (credits.value < bet.value) {
    message.value = "Not enough credits!"
    return
  }

  credits.value -= bet.value
  deck.value = createDeck()
  hand.value = deck.value.splice(0, 5)
  gameState.value = 'draw'
  message.value = "Hold cards and draw to improve your hand."
  lastWin.value = 0
}

const toggleHold = (index: number) => {
  if (gameState.value !== 'draw') return
  if (hand.value[index]) {
    hand.value[index].held = !hand.value[index].held
  }
}

const draw = () => {
  // Replace unheld cards
  for (let i = 0; i < 5; i++) {
    if (hand.value[i] && !hand.value[i]!.held) {
      const newCard = deck.value.pop()
      if (newCard) {
        hand.value[i] = newCard
      }
    }
  }
  
  gameState.value = 'gameover'
  evaluateHand()
}

const evaluateHand = () => {
  const counts: Record<string, number> = {}
  const suits: Record<string, number> = {}
  const values: number[] = []

  hand.value.forEach(card => {
    counts[card.value] = (counts[card.value] || 0) + 1
    suits[card.suit] = (suits[card.suit] || 0) + 1
    values.push(card.numericValue)
  })

  values.sort((a, b) => a - b)

  const isFlush = Object.values(suits).some(count => count === 5)
  const isStraight = values.every((val, i) => i === 0 || (values[i - 1] !== undefined && val === values[i - 1]! + 1)) || 
                     (values[0] === 2 && values[1] === 3 && values[2] === 4 && values[3] === 5 && values[4] === 14) // A-5 straight

  const countsValues = Object.values(counts)
  const maxCount = Math.max(...countsValues)
  
  let winMultiplier = 0
  let winName = ''

  if (isFlush && isStraight && values[0] === 10) {
    winMultiplier = 250
    winName = "ROYAL FLUSH"
  } else if (isFlush && isStraight) {
    winMultiplier = 50
    winName = "STRAIGHT FLUSH"
  } else if (maxCount === 4) {
    winMultiplier = 25
    winName = "FOUR OF A KIND"
  } else if (maxCount === 3 && countsValues.includes(2)) {
    winMultiplier = 9
    winName = "FULL HOUSE"
  } else if (isFlush) {
    winMultiplier = 6
    winName = "FLUSH"
  } else if (isStraight) {
    winMultiplier = 4
    winName = "STRAIGHT"
  } else if (maxCount === 3) {
    winMultiplier = 3
    winName = "THREE OF A KIND"
  } else if (countsValues.filter(c => c === 2).length === 2) {
    winMultiplier = 2
    winName = "TWO PAIR"
  } else if (maxCount === 2) {
    // Jacks or Better check
    const pairValue = Object.entries(counts).find(([, count]) => count === 2)?.[0]
    const numericPairValue = VALUES.indexOf(pairValue!) + 2
    if (numericPairValue >= 11) { // J=11, Q=12, K=13, A=14
      winMultiplier = 1
      winName = "JACKS OR BETTER"
    }
  }

  if (winMultiplier > 0) {
    const winAmount = bet.value * winMultiplier
    credits.value += winAmount
    lastWin.value = winAmount
    message.value = `${winName}! You won ${winAmount} credits!`
  } else {
    message.value = "Game Over. Try again!"
  }
  
  // Reset held status
  hand.value.forEach(card => card.held = false)
  gameState.value = 'deal'
}

const adjustBet = (amount: number) => {
  if (gameState.value !== 'deal') return
  const newBet = bet.value + amount
  if (newBet >= 1 && newBet <= credits.value && newBet <= 100) {
    bet.value = newBet
  }
}
</script>

<template>
  <div class="poker">
    <div class="game-area">
      <div class="hand">
        <div 
          v-for="(card, index) in hand" 
          :key="card.id" 
          class="card-container"
          @click="toggleHold(index)"
        >
          <div class="card" :class="card.color">
            <div class="top">{{ card.value }}{{ card.suit }}</div>
            <div class="center">{{ card.suit }}</div>
          </div>
          <div class="hold-indicator" :class="{ active: card.held }">HELD</div>
        </div>
        <!-- Empty slots for initial state -->
        <div v-if="hand.length === 0" v-for="i in 5" :key="i" class="card-placeholder"></div>
      </div>

      <div class="info-panel">
        <div class="message">{{ message }}</div>
        <div class="stats">
          <div class="stat-box">
            <span class="label">Credits</span>
            <span class="value">{{ credits }}</span>
          </div>
          <div class="stat-box">
            <span class="label">Win</span>
            <span class="value">{{ lastWin }}</span>
          </div>
          <div class="stat-box bet-box">
            <span class="label">Bet</span>
            <div class="bet-controls">
              <button @click="adjustBet(-10)" :disabled="gameState !== 'deal'">-</button>
              <span class="value">{{ bet }}</span>
              <button @click="adjustBet(10)" :disabled="gameState !== 'deal'">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button 
          v-if="gameState === 'deal'" 
          class="btn deal-btn" 
          @click="deal"
          :disabled="credits < bet"
        >
          DEAL
        </button>
        <button 
          v-else 
          class="btn draw-btn" 
          @click="draw"
        >
          DRAW
        </button>
      </div>
    </div>
    
    <div class="paytable">
      <h3>Paytable (x Bet)</h3>
      <div class="paytable-grid">
        <div class="pay-row"><span>Royal Flush</span><span>250</span></div>
        <div class="pay-row"><span>Straight Flush</span><span>50</span></div>
        <div class="pay-row"><span>4 of a Kind</span><span>25</span></div>
        <div class="pay-row"><span>Full House</span><span>9</span></div>
        <div class="pay-row"><span>Flush</span><span>6</span></div>
        <div class="pay-row"><span>Straight</span><span>4</span></div>
        <div class="pay-row"><span>3 of a Kind</span><span>3</span></div>
        <div class="pay-row"><span>Two Pair</span><span>2</span></div>
        <div class="pay-row"><span>Jacks or Better</span><span>1</span></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  color: white;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
}

.hand {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: transform 0.2s;
}

.card-container:hover {
  transform: translateY(-5px);
}

.card {
  width: 100px;
  height: 150px;
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.card.red { color: #e74c3c; }
.card.black { color: #2c3e50; }

.top { font-size: 1.5rem; font-weight: bold; }
.center { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  font-size: 4rem;
}

.card-placeholder {
  width: 100px;
  height: 150px;
  background: rgba(255,255,255,0.1);
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 10px;
}

.hold-indicator {
  font-weight: bold;
  color: #f1c40f;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

.hold-indicator.active {
  opacity: 1;
}

.info-panel {
  background: rgba(0,0,0,0.5);
  padding: 1.5rem;
  border-radius: 15px;
  width: 100%;
  text-align: center;
}

.message {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  min-height: 2rem;
  color: #f1c40f;
}

.stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.label {
  font-size: 0.9rem;
  text-transform: uppercase;
  opacity: 0.8;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
}

.bet-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bet-controls button {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
}

.bet-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.actions .btn {
  padding: 15px 50px;
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.1s;
  text-transform: uppercase;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.btn:active { transform: translateY(2px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.deal-btn { background: #2ecc71; color: white; }
.draw-btn { background: #3498db; color: white; }

.paytable {
  background: rgba(0,0,0,0.3);
  padding: 1rem;
  border-radius: 10px;
  width: 100%;
  max-width: 400px;
}

.paytable h3 {
  text-align: center;
  margin-bottom: 10px;
  opacity: 0.8;
}

.paytable-grid {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pay-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 5px;
}

.pay-row span:last-child {
  font-weight: bold;
  color: #f1c40f;
}
</style>
