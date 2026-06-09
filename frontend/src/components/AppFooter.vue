<template>
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__brand">Trip Ship Sound System</p>
      <p class="footer__tagline">Bass in the chest. Memories in the vault. Mixes on deck.</p>
      <p class="footer__copy">&copy; {{ year }} Trip Ship Crew. All frequencies reserved.</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border-glow);
  background: var(--bg-panel);
  margin-top: auto;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
}

.footer__brand {
  font-family: var(--font-display);
  font-size: 1.2rem;
  letter-spacing: 0.1em;
  color: var(--neon-pink);
  margin-bottom: 0.5rem;
}

.footer__tagline {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.footer__copy {
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0.6;
}
</style>
