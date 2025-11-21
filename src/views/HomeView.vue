<script setup lang="ts">
import GameList from '../components/GameList.vue'
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to <span class="highlight">GameHub</span></h1>
        <p class="hero-subtitle">Discover and play amazing games. Endless entertainment awaits!</p>
        <button class="cta-btn" @click="$el.querySelector('.games-section').scrollIntoView({ behavior: 'smooth' })">
          Explore Games
        </button>
      </div>
      <div class="hero-background">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>
    </section>

    <section class="games-section">
      <div class="section-header">
        <h2>Featured Games</h2>
        <div class="divider"></div>
      </div>
      <GameList />
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.hero {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-align: center;
  padding: 0 20px;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.1;
  background: linear-gradient(to bottom, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.highlight {
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  font-weight: 300;
}

.cta-btn {
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(79, 172, 254, 0.3);
  transition: all 0.3s ease;
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(79, 172, 254, 0.5);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 10s infinite ease-in-out;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #4facfe;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 500px;
  height: 500px;
  background: #00f2fe;
  bottom: -100px;
  right: -100px;
  animation-delay: 2s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: #a18cd1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

.games-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: #fff;
}

.divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%);
  margin: 0 auto;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
}
</style>
