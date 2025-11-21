<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()

defineEmits<{
  (e: 'page-change', page: number): void
}>()
</script>

<template>
  <div class="pagination" v-if="totalPages > 1">
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      &laquo; Prev
    </button>
    
    <span class="page-info">
      Page {{ currentPage }} of {{ totalPages }}
    </span>
    
    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Next &raquo;
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 40px;
  padding: 20px;
}

.page-info {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.page-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
