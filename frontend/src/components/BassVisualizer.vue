<template>
  <div class="visualizer" aria-hidden="true">
    <span v-for="n in 12" :key="n" class="visualizer__bar" :style="{ animationDelay: `${n * 0.08}s` }"></span>
  </div>
</template>

<style scoped>
.visualizer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  height: 48px;
  margin: 2rem auto;
}

.visualizer__bar {
  width: 6px;
  height: 12px;
  background: linear-gradient(to top, var(--neon-pink), var(--neon-cyan));
  border-radius: 2px;
  animation: bounce 0.8s ease-in-out infinite alternate;
}

@keyframes bounce {
  0% { height: 8px; opacity: 0.5; }
  100% { height: 44px; opacity: 1; }
}
</style>
