<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const words = [
  'VUE', 'REACT', 'ANGULAR', 'TYPESCRIPT', 'JAVASCRIPT', 
  'PYTHON', 'JAVA', 'GOLANG', 'RUST', 'DOCKER',
  'KUBERNETES', 'LINUX', 'WINDOWS', 'MACOS', 'ANDROID',
  'IOS', 'FLUTTER', 'DART', 'SWIFT', 'KOTLIN'
]

const word = ref('')
const guessedLetters = ref<Set<string>>(new Set())
const maxWrongGuesses = 6

const wrongGuesses = computed(() => {
  return Array.from(guessedLetters.value).filter(letter => !word.value.includes(letter)).length
})

const isWinner = computed(() => {
  return word.value.split('').every(letter => guessedLetters.value.has(letter))
})

const isLoser = computed(() => {
  return wrongGuesses.value >= maxWrongGuesses
})

const displayWord = computed(() => {
  return word.value.split('').map(letter => guessedLetters.value.has(letter) ? letter : '_').join(' ')
})

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const startNewGame = () => {
  word.value = words[Math.floor(Math.random() * words.length)] || 'VUE'
  guessedLetters.value = new Set()
}

const guessLetter = (letter: string) => {
  if (isWinner.value || isLoser.value || guessedLetters.value.has(letter)) return
  guessedLetters.value.add(letter)
}

const handleKeydown = (e: KeyboardEvent) => {
  const letter = e.key.toUpperCase()
  if (alphabet.includes(letter)) {
    guessLetter(letter)
  }
}

onMounted(() => {
  startNewGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="hangman">
    <div class="status">
      <h2 v-if="isWinner" class="winner">You Won!</h2>
      <h2 v-else-if="isLoser" class="loser">Game Over! Word was: {{ word }}</h2>
      <h2 v-else>Wrong Guesses: {{ wrongGuesses }} / {{ maxWrongGuesses }}</h2>
    </div>

    <div class="hangman-drawing">
      <!-- Simple SVG or CSS drawing could go here, using text for now -->
      <div class="gallows">
        <pre>
  +---+
  |   |
  {{ wrongGuesses > 0 ? 'O' : ' ' }}   |
 {{ wrongGuesses > 2 ? '/' : ' ' }}{{ wrongGuesses > 1 ? '|' : ' ' }}{{ wrongGuesses > 3 ? '\\' : ' ' }}  |
 {{ wrongGuesses > 4 ? '/' : ' ' }} {{ wrongGuesses > 5 ? '\\' : ' ' }}  |
      |
=========
        </pre>
      </div>
    </div>

    <div class="word-display">
      {{ displayWord }}
    </div>

    <div class="keyboard">
      <button 
        v-for="letter in alphabet" 
        :key="letter"
        :disabled="guessedLetters.has(letter) || isWinner || isLoser"
        :class="{ 
          'correct': guessedLetters.has(letter) && word.includes(letter),
          'wrong': guessedLetters.has(letter) && !word.includes(letter)
        }"
        @click="guessLetter(letter)"
      >
        {{ letter }}
      </button>
    </div>

    <button class="reset-btn" @click="startNewGame">New Game</button>
  </div>
</template>

<style scoped>
.hangman {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.status h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.winner { color: #55efc4 !important; }
.loser { color: #ff7675 !important; }

.gallows {
  font-family: monospace;
  font-size: 1.5rem;
  color: white;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.2;
}

.word-display {
  font-size: 3rem;
  letter-spacing: 0.5rem;
  font-family: monospace;
  color: #74b9ff;
  text-shadow: 0 0 10px rgba(116, 185, 255, 0.5);
}

.keyboard {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 600px;
}

.keyboard button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.keyboard button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.keyboard button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.keyboard button.correct {
  background: #00b894;
  color: white;
}

.keyboard button.wrong {
  background: #d63031;
  color: white;
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
