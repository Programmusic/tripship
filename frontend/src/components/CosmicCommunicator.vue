<template>
  <section class="cosmic-comm card" aria-labelledby="cosmic-comm-title">
    <header class="cosmic-comm__header">
      <p class="cosmic-comm__eyebrow">☠ Equal Lattice ☠</p>
      <h2 id="cosmic-comm-title">Cosmic Communicator</h2>
      <p class="cosmic-comm__desc">
        An <strong>equal lattice</strong> — every node the same size, same weight, same bond.
        The moleculous ties the whole crew; no centre, no captain's throne. <strong>Click a node</strong> to open their lattice profile.
      </p>
    </header>

    <div class="cosmic-comm__body">
      <div class="cosmic-comm__viz">
        <svg
          class="cosmic-comm__svg"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Crew molecular connection map"
        >
          <defs>
            <radialGradient id="cosmic-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0, 255, 204, 0.06)" />
              <stop offset="100%" stop-color="rgba(6, 8, 16, 0)" />
            </radialGradient>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="100" height="100" fill="url(#cosmic-bg)" />

          <g class="cosmic-comm__bonds">
            <line
              v-for="(bond, i) in bonds"
              :key="`bond-${i}`"
              :x1="nodePos(bond.from).x"
              :y1="nodePos(bond.from).y"
              :x2="nodePos(bond.to).x"
              :y2="nodePos(bond.to).y"
              class="cosmic-comm__bond"
              :class="{
                'cosmic-comm__bond--active': isBondActive(bond),
                'cosmic-comm__bond--pending': bond.pending,
                'cosmic-comm__bond--ring': bond.ring,
              }"
              :style="{ '--bond-strength': bond.strength, '--bond-delay': `${i * 0.35}s` }"
            />
          </g>

          <g class="cosmic-comm__nodes">
            <g
              v-for="member in crew"
              :key="member.id"
              class="cosmic-comm__node"
              :class="{
                'cosmic-comm__node--selected': selectedId === member.id,
                'cosmic-comm__node--linked': isLinked(member.id),
                'cosmic-comm__node--pending': member.isInvite && member.inviteStatus !== 'accepted',
              }"
              @click="select(member.id)"
              @keydown.enter.prevent="select(member.id)"
              @keydown.space.prevent="select(member.id)"
              role="button"
              tabindex="0"
              :aria-pressed="selectedId === member.id"
              :aria-label="`${member.name}, ${member.role}`"
            >
              <circle
                :cx="member.x"
                :cy="member.y"
                :r="member.r + 2.5"
                class="cosmic-comm__node-hit"
              />
              <circle
                :cx="member.x"
                :cy="member.y"
                :r="member.r"
                class="cosmic-comm__node-ring"
                :style="{ '--node-color': member.color }"
                filter="url(#node-glow)"
              />
              <circle
                :cx="member.x"
                :cy="member.y"
                :r="member.r * 0.55"
                class="cosmic-comm__node-core"
                :style="{ fill: member.color }"
              />
              <text
                :x="member.x"
                :y="member.y + member.r + 5"
                class="cosmic-comm__node-label"
                text-anchor="middle"
              >
                {{ member.name }}
              </text>
            </g>
          </g>
        </svg>
      </div>

      <LatticeProfilePanel
        v-if="selected"
        :member="selected"
        :linked="linked"
        @select="select"
        @updated="onProfileUpdated"
      />
    </div>

    <div class="cosmic-comm__chips" role="list" aria-label="Crew on the moleculous network">
      <button
        v-for="member in crew"
        :key="`chip-${member.id}`"
        type="button"
        class="cosmic-comm__chip"
        :class="{ 'cosmic-comm__chip--active': selectedId === member.id }"
        :style="{ '--chip-color': member.color }"
        role="listitem"
        @click="select(member.id)"
      >
        {{ member.name }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { buildCosmicNetwork, getCrewById, getLinkedCrew } from '@/demo/cosmicCrew.js'
import { fetchLatticeProfiles } from '@/stores/latticeProfile.js'
import LatticeProfilePanel from '@/components/LatticeProfilePanel.vue'

const props = defineProps({
  invites: { type: Array, default: () => [] },
})

const profiles = ref([])

const network = computed(() => buildCosmicNetwork({ invites: props.invites, profiles: profiles.value }))
const crew = computed(() => network.value.crew)
const bonds = computed(() => network.value.bonds)
const selectedId = ref(null)

const selected = computed(() => getCrewById(crew.value, selectedId.value))
const linked = computed(() =>
  selectedId.value ? getLinkedCrew(crew.value, bonds.value, selectedId.value) : []
)

onMounted(async () => {
  try {
    profiles.value = await fetchLatticeProfiles()
    if (!selectedId.value && crew.value.length) {
      selectedId.value = crew.value[0].id
    }
  } catch {
    profiles.value = []
  }
})

function onProfileUpdated(updated) {
  const idx = profiles.value.findIndex((p) => p.latticeId === updated.latticeId)
  if (idx >= 0) {
    profiles.value[idx] = updated
  } else {
    profiles.value.push(updated)
  }
}

function nodePos(id) {
  const n = getCrewById(crew.value, id)
  return n ? { x: n.x, y: n.y } : { x: 50, y: 50 }
}

function select(id) {
  selectedId.value = id
}

function isBondActive(bond) {
  if (!selectedId.value) return false
  return bond.from === selectedId.value || bond.to === selectedId.value
}

function isLinked(id) {
  if (id === selectedId.value) return false
  return linked.value.some((m) => m.id === id)
}
</script>

<style scoped>
.cosmic-comm {
  margin-bottom: 2rem;
  border: 1px solid var(--border-glow);
  background:
    radial-gradient(ellipse at 30% 0%, rgba(0, 255, 204, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 100%, rgba(255, 0, 255, 0.06) 0%, transparent 50%),
    var(--bg-card);
  overflow: hidden;
}

.cosmic-comm__header {
  padding: 1.5rem 1.5rem 0;
}

.cosmic-comm__eyebrow {
  font-size: 0.65rem;
  color: var(--neon-cyan);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
}

.cosmic-comm h2 {
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--gold);
  margin-bottom: 0.5rem;
}

.cosmic-comm__desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 52rem;
}

