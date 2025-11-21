<script setup lang="ts">
import type { Game } from '../data/games'
import { useRouter } from 'vue-router'

const props = defineProps<{
  game: Game
}>()

const router = useRouter()

const navigateToGame = () => {
  router.push(`/game/${props.game.id}`)
}
</script>

<template>
  <div class="game-card" @click="navigateToGame">
    <div class="card-image">
      <img :src="game.image" :alt="game.name" loading="lazy" />
      <div class="card-overlay">
        <span class="play-btn">Play Now</span>
      </div>
    </div>
    <div class="card-content">
      <div class="card-header">
        <span class="game-icon">{{ game.icon }}</span>
        <span class="game-category">{{ game.category }}</span>
      </div>
      <h3 class="game-title">{{ game.name }}</h3>
      <p class="game-description">{{ game.description }}</p>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border-color: rgba(79, 172, 254, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.card-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.game-card:hover .card-image img {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.game-card:hover .card-overlay {
  opacity: 1;
}

.play-btn {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 10px 24px;
  border-radius: 30px;
  font-weight: bold;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.game-card:hover .play-btn {
  transform: translateY(0);
}

.card-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.game-icon {
  font-size: 1.5rem;
}

.game-category {
  font-size: 0.8rem;
  padding: 4px 10px;
  background: rgba(79, 172, 254, 0.2);
  color: #4facfe;
  border-radius: 12px;
  font-weight: 600;
}

.game-title {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
  color: #fff;
}

.game-description {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
