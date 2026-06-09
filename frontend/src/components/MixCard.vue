<template>
  <article class="card mix-card">
    <div class="mix-card__visual">
      <span class="mix-card__vinyl">◉</span>
    </div>
    <div class="mix-card__content">
      <header class="mix-card__header">
        <h3 class="mix-card__title">{{ mix.title }}</h3>
        <span class="badge badge--dj">DJ</span>
      </header>
      <p class="mix-card__dj">by {{ mix.djName }}</p>
      <p v-if="mix.description" class="mix-card__desc">{{ mix.description }}</p>
      <div class="mix-card__meta">
        <span v-if="mix.genre">{{ mix.genre }}</span>
        <span v-if="mix.duration">{{ mix.duration }}</span>
        <time>{{ formatDate(mix.createdAt) }}</time>
      </div>
      <a v-if="mix.audioUrl" :href="mix.audioUrl" class="btn mix-card__play" target="_blank" rel="noopener">
        ▶ Listen
      </a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  mix: { type: Object, required: true },
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.mix-card {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.mix-card__visual {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-deep);
  border: 2px solid var(--neon-pink);
  border-radius: 50%;
}

.mix-card__vinyl {
  font-size: 2rem;
  color: var(--neon-pink);
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mix-card__content {
  flex: 1;
  min-width: 0;
}

.mix-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}

.mix-card__title {
  font-size: 1.2rem;
  color: var(--neon-cyan);
}

.mix-card__dj {
  font-size: 0.8rem;
  color: var(--neon-pink);
  margin-bottom: 0.5rem;
}

.mix-card__desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.mix-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.mix-card__play {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}
</style>
