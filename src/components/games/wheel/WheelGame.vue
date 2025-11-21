<script setup lang="ts">
import { ref } from 'vue';
import Setup from './Setup.vue';
import Wheel from './Wheel.vue';
import Stats from './Stats.vue';
import type { GameOption, RoundResult } from '../../../types';
import { soundService } from '../../../services/SoundService';

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
    soundService.playElimination();
    // Remove from options after a short delay to let the user see the result
    setTimeout(() => {
      options.value = options.value.filter(opt => opt.id !== selected.id);
      
      // Check for game over
      if (options.value.length === 0) {
        soundService.playWinner();
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
  <div class="wheel-game-manager">
    <Transition name="fade" mode="out-in">
      <Setup 
        v-if="phase === 'setup'" 
        @start-game="handleStartGame" 
      />
      
      <div v-else class="game-layout">
        <div class="wheel-section">
          <Wheel 
            :options="options" 
            @spin-end="handleSpinEnd" 
          />
          <button class="reset-btn" @click="resetGame">Reset Game</button>
        </div>
        
        <div class="stats-section">
          <Stats :history="history" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.wheel-game-manager {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.game-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 3rem;
  align-items: start;
}

@media (max-width: 900px) {
  .game-layout {
    grid-template-columns: 1fr;
  }
}

.reset-btn {
  margin-top: 30px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: #4facfe;
  color: #4facfe;
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.2);
}
</style>
