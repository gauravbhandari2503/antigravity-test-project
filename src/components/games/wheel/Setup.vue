<script setup lang="ts">
import { ref } from 'vue';
import type { GameOption } from '../../../types';
import { soundService } from '../../../services/SoundService';

const emit = defineEmits<{
  (e: 'start-game', options: GameOption[]): void;
}>();

const newOptionLabel = ref('');
const newOptionIsSafe = ref(false);
const options = ref<GameOption[]>([]);

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#F1948A', '#82E0AA', '#D7BDE2'
];

const addOption = () => {
  if (!newOptionLabel.value.trim()) return;

  const color = colors[options.value.length % colors.length] ?? '#FF6B6B';
  
  options.value.push({
    id: crypto.randomUUID(),
    label: newOptionLabel.value.trim(),
    isSafe: newOptionIsSafe.value,
    color
  });

  soundService.playAddPlayer();

  newOptionLabel.value = '';
  newOptionIsSafe.value = false;
};

const removeOption = (id: string) => {
  options.value = options.value.filter(opt => opt.id !== id);
};

const startGame = () => {
  if (options.value.length > 0) {
    emit('start-game', options.value);
  }
};
</script>

<template>
  <div class="setup-container">
    <h2>Game Setup</h2>
    
    <div class="input-group">
      <input 
        v-model="newOptionLabel" 
        @keyup.enter="addOption"
        placeholder="Enter option name"
        type="text"
      />
      <label class="checkbox-label">
        <input type="checkbox" v-model="newOptionIsSafe">
        Safe (Don't eliminate)
      </label>
      <button @click="addOption">Add</button>
    </div>

    <ul class="options-list">
      <li v-for="opt in options" :key="opt.id" :style="{ borderLeft: `4px solid ${opt.color}` }">
        <span class="option-name">{{ opt.label }}</span>
        <span v-if="opt.isSafe" class="badge safe">Safe</span>
        <button @click="removeOption(opt.id)" class="delete-btn">×</button>
      </li>
    </ul>

    <button 
      class="start-btn" 
      @click="startGame" 
      :disabled="options.length < 2"
    >
      Start Game
    </button>
  </div>
</template>

<style scoped>
.setup-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2.5rem;
  background: var(--color-surface);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

h2 {
  margin-top: 0;
  color: var(--color-primary);
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
  align-items: center;
  background: var(--color-bg);
  padding: 8px;
  border-radius: 16px;
  border: 1px solid var(--color-border);
}

input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
}

input[type="text"]::placeholder {
  color: var(--color-text-muted);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--color-text-muted);
  padding-right: 8px;
  user-select: none;
}

.checkbox-label input {
  accent-color: var(--color-secondary);
  width: 18px;
  height: 18px;
}

button {
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: var(--color-secondary);
  color: white;
  font-weight: 600;
  transition: all 0.2s;
}

button:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
}

button:disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
  transform: none;
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 24px 0;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}

.options-list::-webkit-scrollbar {
  width: 4px;
}

.options-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-bg);
  margin-bottom: 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: transform 0.2s;
}

.options-list li:hover {
  transform: translateX(4px);
  border-color: var(--color-border);
}

.option-name {
  font-weight: 500;
}

.badge.safe {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: auto;
  margin-right: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.delete-btn {
  background: transparent;
  color: var(--color-text-muted);
  padding: 4px 8px;
  font-size: 1.5rem;
  line-height: 1;
  border-radius: 8px;
}

.delete-btn:hover {
  background: rgba(244, 63, 94, 0.1);
  color: var(--color-primary);
  transform: none;
}

.start-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3);
}

.start-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(244, 63, 94, 0.4);
  transform: translateY(-2px);
}
</style>
