<template>
  <footer class="footer">
    <div class="footer__inner">
      <img src="/images/skull-crossbones.svg" alt="" class="footer__skull" />
      <p class="footer__brand">Trip Ship Unsocial Media</p>
      <p class="footer__tagline">Bass in the chest. Tales in the hold. Mixes on deck. Invite only, arr!</p>
      <p class="footer__copy">&copy; {{ year }} Trip Ship Crew. All frequencies & doubloons reserved. ☠</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 2px solid var(--border-glow);
  background: var(--bg-panel);
  margin-top: auto;
}

.footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
}

.footer__skull {
  width: 40px;
  margin: 0 auto 1rem;
  opacity: 0.7;
}

.footer__brand {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--gold);
  margin-bottom: 0.5rem;
}

.footer__tagline {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
  font-style: italic;
}

.footer__copy {
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0.6;
}
</style>