.cosmic-comm__desc strong {
  color: var(--neon-cyan);
  font-weight: 600;
}

.cosmic-comm__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem 1.5rem;
}

@media (min-width: 768px) {
  .cosmic-comm__body {
    grid-template-columns: minmax(0, 1.1fr) minmax(220px, 0.9fr);
    align-items: stretch;
  }
}

.cosmic-comm__viz {
  background: rgba(6, 8, 16, 0.55);
  border: 1px solid rgba(201, 162, 39, 0.15);
  border-radius: 4px;
  padding: 0.5rem;
  min-height: 340px;
}

.cosmic-comm__svg {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 1 / 0.92;
}

.cosmic-comm__bond {
  stroke: rgba(0, 255, 204, 0.22);
  stroke-width: 0.28;
  stroke-dasharray: 1.4 2;
  animation: moleculous-flow 4s linear infinite;
  animation-delay: var(--bond-delay, 0s);
  opacity: 0.55;
  transition: stroke 0.25s, stroke-width 0.25s, opacity 0.25s;
}

.cosmic-comm__bond--ring {
  stroke: rgba(0, 255, 204, 0.38);
  stroke-width: 0.42;
  stroke-dasharray: none;
  opacity: 0.75;
}

.cosmic-comm__bond--pending {
  stroke: rgba(106, 122, 138, 0.35);
  stroke-dasharray: 0.8 2.2;
}

.cosmic-comm__bond--active {
  stroke: var(--neon-cyan);
  stroke-width: 0.55;
  opacity: 1;
  animation-duration: 2.2s;
}

@keyframes moleculous-flow {
  to { stroke-dashoffset: -12; }
}

.cosmic-comm__node {
  cursor: pointer;
  outline: none;
}

.cosmic-comm__node-ring {
  fill: none;
  stroke: var(--node-color);
  stroke-width: 0.65;
  opacity: 0.6;
  transition: opacity 0.2s, stroke-width 0.2s;
}

.cosmic-comm__node-hit {
  fill: transparent;
  stroke: none;
  pointer-events: all;
}

.cosmic-comm__node-core {
  opacity: 0.92;
  transition: transform 0.2s;
  pointer-events: none;
}

.cosmic-comm__node-label {
  font-family: var(--font-mono);
  font-size: 3.2px;
  fill: var(--text-primary);
  pointer-events: none;
  opacity: 0.9;
}

.cosmic-comm__node--selected .cosmic-comm__node-ring {
  stroke-width: 1.05;
  opacity: 1;
  animation: node-pulse 2s ease-in-out infinite;
}

.cosmic-comm__node--linked .cosmic-comm__node-ring {
  opacity: 0.9;
}

.cosmic-comm__node--pending .cosmic-comm__node-ring {
  stroke-dasharray: 2 2;
  opacity: 0.45;
}

.cosmic-comm__node--pending .cosmic-comm__node-core {
  opacity: 0.65;
}

.cosmic-comm__node:focus-visible .cosmic-comm__node-ring {
  stroke-width: 0.85;
  opacity: 1;
}

@keyframes node-pulse {
  0%, 100% { opacity: 0.75; }
  50% { opacity: 1; }
}

.cosmic-comm__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid rgba(201, 162, 39, 0.12);
  padding-top: 1rem;
}

.cosmic-comm__chip {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  text-transform: lowercase;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.7rem;
  border: 1px solid color-mix(in srgb, var(--chip-color) 50%, transparent);
  background: color-mix(in srgb, var(--chip-color) 12%, transparent);
  color: var(--text-primary);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

.cosmic-comm__chip:hover,
.cosmic-comm__chip--active {
  background: color-mix(in srgb, var(--chip-color) 28%, transparent);
  border-color: var(--chip-color);
  color: var(--chip-color);
}
</style>
