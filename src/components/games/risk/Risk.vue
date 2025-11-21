<script setup lang="ts">
import { ref, computed } from 'vue'

type Player = 'Player' | 'AI'
type Phase = 'Draft' | 'Attack' | 'Fortify'

interface Territory {
  id: number
  name: string
  owner: Player
  armies: number
  neighbors: number[]
  x: number
  y: number
}

// Simplified Map: 3 Continents, 12 Territories
const INITIAL_TERRITORIES: Territory[] = [
  // Continent A (Left)
  { id: 1, name: 'A1', owner: 'Player', armies: 2, neighbors: [2, 4], x: 20, y: 20 },
  { id: 2, name: 'A2', owner: 'Player', armies: 2, neighbors: [1, 3, 5], x: 20, y: 50 },
  { id: 3, name: 'A3', owner: 'Player', armies: 2, neighbors: [2, 6], x: 20, y: 80 },
  
  // Continent B (Middle)
  { id: 4, name: 'B1', owner: 'AI', armies: 2, neighbors: [1, 5, 7], x: 50, y: 20 },
  { id: 5, name: 'B2', owner: 'AI', armies: 2, neighbors: [2, 4, 6, 8], x: 50, y: 50 },
  { id: 6, name: 'B3', owner: 'AI', armies: 2, neighbors: [3, 5, 9], x: 50, y: 80 },

  // Continent C (Right)
  { id: 7, name: 'C1', owner: 'AI', armies: 2, neighbors: [4, 8, 10], x: 80, y: 20 },
  { id: 8, name: 'C2', owner: 'AI', armies: 2, neighbors: [5, 7, 9, 11], x: 80, y: 50 },
  { id: 9, name: 'C3', owner: 'AI', armies: 2, neighbors: [6, 8, 12], x: 80, y: 80 },
  
  // Extra connections
  { id: 10, name: 'C4', owner: 'AI', armies: 2, neighbors: [7, 11], x: 90, y: 35 },
  { id: 11, name: 'C5', owner: 'AI', armies: 2, neighbors: [8, 10, 12], x: 90, y: 65 },
  { id: 12, name: 'C6', owner: 'AI', armies: 2, neighbors: [9, 11], x: 90, y: 90 },
]

const territories = ref<Territory[]>([])
const turn = ref<Player>('Player')
const phase = ref<Phase>('Draft')
const reinforcements = ref(0)
const selectedSource = ref<Territory | null>(null)
const selectedTarget = ref<Territory | null>(null)
const message = ref('Welcome to Risk!')
const diceResult = ref<{ attacker: number[], defender: number[] } | null>(null)

const connections = computed(() => {
  const lines: { x1: number, y1: number, x2: number, y2: number, key: string }[] = []
  const processed = new Set<string>()
  
  territories.value.forEach(t => {
    t.neighbors.forEach(nid => {
      const neighbor = territories.value.find(n => n.id === nid)
      if (neighbor) {
        const key = [t.id, nid].sort().join('-')
        if (!processed.has(key)) {
          lines.push({
            x1: t.x,
            y1: t.y,
            x2: neighbor.x,
            y2: neighbor.y,
            key
          })
          processed.add(key)
        }
      }
    })
  })
  return lines
})

const initializeGame = () => {
  // Deep copy and randomize owners slightly
  territories.value = JSON.parse(JSON.stringify(INITIAL_TERRITORIES))
  territories.value.forEach(t => {
    t.owner = Math.random() > 0.5 ? 'Player' : 'AI'
    t.armies = 2 + Math.floor(Math.random() * 2)
  })
  startTurn()
}

const startTurn = () => {
  if (checkWin()) return

  const owned = territories.value.filter(t => t.owner === turn.value).length
  reinforcements.value = Math.max(3, Math.floor(owned / 3))
  phase.value = 'Draft'
  message.value = `${turn.value}'s Turn - Place ${reinforcements.value} Armies`
  selectedSource.value = null
  selectedTarget.value = null
  diceResult.value = null

  if (turn.value === 'AI') {
    setTimeout(aiTurn, 1000)
  }
}

