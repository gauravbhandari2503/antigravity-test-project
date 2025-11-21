<script setup lang="ts">
import { ref, computed } from 'vue'

interface Card {
  suit: '♠' | '♥' | '♦' | '♣'
  value: string
  numericValue: number
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣']
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

const deck = ref<Card[]>([])
const playerHand = ref<Card[]>([])
const dealerHand = ref<Card[]>([])
const gameState = ref<'betting' | 'playing' | 'dealerTurn' | 'gameOver'>('betting')
const message = ref('')
const winner = ref<'player' | 'dealer' | 'push' | null>(null)

const createDeck = () => {
  const newDeck: Card[] = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      let numericValue = parseInt(value)
      if (isNaN(numericValue)) {
        numericValue = value === 'A' ? 11 : 10
      }
      newDeck.push({ suit, value, numericValue })
    }
  }
  return newDeck.sort(() => Math.random() - 0.5)
}

const calculateScore = (hand: Card[]) => {
  let score = 0
  let aces = 0
  for (const card of hand) {
    score += card.numericValue
    if (card.value === 'A') aces++
  }
  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }
  return score
}

const playerScore = computed(() => calculateScore(playerHand.value))
const dealerScore = computed(() => calculateScore(dealerHand.value))

const dealGame = () => {
  deck.value = createDeck()
  playerHand.value = [deck.value.pop()!, deck.value.pop()!]
  dealerHand.value = [deck.value.pop()!, deck.value.pop()!]
  gameState.value = 'playing'
  message.value = ''
  winner.value = null
  
  if (playerScore.value === 21) {
    stand()
  }
}

const hit = () => {
  playerHand.value.push(deck.value.pop()!)
  if (playerScore.value > 21) {
    gameState.value = 'gameOver'
    winner.value = 'dealer'
    message.value = 'Bust! Dealer Wins.'
  }
}

const stand = () => {
  gameState.value = 'dealerTurn'
  const playDealer = () => {
    if (dealerScore.value < 17) {
      dealerHand.value.push(deck.value.pop()!)
      setTimeout(playDealer, 1000)
    } else {
      determineWinner()
    }
  }
  playDealer()
}

const determineWinner = () => {
  gameState.value = 'gameOver'
  const pScore = playerScore.value
  const dScore = dealerScore.value

  if (dScore > 21) {
    winner.value = 'player'
    message.value = 'Dealer Busts! You Win!'
  } else if (pScore > dScore) {
    winner.value = 'player'
    message.value = 'You Win!'
  } else if (dScore > pScore) {
    winner.value = 'dealer'
    message.value = 'Dealer Wins.'
  } else {
    winner.value = 'push'
    message.value = 'Push (Tie).'
  }
}

const getCardColor = (suit: string) => {
  return ['♥', '♦'].includes(suit) ? 'red' : 'black'
}
</script>

<template>
  <div class="blackjack">
    <div class="table">
      <div class="dealer-area">
        <h2>Dealer <span v-if="gameState !== 'playing'">({{ dealerScore }})</span></h2>
        <div class="hand">
          <div 
            v-for="(card, index) in dealerHand" 
            :key="index" 
            class="card"
            :class="[
              getCardColor(card.suit),
              { 'hidden': index === 0 && gameState === 'playing' }
            ]"
          >
            <template v-if="!(index === 0 && gameState === 'playing')">
              <div class="top">{{ card.value }}{{ card.suit }}</div>
              <div class="center">{{ card.suit }}</div>
              <div class="bottom">{{ card.value }}{{ card.suit }}</div>
            </template>
            <div v-else class="card-back"></div>
          </div>
        </div>
      </div>

      <div class="message-area" v-if="message">
        <div class="message" :class="winner">{{ message }}</div>
      </div>

      <div class="player-area">
        <h2>Player ({{ playerScore }})</h2>
        <div class="hand">
          <div 
            v-for="(card, index) in playerHand" 
            :key="index" 
            class="card"
            :class="getCardColor(card.suit)"
          >
            <div class="top">{{ card.value }}{{ card.suit }}</div>
            <div class="center">{{ card.suit }}</div>
            <div class="bottom">{{ card.value }}{{ card.suit }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="controls">
      <template v-if="gameState === 'betting' || gameState === 'gameOver'">
        <button class="btn deal" @click="dealGame">Deal</button>
      </template>
      <template v-else-if="gameState === 'playing'">
        <button class="btn hit" @click="hit">Hit</button>
        <button class="btn stand" @click="stand">Stand</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.blackjack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.table {
  background: #27ae60;
  border: 8px solid #2c3e50;
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.3);
}

h2 {
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  margin-bottom: 1rem;
  text-align: center;
}

.hand {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.card {
  width: 80px;
  height: 120px;
  background: white;
  border-radius: 8px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  position: relative;
}

.card.red { color: #e74c3c; }
.card.black { color: #2c3e50; }

.card.hidden {
  background: #34495e;
  border: 2px solid white;
}

.card-back {
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    #c0392b,
    #c0392b 10px,
    #e74c3c 10px,
    #e74c3c 20px
  );
  border-radius: 4px;
}

.top { align-self: flex-start; }
.center { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  font-size: 2.5rem;
}
.bottom { align-self: flex-end; transform: rotate(180deg); }

.message-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 10px 30px;
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: bold;
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.message.player { color: #2ecc71; }
.message.dealer { color: #e74c3c; }
.message.push { color: #f1c40f; }

.controls {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 15px 40px;
  font-size: 1.2rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.1s, filter 0.1s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.btn:active {
  transform: translateY(1px);
}

.deal { background: #f1c40f; color: #2c3e50; }
.hit { background: #3498db; color: white; }
.stand { background: #e74c3c; color: white; }

@keyframes pop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
