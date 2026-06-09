<template>
  <div class="demo-banner">
    <span class="demo-banner__pulse"></span>
    <p>
      <strong>Design preview</strong> — mock data only. Backend (Cloud Functions + Firestore) coming soon.
    </p>
  </div>
</template>

<style scoped>
.demo-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(90deg, rgba(255, 0, 255, 0.15), rgba(0, 255, 204, 0.15));
  border-bottom: 1px solid var(--neon-pink);
  font-size: 0.75rem;
  text-align: center;
  color: var(--text-muted);
}

.demo-banner strong {
  color: var(--neon-yellow);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.demo-banner__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--neon-cyan);
  box-shadow: 0 0 8px var(--neon-cyan);
  animation: blink 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