const selectTerritory = (t: Territory) => {
  if (turn.value !== 'Player') return

  if (phase.value === 'Draft') {
    if (t.owner === 'Player' && reinforcements.value > 0) {
      t.armies++
      reinforcements.value--
      if (reinforcements.value === 0) {
        phase.value = 'Attack'
        message.value = "Attack Phase - Select Source then Target"
      }
    }
  } else if (phase.value === 'Attack') {
    if (!selectedSource.value) {
      if (t.owner === 'Player' && t.armies > 1) {
        selectedSource.value = t
      }
    } else {
      if (t === selectedSource.value) {
        selectedSource.value = null // Deselect
      } else if (selectedSource.value.neighbors.includes(t.id) && t.owner !== 'Player') {
        selectedTarget.value = t
        attack()
      } else if (t.owner === 'Player' && t.armies > 1) {
        selectedSource.value = t // Change source
      }
    }
  } else if (phase.value === 'Fortify') {
    // Simplified: Skip fortify for now or just end turn
  }
}

const attack = () => {
  if (!selectedSource.value || !selectedTarget.value) return

  const attackerDice = Math.min(3, selectedSource.value.armies - 1)
  const defenderDice = Math.min(2, selectedTarget.value.armies)

  const aRolls = Array(attackerDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a)
  const dRolls = Array(defenderDice).fill(0).map(() => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a)

  diceResult.value = { attacker: aRolls, defender: dRolls }

  let aLoss = 0
  let dLoss = 0

  for (let i = 0; i < Math.min(aRolls.length, dRolls.length); i++) {
    if (aRolls[i] !== undefined && dRolls[i] !== undefined && aRolls[i]! > dRolls[i]!) {
      dLoss++
    } else {
      aLoss++
    }
  }

  selectedSource.value.armies -= aLoss
  selectedTarget.value.armies -= dLoss

  if (selectedTarget.value.armies <= 0) {
    // Conquered
    selectedTarget.value.owner = turn.value
    const moveArmies = Math.max(attackerDice, 1) // Simplified move logic
    selectedTarget.value.armies = moveArmies
    selectedSource.value.armies -= moveArmies
    message.value = "Territory Conquered!"
    selectedSource.value = null
    selectedTarget.value = null
  } else {
    message.value = `Battle Result: Attacker lost ${aLoss}, Defender lost ${dLoss}`
  }

  if (selectedSource.value && selectedSource.value.armies <= 1) {
    selectedSource.value = null
    selectedTarget.value = null
  }
}

const endPhase = () => {
  if (phase.value === 'Draft' && reinforcements.value > 0) {
    message.value = "Place all armies first!"
    return
  }
  if (phase.value === 'Attack') {
    phase.value = 'Fortify'
    message.value = "Fortify Phase - Click End Turn to finish"
  } else if (phase.value === 'Fortify') {
    turn.value = turn.value === 'Player' ? 'AI' : 'Player'
    startTurn()
  }
}

const aiTurn = () => {
  // Simple AI
  // 1. Draft: Place randomly
  while (reinforcements.value > 0) {
    const myTerritories = territories.value.filter(t => t.owner === 'AI')
    if (myTerritories.length === 0) break
    const target = myTerritories[Math.floor(Math.random() * myTerritories.length)]
    if (target) {
      target.armies++
      reinforcements.value--
    }
  }

  // 2. Attack: Find weak neighbors
  const myAttackers = territories.value.filter(t => t.owner === 'AI' && t.armies > 1)
  for (const source of myAttackers) {
    const targets = source.neighbors
      .map(nid => territories.value.find(t => t.id === nid)!)
      .filter(t => t.owner !== 'AI' && t.armies < source.armies)
    
    if (targets.length > 0 && targets[0]) {
      selectedSource.value = source
      selectedTarget.value = targets[0]
      attack()
      if (source.armies <= 1) break 
    }
  }

  // End turn
  turn.value = 'Player'
  startTurn()
}

