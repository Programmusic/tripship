<template>
  <div class="home">
    <section class="hero">
      <div class="hero__badge">Est. 1994</div>
      <h1 class="hero__title">Trip Ship</h1>
      <p class="hero__subtitle">The 90s sound system that never docked</p>
      <BassVisualizer />
      <p class="hero__desc">
        Rewind to warehouse raves, stacked bass bins, and pirate radio energy.
        Share your memories, catch fresh DJ mixes, and ride the wave with the crew.
      </p>
      <div class="hero__actions">
        <RouterLink to="/memories" class="btn btn--pink">Browse Memories</RouterLink>
        <RouterLink to="/mixes" class="btn">DJ Mixes</RouterLink>
      </div>
    </section>

    <section v-if="isDemoMode" class="preview">
      <h2 class="preview__heading">From the vault</h2>
      <div class="preview__grid">
        <MemoryCard v-for="memory in previewMemories" :key="memory.id" :memory="memory" />
      </div>
      <RouterLink to="/memories" class="preview__more">See all memories →</RouterLink>
    </section>

    <section v-if="isDemoMode" class="preview preview--mixes">
      <h2 class="preview__heading">On the decks</h2>
      <div class="preview__mixes">
        <MixCard v-for="mix in previewMixes" :key="mix.id" :mix="mix" />
      </div>
      <RouterLink to="/mixes" class="preview__more">All DJ mixes →</RouterLink>
    </section>

    <section class="features">
      <div class="feature card">
        <div class="feature__icon">📼</div>
        <h2>Share Memories</h2>
        <p>Drop your stories from the dancefloor — free parties, sound clashes, and those nights the bass never stopped.</p>
        <RouterLink to="/memories" class="feature__link">View the vault →</RouterLink>
      </div>
      <div class="feature card">
        <div class="feature__icon">🎧</div>
        <h2>DJ Mixes</h2>
        <p>Resident selectors upload jungle, dub, garage, and hardcore sessions straight from the decks.</p>
        <RouterLink to="/mixes" class="feature__link">Tune in →</RouterLink>
      </div>
      <div class="feature card">
        <div class="feature__icon">🔊</div>
        <h2>Crew Login</h2>
        <p>Create your account, build your profile, and connect with the Trip Ship family worldwide.</p>
        <RouterLink to="/profile" class="feature__link">Your profile →</RouterLink>
      </div>
    </section>

    <section class="stats">
      <div class="stat">
        <span class="stat__num">90s</span>
        <span class="stat__label">Sound System Era</span>
      </div>
      <div class="stat">
        <span class="stat__num">∞</span>
        <span class="stat__label">Bass Frequency</span>
      </div>
      <div class="stat">
        <span class="stat__num">24/7</span>
        <span class="stat__label">Mixes on Deck</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import BassVisualizer from '@/components/BassVisualizer.vue'
import MemoryCard from '@/components/MemoryCard.vue'
import MixCard from '@/components/MixCard.vue'
import { isDemoMode } from '@/api/client.js'
import { mockMemories, mockMixes } from '@/demo/mockData.js'

const previewMemories = mockMemories.slice(0, 2)
const previewMixes = mockMixes.slice(0, 2)
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 0 4rem;
}

.hero__badge {
  display: inline-block;
  padding: 0.3rem 1rem;
  border: 1px solid var(--neon-yellow);
  color: var(--neon-yellow);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
}

.hero__title {
  font-size: clamp(4rem, 12vw, 8rem);
  line-height: 0.9;
  background: linear-gradient(180deg, var(--neon-pink) 0%, var(--neon-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 30px rgba(255, 0, 255, 0.3));
  margin-bottom: 0.5rem;
}

.hero__subtitle {
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: var(--neon-cyan);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}

.hero__desc {
  max-width: 600px;
  margin: 0 auto 2rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.8;
}

.hero__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.preview {
  margin-bottom: 4rem;
}

.preview--mixes {
  margin-bottom: 3rem;
}

.preview__heading {
  font-size: 1.8rem;
  color: var(--neon-pink);
  margin-bottom: 1.5rem;
  text-align: center;
}

.preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.preview__mixes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.preview__more {
  display: block;
  text-align: center;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.feature__icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature h2 {
  font-size: 1.5rem;
  color: var(--neon-pink);
  margin-bottom: 0.75rem;
}

.feature p {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 1rem;
}

.feature__link {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid var(--border-glow);
  border-bottom: 1px solid var(--border-glow);
}

.stat__num {
  display: block;
  font-family: var(--font-display);
  font-size: 2.5rem;
  color: var(--neon-cyan);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .stats {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
