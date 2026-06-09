<template>
  <div class="memories-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Crew Tales</h1>
        <p class="page-subtitle">Stories from the dancefloor — preserved in the ship's log forever, arr</p>
      </div>
      <button v-if="auth.isAuthenticated" class="btn" @click="showForm = !showForm">
        {{ showForm ? 'Belay That' : '+ Spin a Yarn' }}
      </button>
    </div>

    <form v-if="showForm" class="memory-form card" @submit.prevent="submitMemory">
      <h2>Tell Yer Tale</h2>
      <div class="form-group">
        <label for="title">Title o' the Tale</label>
        <input id="title" v-model="form.title" type="text" required placeholder="That night at the warehouse..." />
      </div>
      <div class="form-group">
        <label for="content">Yer Story</label>
        <textarea id="content" v-model="form.content" required placeholder="What went down on the dancefloor, me hearty..."></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="eventYear">Year</label>
          <input id="eventYear" v-model="form.eventYear" type="text" placeholder="e.g. 1996" />
        </div>
        <div class="form-group">
          <label for="location">Port o' Call</label>
          <input id="location" v-model="form.location" type="text" placeholder="e.g. Bristol warehouse" />
        </div>
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
      <button type="submit" class="btn btn--pink" :disabled="submitting">
        {{ submitting ? 'Loggin\'...' : 'Record in the Hold' }}
      </button>
    </form>

    <div v-if="loading" class="empty-state">Hoistin' tales from the hold...</div>
    <div v-else-if="memories.length === 0" class="empty-state">
      <p>No tales in the log yet. Be the first to spin a yarn from the sound system, arr!</p>
    </div>
    <div v-else class="grid-2">
      <MemoryCard v-for="memory in memories" :key="memory.id" :memory="memory" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import MemoryCard from '@/components/MemoryCard.vue'

const auth = useAuthStore()
const memories = ref([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')
const form = reactive({ title: '', content: '', eventYear: '', location: '' })

async function fetchMemories() {
  loading.value = true
  try {
    const { data } = await api.get('/memories')
    memories.value = data
  } finally {
    loading.value = false
  }
}

async function submitMemory() {
  formError.value = ''
  formSuccess.value = ''
  submitting.value = true
  try {
    const { data } = await api.post('/memories', form)
    memories.value.unshift(data)
    Object.assign(form, { title: '', content: '', eventYear: '', location: '' })
    formSuccess.value = 'Tale recorded in the ship\'s log, arr!'
    showForm.value = false
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to log tale'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchMemories)
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
.memory-form { margin-bottom: 2rem; }
.memory-form h2 { font-size: 1.3rem; color: var(--gold); margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
@media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
</style>
