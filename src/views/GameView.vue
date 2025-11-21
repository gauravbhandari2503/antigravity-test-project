<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { games } from '../data/games'

const WheelGame = defineAsyncComponent(() => import('../components/games/wheel/WheelGame.vue'))
const TicTacToe = defineAsyncComponent(() => import('../components/games/tic-tac-toe/TicTacToe.vue'))
const Connect4 = defineAsyncComponent(() => import('../components/games/connect-4/Connect4.vue'))
const MemoryMatch = defineAsyncComponent(() => import('../components/games/memory-match/MemoryMatch.vue'))
const Snake = defineAsyncComponent(() => import('../components/games/snake/Snake.vue'))
const Hangman = defineAsyncComponent(() => import('../components/games/hangman/Hangman.vue'))
const Minesweeper = defineAsyncComponent(() => import('../components/games/minesweeper/Minesweeper.vue'))
const Wordle = defineAsyncComponent(() => import('../components/games/wordle/Wordle.vue'))
const Sudoku = defineAsyncComponent(() => import('../components/games/sudoku/Sudoku.vue'))
const Battleship = defineAsyncComponent(() => import('../components/games/battleship/Battleship.vue'))
const Checkers = defineAsyncComponent(() => import('../components/games/checkers/Checkers.vue'))
const Blackjack = defineAsyncComponent(() => import('../components/games/blackjack/Blackjack.vue'))
const Roulette = defineAsyncComponent(() => import('../components/games/roulette/Roulette.vue'))
const Slots = defineAsyncComponent(() => import('../components/games/slots/Slots.vue'))
const Bingo = defineAsyncComponent(() => import('../components/games/bingo/Bingo.vue'))
const Solitaire = defineAsyncComponent(() => import('../components/games/solitaire/Solitaire.vue'))
const Poker = defineAsyncComponent(() => import('../components/games/poker/Poker.vue'))
const Chess = defineAsyncComponent(() => import('../components/games/chess/Chess.vue'))
const Risk = defineAsyncComponent(() => import('../components/games/risk/Risk.vue'))
const Crossword = defineAsyncComponent(() => import('../components/games/crossword/Crossword.vue'))
const Crossword = defineAsyncComponent(() => import('../components/games/crossword/Crossword.vue'))

const route = useRoute()
const router = useRouter()

const gameId = computed(() => route.params.id as string)

const currentGame = computed(() => games.find(g => g.id === gameId.value))



const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="game-view">
    <div class="game-container">
      <button class="back-btn" @click="goBack">
        &larr; Back to Games
      </button>

      <div v-if="currentGame" class="game-content">
        <div class="game-header">
          <h1>{{ currentGame.name }}</h1>
          <p>{{ currentGame.description }}</p>
        </div>

        <div class="game-stage">
          <!-- Dynamic Game Component Rendering -->
          <WheelGame v-if="gameId === 'wheel'" />
          <TicTacToe v-else-if="gameId === 'tic-tac-toe'" />
          <Connect4 v-else-if="gameId === 'connect-4'" />
          <MemoryMatch v-else-if="gameId === 'memory-match'" />
          <Snake v-else-if="gameId === 'snake'" />
          <Hangman v-else-if="gameId === 'hangman'" />
          <Minesweeper v-else-if="gameId === 'minesweeper'" />
          <Wordle v-else-if="gameId === 'wordle'" />
          <Sudoku v-else-if="gameId === 'sudoku'" />
          <Battleship v-else-if="gameId === 'battleship'" />
          <Checkers v-else-if="gameId === 'checkers'" />
          <Blackjack v-else-if="gameId === 'blackjack'" />
          <Roulette v-else-if="gameId === 'roulette'" />
          <Slots v-else-if="gameId === 'slots'" />
          <Bingo v-else-if="gameId === 'bingo'" />
          <Solitaire v-else-if="gameId === 'solitaire'" />
          <Poker v-else-if="gameId === 'poker'" />
          <Chess v-else-if="gameId === 'chess'" />
          <Risk v-else-if="gameId === 'risk'" />
          <Crossword v-else-if="gameId === 'crossword'" />
          <Crossword v-else-if="gameId === 'crossword'" />
          
          <!-- Placeholder for other games -->
          <div v-else class="game-placeholder">
            <div class="placeholder-content">
              <span class="placeholder-icon">{{ currentGame.icon }}</span>
              <h2>Coming Soon!</h2>
              <p>The game "{{ currentGame.name }}" is currently under development.</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="not-found">
        <h2>Game Not Found</h2>
        <button @click="goBack">Return Home</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-view {
  min-height: 100vh;
  padding: 40px 20px;
  background: radial-gradient(circle at top, #1a1a2e 0%, #16213e 100%);
}

.game-container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 20px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
  transform: translateX(-5px);
}

.game-header {
  text-align: center;
  margin-bottom: 40px;
}

.game-header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.game-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
}

.game-stage {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  min-height: 500px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-placeholder {
  text-align: center;
  height: 100%;
  min-height: 420px; /* Adjust based on padding */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.placeholder-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.not-found {
  text-align: center;
  padding: 100px 0;
}
</style>
