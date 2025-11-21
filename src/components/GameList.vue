<script setup lang="ts">
import { ref, computed } from 'vue'
import { games } from '../data/games'
import GameCard from './GameCard.vue'
import Pagination from './Pagination.vue'

const ITEMS_PER_PAGE = 10
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(games.length / ITEMS_PER_PAGE))

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  return games.slice(start, end)
})

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="game-list-container">
    <div class="games-grid">
      <GameCard 
        v-for="game in paginatedGames" 
        :key="game.id" 
        :game="game" 
      />
    </div>
    
    <Pagination 
      :current-page="currentPage" 
      :total-pages="totalPages" 
      @page-change="handlePageChange" 
    />
  </div>
</template>

<style scoped>
.game-list-container {
  padding: 20px 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

/* Animation for list items */
.games-grid > * {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