const checkWin = () => {
  const pCount = territories.value.filter(t => t.owner === 'Player').length
  if (pCount === territories.value.length) {
    message.value = "VICTORY! You conquered the world!"
    return true
  }
  if (pCount === 0) {
    message.value = "DEFEAT! You were eliminated."
    return true
  }
  return false
}

// Initialize
initializeGame()
</script>

<template>
  <div class="risk">
    <div class="header">
      <div class="info">
        <div class="turn-badge" :class="turn">{{ turn }}</div>
        <div class="phase-badge">{{ phase }}</div>
        <div class="message">{{ message }}</div>
      </div>
      <button class="btn" @click="endPhase" :disabled="turn !== 'Player'">
        {{ phase === 'Attack' ? 'End Attack' : (phase === 'Fortify' ? 'End Turn' : 'Next') }}
      </button>
      <button class="btn reset" @click="initializeGame">Reset</button>
    </div>

    <div class="map-container">
      <svg class="connections" width="100%" height="100%">
        <line 
          v-for="line in connections"
          :key="line.key"
          :x1="line.x1 + '%'" 
          :y1="line.y1 + '%'" 
          :x2="line.x2 + '%'" 
          :y2="line.y2 + '%'" 
          stroke="rgba(255,255,255,0.2)" 
          stroke-width="2"
        />
      </svg>

      <div 
        v-for="t in territories" 
        :key="t.id" 
        class="territory"
        :class="[
          t.owner.toLowerCase(),
          { 'source': selectedSource === t },
          { 'target': selectedTarget === t },
          { 'selectable': turn === 'Player' && (
            (phase === 'Draft' && t.owner === 'Player') ||
            (phase === 'Attack' && (
              (!selectedSource && t.owner === 'Player' && t.armies > 1) ||
              (selectedSource && selectedSource.neighbors.includes(t.id) && t.owner !== 'Player')
            ))
          )}
        ]"
        :style="{ left: t.x + '%', top: t.y + '%' }"
        @click="selectTerritory(t)"
      >
        <div class="armies">{{ t.armies }}</div>
        <div class="name">{{ t.name }}</div>
      </div>
    </div>

    <div class="dice-area" v-if="diceResult">
      <div class="dice-group attacker">
        <span>Attacker:</span>
        <span v-for="(d, i) in diceResult.attacker" :key="i" class="die">{{ d }}</span>
      </div>
      <div class="dice-group defender">
        <span>Defender:</span>
        <span v-for="(d, i) in diceResult.defender" :key="i" class="die">{{ d }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.risk {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 10px;
  gap: 1rem;
}

.info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.turn-badge, .phase-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.turn-badge.Player { background: #3498db; color: white; }
.turn-badge.AI { background: #e74c3c; color: white; }
.phase-badge { background: #f1c40f; color: black; }

.message {
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.map-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #2c3e50;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.territory {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: default;
  transition: all 0.3s;
  border: 3px solid rgba(255,255,255,0.5);
  z-index: 1;
}

.territory.player { background: #3498db; box-shadow: 0 0 15px rgba(52, 152, 219, 0.5); }
.territory.ai { background: #e74c3c; box-shadow: 0 0 15px rgba(231, 76, 60, 0.5); }

.territory.selectable {
  cursor: pointer;
  border-color: white;
}

.territory.selectable:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.territory.source {
  border-color: #f1c40f;
  box-shadow: 0 0 20px #f1c40f;
  z-index: 2;
}

.territory.target {
  border-color: #e67e22;
  box-shadow: 0 0 20px #e67e22;
  z-index: 2;
}

.armies {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.name {
  position: absolute;
  bottom: -20px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
}

.dice-area {
  display: flex;
  justify-content: center;
  gap: 2rem;
  background: rgba(0,0,0,0.3);
  padding: 1rem;
  border-radius: 10px;
}

.dice-group {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: bold;
}

.die {
  width: 30px;
  height: 30px;
  background: white;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background: #2ecc71;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.reset { background: #95a5a6; }
</style>
