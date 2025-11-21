<script setup lang="ts">
import { ref } from 'vue'

interface Card {
  suit: '♠' | '♥' | '♦' | '♣'
  value: string
  numericValue: number
  color: 'red' | 'black'
  faceUp: boolean
  id: string
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const piles = ref<Card[][]>(Array(7).fill([]).map(() => []))
const foundations = ref<Card[][]>(Array(4).fill([]).map(() => []))
const stock = ref<Card[]>([])
const waste = ref<Card[]>([])
const selectedCard = ref<{ card: Card, source: 'pile' | 'waste' | 'foundation', index: number, pileIndex?: number } | null>(null)
const message = ref('Welcome to Solitaire!')

const createDeck = () => {
  const newDeck: Card[] = []
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      newDeck.push({
        suit,
        value: VALUES[i] || '',
        numericValue: i + 1,
        color: ['♥', '♦'].includes(suit) ? 'red' : 'black',
        faceUp: false,
        id: `${VALUES[i]}${suit}`
      })
    }
  }
  return newDeck.sort(() => Math.random() - 0.5)
}

const dealGame = () => {
  const newDeck = createDeck()
  const newPiles: Card[][] = Array(7).fill([]).map(() => [])
  
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = newDeck.pop()
      if (card) {
        if (j === i) card.faceUp = true
        newPiles[i]!.push(card)
      }
    }
  }
  
  piles.value = newPiles
  stock.value = newDeck
  waste.value = []
  foundations.value = Array(4).fill([]).map(() => [])
  selectedCard.value = null
  message.value = 'Good Luck!'
}

const drawCard = () => {
  if (stock.value.length > 0) {
    const card = stock.value.pop()
    if (card) {
      card.faceUp = true
      waste.value.push(card)
    }
  } else {
    // Recycle waste to stock
    while (waste.value.length > 0) {
      const card = waste.value.pop()
      if (card) {
        card.faceUp = false
        stock.value.push(card)
      }
    }
  }
  selectedCard.value = null
}

const selectCard = (card: Card | undefined, source: 'pile' | 'waste' | 'foundation', index: number, pileIndex?: number) => {
  if (!card || !card.faceUp) return

  if (selectedCard.value && selectedCard.value.card.id === card.id) {
    selectedCard.value = null // Deselect
    return
  }

  if (selectedCard.value) {
    // Try to move selected card to this target
    if (isValidMove(selectedCard.value.card, card, source)) {
      moveCard(selectedCard.value, { source, index, pileIndex })
    } else {
      // Select new card instead
      selectedCard.value = { card, source, index, pileIndex }
    }
  } else {
    selectedCard.value = { card, source, index, pileIndex }
  }
}

const selectEmptyPile = (pileIndex: number) => {
  if (selectedCard.value && selectedCard.value.card.value === 'K') {
    moveCard(selectedCard.value, { source: 'pile', index: -1, pileIndex })
  }
}

const isValidMove = (card: Card, target: Card, targetSource: string) => {
  if (targetSource === 'foundation') {
    return card.suit === target.suit && card.numericValue === target.numericValue + 1
  }
  
  if (targetSource === 'pile') {
    return card.color !== target.color && card.numericValue === target.numericValue - 1
  }
  
  return false
}

const moveCard = (from: any, to: any) => {
  let cardsToMove: Card[] = []
  
  if (from.source === 'waste') {
    const card = waste.value.pop()
    if (card) cardsToMove = [card]
  } else if (from.source === 'pile') {
    const pile = piles.value[from.pileIndex!]
    if (pile) {
      const splitIndex = pile.findIndex(c => c.id === from.card.id)
      if (splitIndex !== -1) {
        cardsToMove = pile.splice(splitIndex)
        
        // Flip new top card
        if (pile.length > 0 && pile[pile.length - 1] && !pile[pile.length - 1]!.faceUp) {
          pile[pile.length - 1]!.faceUp = true
        }
      }
    }
  } else if (from.source === 'foundation') {
     const pile = foundations.value[from.pileIndex!]
     if (pile) {
       const card = pile.pop()
       if (card) cardsToMove = [card]
     }
  }

  if (to.source === 'pile') {
    const pile = piles.value[to.pileIndex!]
    if (pile) pile.push(...cardsToMove)
  } else if (to.source === 'foundation') {
    const foundation = foundations.value[to.pileIndex!]
    if (foundation) foundation.push(...cardsToMove)
  }

  selectedCard.value = null
  checkWin()
}

