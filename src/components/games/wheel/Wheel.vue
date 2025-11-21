<script setup lang="ts">
import { ref, computed } from 'vue';
import type { GameOption } from '../../../types';
import { soundService } from '../../../services/SoundService';

const props = defineProps<{
  options: GameOption[];
}>();

const emit = defineEmits<{
  (e: 'spin-end', selected: GameOption): void;
}>();

const rotation = ref(0);
const isSpinning = ref(false);
const wheelSize = 400;
const center = wheelSize / 2;
const radius = wheelSize / 2 - 10;

const segments = computed(() => {
  const count = props.options.length;
  const anglePerSegment = 360 / count;
  
  return props.options.map((opt, index) => {
    const startAngle = index * anglePerSegment;
    const endAngle = (index + 1) * anglePerSegment;
    
    // Calculate path for SVG arc
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    
    const path = count === 1 
      ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center} ${center + radius} A ${radius} ${radius} 0 1 1 ${center} ${center - radius}`
      : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

    // Text position
    const textAngle = startAngle + anglePerSegment / 2;
    const textRad = (textAngle - 90) * Math.PI / 180;
    const textRadius = radius * 0.65;
    const tx = center + textRadius * Math.cos(textRad);
    const ty = center + textRadius * Math.sin(textRad);

    return {
      ...opt,
      path,
      textX: tx,
      textY: ty,
      textRotation: textAngle
    };
  });
});

const spin = () => {
  if (isSpinning.value || props.options.length === 0) return;
  
  isSpinning.value = true;
  soundService.playSpin();
  
  // Random spins (5-10 full rotations) + random angle
  const extraSpins = 360 * (5 + Math.floor(Math.random() * 5));
  const randomAngle = Math.floor(Math.random() * 360);
  const totalRotation = rotation.value + extraSpins + randomAngle;
  
  rotation.value = totalRotation;
  
  setTimeout(() => {
    isSpinning.value = false;
    soundService.stopSpin();
    determineWinner(totalRotation % 360);
  }, 4000); // Match CSS transition duration
};

const determineWinner = (finalAngle: number) => {
  // The pointer is at the top (0 degrees visually, but let's say 270 in SVG coords if 0 is right)
  // Actually, we rotated the whole wheel.
  // If we rotate +X degrees, the segment at Top is the one that was at -X (or 360-X).
  // Let's simplify: The pointer is fixed at the top.
  // A segment spans [start, end].
  // The effective angle under the pointer is (360 - (finalAngle % 360)) % 360.
  
  const count = props.options.length;
  const anglePerSegment = 360 / count;
  const normalizedAngle = (360 - (finalAngle % 360)) % 360;
  
  const winningIndex = Math.floor(normalizedAngle / anglePerSegment);
  const winner = props.options[winningIndex];
  
  if (winner) {
    emit('spin-end', winner);
  }
};
</script>

<template>
  <div class="wheel-container">
    <div class="pointer">▼</div>
    <div 
      class="wheel" 
      :style="{ transform: `rotate(${rotation}deg)` }"
    >
      <svg :width="wheelSize" :height="wheelSize" viewBox="0 0 400 400">
        <g v-for="seg in segments" :key="seg.id">
          <path :d="seg.path" :fill="seg.color" stroke="#2a2a2a" stroke-width="2" />
          <text 
            :x="seg.textX" 
            :y="seg.textY" 
            fill="white"
            text-anchor="middle"
            dominant-baseline="middle"
            :transform="`rotate(${seg.textRotation + 90}, ${seg.textX}, ${seg.textY})`"
            font-weight="bold"
            font-size="14"
          >
            {{ seg.label }}
          </text>
        </g>
      </svg>
    </div>
    <button 
      class="spin-btn" 
      @click="spin" 
      :disabled="isSpinning || options.length === 0"
    >
      {{ isSpinning ? 'Spinning...' : 'SPIN!' }}
    </button>
  </div>
</template>

<style scoped>
.wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 2rem 0;
}

.pointer {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 50px;
  color: var(--color-primary);
  z-index: 10;
  filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
}

.wheel {
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
}

.spin-btn {
  margin-top: 3rem;
  padding: 16px 48px;
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.spin-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 0 30px rgba(244, 63, 94, 0.6);
}

.spin-btn:active:not(:disabled) {
  transform: translateY(2px) scale(0.98);
}

.spin-btn:disabled {
  background: var(--color-surface);
  color: var(--color-text-muted);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
</style>
