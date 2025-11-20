<script setup lang="ts">
import { ref } from 'vue';
import GameSetup from './components/GameSetup.vue';
import GameWheel from './components/GameWheel.vue';
import GameStats from './components/GameStats.vue';
import type { GameOption, RoundResult } from './types';

const phase = ref<'setup' | 'game'>('setup');
const options = ref<GameOption[]>([]);
const history = ref<RoundResult[]>([]);
const roundCounter = ref(1);

const handleStartGame = (initialOptions: GameOption[]) => {
  options.value = [...initialOptions];
  phase.value = 'game';
};

const handleSpinEnd = (selected: GameOption) => {
  const isEliminated = !selected.isSafe;
  
  history.value.unshift({
    roundNumber: roundCounter.value++,
    selectedOption: selected,
    eliminated: isEliminated
  });

  if (isEliminated) {
    // Remove from options after a short delay to let the user see the result
    setTimeout(() => {
      options.value = options.value.filter(opt => opt.id !== selected.id);
      
      // Check for game over
      if (options.value.length === 0) {
        alert('Game Over! All options eliminated.');
        resetGame();
      }
    }, 1000);
  }
};

const resetGame = () => {
  phase.value = 'setup';
  options.value = [];
  history.value = [];
  roundCounter.value = 1;
};
</script>

<template>
  <div class="app-container">
    <header>
      <h1>🎡 Wheel of Destiny</h1>
    </header>

    <main>
      <Transition name="fade" mode="out-in">
        <GameSetup 
          v-if="phase === 'setup'" 
          @start-game="handleStartGame" 
        />
        
        <div v-else class="game-layout">
          <div class="wheel-section">
            <GameWheel 
              :options="options" 
              @spin-end="handleSpinEnd" 
            />
            <button class="reset-btn" @click="resetGame">Reset Game</button>
          </div>
          
          <div class="stats-section">
            <GameStats :history="history" />
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: 'Inter', sans-serif;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header h1 {
  font-size: 4rem;
  margin-bottom: 2rem;
  font-weight: 900;
  background: linear-gradient(to right, var(--color-primary), var(--color-accent), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 2em rgba(244, 63, 94, 0.2));
  animation: title-pulse 3s ease-in-out infinite;
}

@keyframes title-pulse {
  0%, 100% { filter: drop-shadow(0 0 2em rgba(244, 63, 94, 0.2)); }
  50% { filter: drop-shadow(0 0 3em rgba(139, 92, 246, 0.4)); }
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
  align-items: start;
  margin-top: 2rem;
}

@media (max-width: 900px) {
  .game-layout {
    grid-template-columns: 1fr;
  }
}

.reset-btn {
  margin-top: 30px;
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-muted);
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
