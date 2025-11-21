<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ContactModal from './ContactModal.vue'

const isContactModalOpen = ref(false)
const isLoggedIn = ref(true) // Mock login state
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="logo">
        <span class="logo-icon">🎮</span>
        <span class="logo-text">GameHub</span>
      </RouterLink>

      <div class="nav-links">
        <RouterLink to="/" class="nav-item">Home</RouterLink>
        <a href="#" @click.prevent="isContactModalOpen = true" class="nav-item">Contact Us</a>
      </div>

      <div class="user-menu">
        <template v-if="isLoggedIn">
          <div class="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar" />
          </div>
          <button class="logout-btn">Logout</button>
        </template>
        <button v-else class="login-btn">Login</button>
      </div>
    </div>

    <ContactModal 
      :is-open="isContactModalOpen" 
      @close="isContactModalOpen = false" 
    />
  </nav>
</template>

<style scoped>
.navbar {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-icon {
  font-size: 1.8rem;
}

.nav-links {
  display: flex;
  gap: 30px;
}

.nav-item {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  position: relative;
}

.nav-item:hover, .nav-item.router-link-active {
  color: #fff;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: #4facfe;
  transition: width 0.3s;
}

.nav-item:hover::after, .nav-item.router-link-active::after {
  width: 100%;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #4facfe;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.login-btn, .logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover, .logout-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}
</style>
