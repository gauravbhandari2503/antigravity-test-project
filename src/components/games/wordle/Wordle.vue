<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const WORD_LENGTH = 5
const MAX_GUESSES = 6

const words = [
  'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'BRUSH',
  'CHAIR', 'CHEST', 'CHORD', 'CLICK', 'CLOCK',
  'CLOUD', 'DANCE', 'DIARY', 'DRINK', 'DRIVE',
  'EARTH', 'FEAST', 'FIELD', 'FRUIT', 'GLASS',
  'GRAPE', 'GREEN', 'GHOST', 'HEART', 'HOUSE',
  'JUICE', 'LIGHT', 'LEMON', 'MELON', 'MONEY',
  'MUSIC', 'NIGHT', 'OCEAN', 'PARTY', 'PIZZA',
  'PHONE', 'PILOT', 'PLANE', 'PLANT', 'PLATE',
  'RADIO', 'RIVER', 'ROBOT', 'SHIRT', 'SHOES',
  'SMILE', 'SNAKE', 'SPACE', 'SPOON', 'STORM',
  'TABLE', 'TIGER', 'TOAST', 'TOUCH', 'TRAIN',
  'TRUCK', 'VOICE', 'WATER', 'WATCH', 'WHALE',
  'WORLD', 'WRITE', 'YOUTH', 'ZEBRA'
]

const targetWord = ref('')
const currentGuess = ref('')
const guesses = ref<string[]>([])
const gameOver = ref(false)
const won = ref(false)
const message = ref('')

const letterStatuses = computed(() => {
  const statuses: Record<string, 'correct' | 'present' | 'absent'> = {}
  
  guesses.value.forEach(guess => {
    guess.split('').forEach((letter, i) => {
      if (targetWord.value[i] === letter) {
        statuses[letter] = 'correct'
      } else if (targetWord.value.includes(letter)) {
        if (statuses[letter] !== 'correct') {
          statuses[letter] = 'present'
        }
      } else {
        if (!statuses[letter]) {
          statuses[letter] = 'absent'
        }
      }
    })
  })
  
  return statuses
})

const startNewGame = () => {
  targetWord.value = words[Math.floor(Math.random() * words.length)] || 'APPLE'
  currentGuess.value = ''
  guesses.value = []
  gameOver.value = false
  won.value = false
  message.value = ''
}

const submitGuess = () => {
  if (currentGuess.value.length !== WORD_LENGTH) {
    showMessage('Not enough letters')
    return
  }
  
  if (!words.includes(currentGuess.value)) {
    showMessage('Not in word list')
    return
  }

  guesses.value.push(currentGuess.value)
  
  if (currentGuess.value === targetWord.value) {
    won.value = true
    gameOver.value = true
    showMessage('Splendid!')
  } else if (guesses.value.length >= MAX_GUESSES) {
    gameOver.value = true
    showMessage(targetWord.value)
  }
  
  currentGuess.value = ''
}

const showMessage = (msg: string) => {
  message.value = msg
  setTimeout(() => {
    if (message.value === msg && !gameOver.value) {
      message.value = ''
    }
  }, 2000)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (gameOver.value) return

  const key = e.key.toUpperCase()
  
  if (key === 'ENTER') {
    submitGuess()
  } else if (key === 'BACKSPACE') {
    currentGuess.value = currentGuess.value.slice(0, -1)
  } else if (/^[A-Z]$/.test(key) && currentGuess.value.length < WORD_LENGTH) {
    currentGuess.value += key
  }
}

const getLetterStatus = (guessIndex: number, letterIndex: number) => {
  const guess = guesses.value[guessIndex]
  if (!guess) return ''
  
  const letter = guess[letterIndex]
  if (!letter) return ''

  if (targetWord.value[letterIndex] === letter) return 'correct'
  if (targetWord.value.includes(letter)) return 'present'
  return 'absent'
}

const getLetter = (guessIndex: number, letterIndex: number) => {
  const guess = guesses.value[guessIndex]
  if (guess) return guess[letterIndex]
  if (guessIndex === guesses.value.length) return currentGuess.value[letterIndex] || ''
  return ''
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
  <div class="wordle">
    <div class="message-container">
      <div v-if="message" class="message">{{ message }}</div>
    </div>

    <div class="grid">
      <div v-for="i in MAX_GUESSES" :key="i" class="row">
        <div 
          v-for="j in WORD_LENGTH" 
          :key="j" 
          class="tile"
          :class="[
            guesses[i-1] ? getLetterStatus(i-1, j-1) : '',
            { 'filled': !guesses[i-1] && i-1 === guesses.length && currentGuess[j-1] }
          ]"
        >
          {{ getLetter(i-1, j-1) }}
        </div>
      </div>
    </div>

    <div class="keyboard">
      <div class="keyboard-row" v-for="(row, i) in ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']" :key="i">
        <button 
          v-for="key in row" 
          :key="key"
          class="key"
          :class="letterStatuses[key]"
          @click="handleKeydown({ key } as KeyboardEvent)"
        >
          {{ key }}
        </button>
        <button v-if="i === 2" class="key wide" @click="handleKeydown({ key: 'Backspace' } as KeyboardEvent)">⌫</button>
        <button v-if="i === 2" class="key wide" @click="handleKeydown({ key: 'Enter' } as KeyboardEvent)">↵</button>
      </div>
    </div>

    <button v-if="gameOver" class="reset-btn" @click="startNewGame">New Game</button>
  </div>
</template>

<style scoped>
.wordle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

.message-container {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message {
  background: white;
  color: #2d3436;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  animation: fade 0.3s;
}

.grid {
  display: grid;
  grid-template-rows: repeat(6, 1fr);
  gap: 5px;
  margin-bottom: 1rem;
}

.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
}

.tile {
  width: 50px;
  height: 50px;
  border: 2px solid #3a3a3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
}

.tile.filled {
  border-color: #565758;
  animation: pop 0.1s;
}

.tile.correct {
  background: #538d4e;
  border-color: #538d4e;
}

.tile.present {
  background: #b59f3b;
  border-color: #b59f3b;
}

.tile.absent {
  background: #3a3a3c;
  border-color: #3a3a3c;
}

.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.key {
  font-family: inherit;
  font-weight: bold;
  border: 0;
  padding: 0;
  margin: 0;
  height: 58px;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  background-color: #818384;
  color: white;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  max-width: 43px;
}

.key.wide {
  flex: 1.5;
  max-width: 65px;
}

.key.correct { background-color: #538d4e; }
.key.present { background-color: #b59f3b; }
.key.absent { background-color: #3a3a3c; }

.reset-btn {
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes fade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
