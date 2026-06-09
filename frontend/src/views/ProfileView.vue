<template>
  <div class="profile-page">
    <h1 class="page-title">Your Profile</h1>
    <p class="page-subtitle">Trip Ship crew member</p>

    <div class="profile-card card">
      <div class="profile-card__avatar">
        {{ initials }}
      </div>
      <div class="profile-card__info">
        <h2>{{ auth.displayName }}</h2>
        <p class="profile-card__username">@{{ auth.user?.username }}</p>
        <span :class="['badge', { 'badge--dj': auth.isDj }]">
          {{ auth.isDj ? 'DJ / Selector' : 'Crew Member' }}
        </span>
      </div>
    </div>

    <div class="profile-actions">
      <RouterLink to="/memories" class="btn">Share a Memory</RouterLink>
      <RouterLink v-if="auth.isDj" to="/mixes" class="btn btn--pink">Post a Mix</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const initials = computed(() => {
  const name = auth.displayName || auth.user?.username || '?'
  return name.slice(0, 2).toUpperCase()
})
</script>

<style scoped>
.profile-page {
  max-width: 600px;
  margin: 0 auto;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.profile-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-pink), var(--neon-cyan));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.8rem;
  color: var(--bg-deep);
  flex-shrink: 0;
}

.profile-card__info h2 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.profile-card__username {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
