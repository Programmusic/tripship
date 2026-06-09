<template>
  <div class="home">
    <section class="hero">
      <div class="hero__badge">☠ Unsocial Media ☠</div>
      <h1 class="hero__title">Trip Ship</h1>
      <p class="hero__subtitle">If yer name ain't on the list, ye ain't comin' in</p>
      <PirateShip />
      <BassVisualizer />
      <p class="hero__desc">
        Ahoy! This be the 90s sound system that never docked. A private crew for mates from back in the day —
        share tales from the dancefloor, plunder the <strong>Aaaarrifacts</strong>, catch DJ mixes,
        and read the <strong>Captain's Cabin</strong>. No algorithms. No randos. Just family.
      </p>
      <div class="hero__actions">
        <RouterLink to="/register" class="btn btn--pink">Get On The List</RouterLink>
        <RouterLink to="/aaaarrifacts" class="btn">Browse Aaaarrifacts</RouterLink>
      </div>
    </section>

    <p class="pirate-divider">☠ ⚓ ☠</p>

    <section v-if="isDemoMode" class="preview">
      <h2 class="preview__heading">From the Memory Hold</h2>
      <div class="preview__grid">
        <MemoryCard v-for="memory in previewMemories" :key="memory.id" :memory="memory" />
      </div>
      <RouterLink to="/memories" class="preview__more">All crew tales →</RouterLink>
    </section>

    <section class="features">
      <div class="feature card">
        <div class="feature__icon">📜</div>
        <h2>Aaaarrifacts</h2>
        <p>Old fliers, posters, tickets — buried treasure from warehouse raves and sound clashes. Upload yer loot.</p>
        <RouterLink to="/aaaarrifacts" class="feature__link">Plunder the vault →</RouterLink>
      </div>
      <div class="feature card">
        <div class="feature__icon">🏴‍☠️</div>
        <h2>Captain's Cabin</h2>
        <p>Scribblin's from Cap'n Pete. News, voyages, and orders from the helm about what's happenin' now.</p>
        <RouterLink to="/captains-cabin" class="feature__link">Enter the cabin →</RouterLink>
      </div>
      <div class="feature card">
        <div class="feature__icon">🎧</div>
        <h2>Deck Sessions</h2>
        <p>Selectors upload jungle, dub, garage & hardcore straight from the riggin'. Tune in, me hearties.</p>
        <RouterLink to="/mixes" class="feature__link">Hoist the tunes →</RouterLink>
      </div>
      <div class="feature card">
        <div class="feature__icon">📋</div>
        <h2>The List</h2>
        <p>Invite yer mates from back in the day. Crew invite crew — that's how Unsocial Media works, arr.</p>
        <RouterLink to="/the-list" class="feature__link">Manage invites →</RouterLink>
      </div>
    </section>

    <section class="stats">
      <div class="stat">
        <span class="stat__num">90s</span>
        <span class="stat__label">Golden Era</span>
      </div>
      <div class="stat">
        <span class="stat__num">☠</span>
        <span class="stat__label">Invite Only</span>
      </div>
      <div class="stat">
        <span class="stat__num">∞</span>
        <span class="stat__label">Bass Frequency</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import PirateShip from '@/components/PirateShip.vue'
import BassVisualizer from '@/components/BassVisualizer.vue'
import MemoryCard from '@/components/MemoryCard.vue'
import { isDemoMode } from '@/api/client.js'
import { mockMemories } from '@/demo/mockData.js'

const previewMemories = mockMemories.slice(0, 2)
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 2rem 0 3rem;
}

.hero__badge {
  display: inline-block;
  padding: 0.4rem 1.2rem;
  border: 2px solid var(--gold);
  color: var(--gold);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.hero__title {
  font-size: clamp(3.5rem, 11vw, 7rem);
  line-height: 0.95;
  background: linear-gradient(180deg, var(--gold) 0%, var(--neon-cyan) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.hero__subtitle {
  font-family: var(--font-display);
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: var(--neon-pink);
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.hero__desc {
  max-width: 620px;
  margin: 0 auto 2rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.8;
}

.hero__desc strong {
  color: var(--gold);
}

.hero__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.preview {
  margin-bottom: 3rem;
}

.preview__heading {
  font-size: 1.8rem;
  color: var(--gold);
  margin-bottom: 1.5rem;
  text-align: center;
}

.preview__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.feature__icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature h2 {
  font-size: 1.4rem;
  color: var(--gold);
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
  .stats { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
