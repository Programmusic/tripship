<template>
  <article class="card memory-card">
    <header class="memory-card__header">
      <span class="memory-card__author">{{ memory.authorName }}</span>
      <time class="memory-card__date">{{ formatDate(memory.createdAt) }}</time>
    </header>
    <h3 v-if="memory.title" class="memory-card__title">{{ memory.title }}</h3>
    <p class="memory-card__body">{{ memory.content }}</p>
    <footer v-if="memory.eventYear" class="memory-card__footer">
      <span class="badge">{{ memory.eventYear }}</span>
      <span v-if="memory.location" class="memory-card__location">{{ memory.location }}</span>
    </footer>
  </article>
</template>

<script setup>
defineProps({
  memory: { type: Object, required: true },
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
.memory-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.75rem;
}

.memory-card__author {
  color: var(--neon-cyan);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.memory-card__date {
  color: var(--text-muted);
}

.memory-card__title {
  font-size: 1.3rem;
  color: var(--neon-pink);
  margin-bottom: 0.5rem;
}

.memory-card__body {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.7;
  white-space: pre-wrap;
}

.memory-card__footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-glow);
}

.memory-card__location {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
