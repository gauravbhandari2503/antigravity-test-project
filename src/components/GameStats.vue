<script setup lang="ts">
import type { RoundResult } from '../types';

defineProps<{
  history: RoundResult[];
}>();
</script>

<template>
  <div class="stats-container">
    <h3>Game Stats</h3>
    <div v-if="history.length === 0" class="empty-state">
      No rounds played yet.
    </div>
    <table v-else>
      <thead>
        <tr>
          <th>Round</th>
          <th>Result</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="round in history" :key="round.roundNumber">
          <td>#{{ round.roundNumber }}</td>
          <td>
            <span class="option-tag" :style="{ backgroundColor: round.selectedOption.color }">
              {{ round.selectedOption.label }}
            </span>
          </td>
          <td>
            <span :class="['status-badge', round.eliminated ? 'eliminated' : 'safe']">
              {{ round.eliminated ? 'Eliminated' : 'Safe' }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.stats-container {
  background: var(--color-surface);
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

h3 {
  margin-top: 0;
  color: var(--color-primary);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-top: 0.5rem;
}

th, td {
  text-align: left;
  padding: 12px;
}

th {
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tr {
  transition: transform 0.2s;
}

tbody tr {
  background: var(--color-bg);
  border-radius: 8px;
}

tbody tr td:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  color: var(--color-text-muted);
  font-family: monospace;
}

tbody tr td:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

tbody tr:hover {
  transform: scale(1.02);
  background: #252b3b;
}

.option-tag {
  padding: 4px 10px;
  border-radius: 6px;
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-badge {
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.eliminated {
  background: rgba(244, 63, 94, 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(244, 63, 94, 0.2);
}

.status-badge.safe {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.empty-state {
  color: var(--color-text-muted);
  text-align: center;
  padding: 3rem 0;
  font-style: italic;
  background: var(--color-bg);
  border-radius: 12px;
  border: 1px dashed var(--color-border);
}
</style>
