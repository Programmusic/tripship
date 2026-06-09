<template>
  <article class="card artifact">
    <div class="artifact__frame">
      <div class="artifact__poster" :style="{ background: artifact.color }">
        <span class="artifact__skull">☠</span>
        <h3>{{ artifact.title }}</h3>
        <p class="artifact__event">{{ artifact.eventName }}</p>
        <p class="artifact__year">{{ artifact.year }}</p>
      </div>
    </div>
    <div class="artifact__meta">
      <span class="badge badge--gold">{{ artifact.type }}</span>
      <time>{{ formatDate(artifact.createdAt) }}</time>
    </div>
    <p v-if="artifact.description" class="artifact__desc">{{ artifact.description }}</p>
  </article>
</template>

<script setup>
defineProps({
  artifact: { type: Object, required: true },
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.artifact__frame {
  border: 3px solid var(--gold);
  padding: 4px;
  margin-bottom: 1rem;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

.artifact__poster {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  border: 1px dashed rgba(201, 162, 39, 0.4);
}

.artifact__skull {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.artifact__poster h3 {
  font-size: 1.4rem;
  color: var(--gold);
  margin-bottom: 0.25rem;
}

.artifact__event {
  font-size: 0.85rem;
  color: var(--neon-cyan);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.artifact__year {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--neon-pink);
  margin-top: 0.5rem;
}

.artifact__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.artifact__desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