const moveToFoundation = (foundationIndex: number) => {
  if (!selectedCard.value) return
  
  const card = selectedCard.value.card
  const foundation = foundations.value[foundationIndex]
  if (!foundation) return

  const topCard = foundation.length > 0 ? foundation[foundation.length - 1] : null
  
  let canMove = false
  if (!topCard) {
    if (card.value === 'A') canMove = true
  } else {
    if (card.suit === topCard.suit && card.numericValue === topCard.numericValue + 1) canMove = true
  }
  
  if (canMove) {
    moveCard(selectedCard.value, { source: 'foundation', index: -1, pileIndex: foundationIndex })
  }
}

const checkWin = () => {
  if (foundations.value.every(f => f.length === 13)) {
    message.value = "CONGRATULATIONS! YOU WON!"
  }
}

// Initialize
dealGame()
</script>

<template>
  <div class="solitaire">
    <div class="top-area">
      <div class="stock-waste">
        <div class="card-placeholder stock" @click="drawCard">
          <div v-if="stock.length > 0" class="card-back"></div>
          <div v-else class="empty-slot">↻</div>
        </div>
        <div class="card-placeholder waste">
          <div 
            v-if="waste.length > 0" 
            class="card"
            :class="[
              waste[waste.length - 1]?.color,
              { 'selected': selectedCard?.card.id === waste[waste.length - 1]?.id }
            ]"
            @click="selectCard(waste[waste.length - 1], 'waste', waste.length - 1)"
          >
            <div class="top">{{ waste[waste.length - 1]?.value }}{{ waste[waste.length - 1]?.suit }}</div>
            <div class="center">{{ waste[waste.length - 1]?.suit }}</div>
          </div>
        </div>
      </div>

      <div class="foundations">
        <div 
          v-for="(foundation, index) in foundations" 
          :key="index" 
          class="card-placeholder foundation"
          @click="moveToFoundation(index)"
        >
          <div v-if="foundation.length === 0" class="empty-slot">{{ SUITS[index] }}</div>
          <div 
            v-else 
            class="card"
            :class="foundation[foundation.length - 1]?.color"
          >
            <div class="top">{{ foundation[foundation.length - 1]?.value }}{{ foundation[foundation.length - 1]?.suit }}</div>
            <div class="center">{{ foundation[foundation.length - 1]?.suit }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tableau">
      <div 
        v-for="(pile, pIndex) in piles" 
        :key="pIndex" 
        class="pile"
        @click.self="selectEmptyPile(pIndex)"
      >
        <div v-if="pile.length === 0" class="empty-pile-slot" @click="selectEmptyPile(pIndex)"></div>
        <div 
          v-for="(card, cIndex) in pile" 
          :key="card.id" 
          class="card-wrapper"
          :style="{ top: `${cIndex * 30}px` }"
        >
          <div 
            v-if="card.faceUp"
            class="card"
            :class="[
              card.color,
              { 'selected': selectedCard?.card.id === card.id }
            ]"
            @click.stop="selectCard(card, 'pile', cIndex, pIndex)"
          >
            <div class="top">{{ card.value }}{{ card.suit }}</div>
            <div class="center">{{ card.suit }}</div>
          </div>
          <div v-else class="card-back"></div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="message">{{ message }}</div>
      <button class="btn" @click="dealGame">New Game</button>
    </div>
  </div>
</template>

<style scoped>
.solitaire {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  user-select: none;
}

.top-area {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  gap: 2rem;
}

.stock-waste {
  display: flex;
  gap: 1rem;
}

.foundations {
  display: flex;
  gap: 1rem;
}

.card-placeholder {
  width: 80px;
  height: 120px;
  border: 2px dashed rgba(255,255,255,0.3);
  border-radius: 8px;
  position: relative;
  cursor: pointer;
}

.empty-slot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: rgba(255,255,255,0.3);
}

.card {
  width: 80px;
  height: 120px;
  background: white;
  border-radius: 8px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
}

.card.red { color: #e74c3c; }
.card.black { color: #2c3e50; }

.card.selected {
  box-shadow: 0 0 10px #f1c40f, 2px 2px 5px rgba(0,0,0,0.2);
  border: 2px solid #f1c40f;
}

.card-back {
  width: 80px;
  height: 120px;
  background: repeating-linear-gradient(
    45deg,
    #2980b9,
    #2980b9 10px,
    #3498db 10px,
    #3498db 20px
  );
  border-radius: 8px;
  border: 2px solid white;
}

.top { font-weight: bold; font-size: 1.2rem; }
.center { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  font-size: 2.5rem;
}

.tableau {
  display: flex;
  gap: 1rem;
  min-height: 400px;
  padding: 1rem;
}

.pile {
  width: 80px;
  position: relative;
}

.empty-pile-slot {
  width: 80px;
  height: 120px;
  border: 2px dashed rgba(255,255,255,0.1);
  border-radius: 8px;
}

.card-wrapper {
  position: absolute;
  width: 80px;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.message {
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
}

.btn {
  padding: 10px 30px;
  background: #2ecc71;
  border: none;
  border-radius: 25px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
</style>
