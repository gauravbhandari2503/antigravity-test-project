<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
const cards = ref<Card[]>([])
const flippedCards = ref<Card[]>([])
const isProcessing = ref(false)
const moves = ref(0)

const shuffleCards = () => {
  const doubledEmojis = [...emojis, ...emojis]
  const shuffled = doubledEmojis
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }))
  cards.value = shuffled
}

const handleCardClick = (card: Card) => {
  if (isProcessing.value || card.isFlipped || card.isMatched) return

  card.isFlipped = true
  flippedCards.value.push(card)

  if (flippedCards.value.length === 2) {
    isProcessing.value = true
    moves.value++
    checkForMatch()
  }
}

const checkForMatch = () => {
  if (flippedCards.value.length < 2) return
  
  const [card1, card2] = flippedCards.value
  if (!card1 || !card2) return

  if (card1.emoji === card2.emoji) {
    card1.isMatched = true
    card2.isMatched = true
    flippedCards.value = []
    isProcessing.value = false
  } else {
    setTimeout(() => {
      if (card1) card1.isFlipped = false
      if (card2) card2.isFlipped = false
      flippedCards.value = []
      isProcessing.value = false
    }, 1000)
  }
}

const resetGame = () => {
  moves.value = 0
  flippedCards.value = []
  isProcessing.value = false
  shuffleCards()
}

onMounted(() => {
  shuffleCards()
})
</script>

<template>
  <div class="memory-match">
    <div class="status">
      <h2>Moves: {{ moves }}</h2>
      <h2 v-if="cards.every(c => c.isMatched)" class="winner">You Won!</h2>
    </div>

    <div class="grid">
      <div 
        v-for="card in cards" 
        :key="card.id" 
        class="card"
        :class="{ 'flipped': card.isFlipped || card.isMatched, 'matched': card.isMatched }"
        @click="handleCardClick(card)"
      >
        <div class="card-inner">
          <div class="card-front">❓</div>
          <div class="card-back">{{ card.emoji }}</div>
        </div>
      </div>
    </div>

    <button class="reset-btn" @click="resetGame">Reset Game</button>
  </div>
</template>

<style scoped>
.memory-match {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.status {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.status h2 {
  font-size: 1.5rem;
  color: white;
  margin: 0;
}

.winner {
  color: #00f2fe !important;
  animation: pulse 1s infinite;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  perspective: 1000px;
}

.card {
  width: 80px;
  height: 80px;
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.card-front {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-back {
  background: white;
  transform: rotateY(180deg);
}

.card.matched .card-back {
  background: #55efc4;
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
  transition: transform 0.2s, box-shadow 0.2s;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
