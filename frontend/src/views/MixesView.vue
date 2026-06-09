<template>
  <div class="mixes-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Deck Sessions</h1>
        <p class="page-subtitle">Fresh plunder from the Trip Ship selectors — hoist the tunes, me hearties</p>
      </div>
      <button v-if="auth.isDj" class="btn btn--pink" @click="showForm = !showForm">
        {{ showForm ? 'Belay That' : '+ Drop a Mix' }}
      </button>
    </div>

    <form v-if="showForm" class="mix-form card" @submit.prevent="submitMix">
      <h2>Drop Yer Plunder</h2>
      <div class="form-group">
        <label for="title">Session Title</label>
        <input id="title" v-model="form.title" type="text" required placeholder="Jungle Pressure Vol. VII" />
      </div>
      <div class="form-group">
        <label for="description">Ship's Log Entry</label>
        <textarea id="description" v-model="form.description" placeholder="Tracklist, vibes, shoutouts..."></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="genre">Genre</label>
          <input id="genre" v-model="form.genre" type="text" placeholder="Jungle / D&B" />
        </div>
        <div class="form-group">
          <label for="duration">Duration</label>
          <input id="duration" v-model="form.duration" type="text" placeholder="e.g. 62 min" />
        </div>
      </div>
      <div class="form-group">
        <label for="audioUrl">Tune URL</label>
        <input id="audioUrl" v-model="form.audioUrl" type="url" placeholder="https://..." />
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
      <button type="submit" class="btn btn--pink" :disabled="submitting">
        {{ submitting ? 'Loadin\'...' : 'Hoist to the Deck' }}
      </button>
    </form>

    <div v-if="loading" class="empty-state">Tunin' the riggin'...</div>
    <div v-else-if="mixes.length === 0" class="empty-state">
      <p>No sessions on deck yet. Selectors — drop the first plunder, arr!</p>
    </div>
    <div v-else class="mixes-list">
      <MixCard v-for="mix in mixes" :key="mix.id" :mix="mix" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import MixCard from '@/components/MixCard.vue'

const auth = useAuthStore()
const mixes = ref([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')
const form = reactive({ title: '', description: '', genre: '', duration: '', audioUrl: '' })

async function fetchMixes() {
  loading.value = true
  try {
    const { data } = await api.get('/mixes')
    mixes.value = data
  } finally {
    loading.value = false
  }
}

async function submitMix() {
  formError.value = ''
  formSuccess.value = ''
  submitting.value = true
  try {
    const { data } = await api.post('/mixes', form)
    mixes.value.unshift(data)
    Object.assign(form, { title: '', description: '', genre: '', duration: '', audioUrl: '' })
    formSuccess.value = 'Mix hoisted to the deck, arr!'
    showForm.value = false
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to drop mix'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchMixes)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.mix-form { margin-bottom: 2rem; }
.mix-form h2 { font-size: 1.3rem; color: var(--neon-cyan); margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.mixes-list { display: flex; flex-direction: column; gap: 1.5rem; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
</style>
