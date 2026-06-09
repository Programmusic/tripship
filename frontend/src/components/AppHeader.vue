<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="logo">
        <span class="logo__icon">☠</span>
        <span class="logo__text">Trip Ship</span>
        <span class="logo__tag">Unsocial Media</span>
      </RouterLink>

      <nav class="nav" :class="{ 'nav--open': menuOpen }">
        <RouterLink to="/ship" @click="menuOpen = false">Explore</RouterLink>
        <RouterLink to="/aaaarrifacts" @click="menuOpen = false">Aaaarrifacts</RouterLink>
        <RouterLink to="/captains-cabin" @click="menuOpen = false">Cabin</RouterLink>
        <RouterLink to="/memories" @click="menuOpen = false">Tales</RouterLink>
        <RouterLink to="/mixes" @click="menuOpen = false">Deck</RouterLink>

        <template v-if="auth.isAuthenticated">
          <RouterLink to="/the-list" @click="menuOpen = false">The List</RouterLink>
          <RouterLink to="/profile" @click="menuOpen = false" class="nav__profile">
            {{ auth.displayName }}
          </RouterLink>
          <button class="btn btn--ghost nav__logout" @click="handleLogout">Abandon Ship</button>
        </template>
        <template v-else>
          <RouterLink to="/login" @click="menuOpen = false">Board</RouterLink>
          <RouterLink to="/register" class="btn btn--pink nav__join" @click="menuOpen = false">
            Get On The List
          </RouterLink>
        </template>
      </nav>

      <button class="menu-toggle" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.header {
  border-bottom: 2px solid var(--border-glow);
  background: rgba(6, 8, 16, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo__icon {
  font-size: 1.4rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.logo__text {
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--gold);
  letter-spacing: 0.05em;
}

.logo__tag {
  font-size: 0.6rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: none;
}

@media (min-width: 640px) {
  .logo__tag { display: inline; }
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nav a {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.nav a.router-link-active {
  color: var(--gold);
  text-shadow: 0 0 8px rgba(201, 162, 39, 0.4);
}

.nav__join {
  padding: 0.45rem 0.9rem;
  font-size: 0.7rem;
}

.nav__logout {
  padding: 0.35rem 0.7rem;
  font-size: 0.65rem;
}

.nav__profile {
  color: var(--neon-pink) !important;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.menu-toggle span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--gold);
}

@media (max-width: 900px) {
  .menu-toggle { display: flex; }

  .nav {
    position: fixed;
    top: 65px;
    left: 0;
    right: 0;
    background: var(--bg-panel);
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    border-bottom: 2px solid var(--border-glow);
    transform: translateY(-120%);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
    pointer-events: none;
  }

  .nav--open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
}
</style>
