<template>
  <div class="mixes-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">DJ Mixes</h1>
        <p class="page-subtitle">Fresh sessions from the Trip Ship selectors</p>
      </div>
      <button v-if="auth.isDj" class="btn btn--pink" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ Upload Mix' }}
      </button>
    </div>

    <form v-if="showForm" class="mix-form card" @submit.prevent="submitMix">
      <h2>Post a Mix</h2>
      <div class="form-group">
        <label for="title">Mix Title</label>
        <input id="title" v-model="form.title" type="text" required placeholder="Jungle Pressure Vol. 1" />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
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
        <label for="audioUrl">Audio URL</label>
        <input id="audioUrl" v-model="form.audioUrl" type="url" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label for="audioFile">Or upload audio file</label>
        <input id="audioFile" type="file" accept="audio/*" @change="onFileChange" />
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
      <button type="submit" class="btn btn--pink" :disabled="submitting">
        {{ submitting ? 'Uploading...' : 'Drop the Mix' }}
      </button>
    </form>

    <div v-if="!auth.isDj && auth.isAuthenticated" class="dj-notice card">
      <p>Want to post mixes? Register as a DJ or update your profile role.</p>
    </div>

    <div v-if="loading" class="empty-state">Loading mixes...</div>
    <div v-else-if="mixes.length === 0" class="empty-state">
      <p>No mixes on deck yet. DJs — log in and drop the first session.</p>
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
const audioFile = ref(null)

const form = reactive({
  title: '',
  description: '',
  genre: '',
  duration: '',
  audioUrl: '',
})

function onFileChange(e) {
  audioFile.value = e.target.files[0] || null
}

async function fetchMixes() {
  loading.value = true
  try {
    const { data } = await api.get('/mixes')
    mixes.value = data
  } catch {
    mixes.value = []
  } finally {
    loading.value = false
  }
}

async function submitMix() {
  formError.value = ''
  formSuccess.value = ''
  submitting.value = true
  try {
    const body = new FormData()
    body.append('title', form.title)
    body.append('description', form.description)
    body.append('genre', form.genre)
    body.append('duration', form.duration)
    if (form.audioUrl) body.append('audioUrl', form.audioUrl)
    if (audioFile.value) body.append('audio', audioFile.value)

    const { data } = await api.post('/mixes', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    mixes.value.unshift(data)
    Object.assign(form, { title: '', description: '', genre: '', duration: '', audioUrl: '' })
    audioFile.value = null
    formSuccess.value = 'Mix posted!'
    showForm.value = false
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to post mix'
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

.mix-form {
  margin-bottom: 2rem;
}

.mix-form h2 {
  font-size: 1.3rem;
  color: var(--neon-cyan);
  margin-bottom: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.mixes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dj-notice {
  margin-bottom: 2rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
