<template>
  <div class="invites-page">
    <h1 class="page-title">The List</h1>
    <p class="page-subtitle">Invite yer mates from back in the day — if their name ain't here, they ain't boardin'</p>

    <div class="invite-gate">
      <p class="invite-gate__title">☠ Unsocial Media ☠</p>
      <p class="invite-gate__text">No randos. No algorithms. Crew invite crew. Ye've got <strong>{{ invitesLeft }}</strong> invites left in yer pouch.</p>
    </div>

    <form v-if="auth.isAuthenticated" class="invite-form card" @submit.prevent="sendInvite">
      <h2>Send a Boardin' Pass</h2>
      <div class="form-group">
        <label for="name">Matey's Name</label>
        <input id="name" v-model="form.name" type="text" required placeholder="e.g. Rude Boy Steve" />
      </div>
      <div class="form-group">
        <label for="email">Scroll Address (Email)</label>
        <input id="email" v-model="form.email" type="email" required placeholder="matey@example.com" />
      </div>
      <p v-if="formError" class="error-msg">{{ formError }}</p>
      <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
      <button type="submit" class="btn btn--pink" :disabled="submitting || invitesLeft <= 0">
        {{ submitting ? 'Sendin\'...' : 'Put \'Em On The List' }}
      </button>
    </form>

    <h2 class="section-title">Who's On The List</h2>
    <div v-if="loading" class="empty-state">Checkin' the manifest...</div>
    <ul v-else class="invite-list">
      <li v-for="inv in invites" :key="inv.id" class="invite-item card">
        <div>
          <strong>{{ inv.name }}</strong>
          <span class="invite-item__email">{{ inv.email }}</span>
        </div>
        <span :class="['badge', inv.status === 'accepted' ? 'badge--gold' : 'badge--invite']">
          {{ inv.status === 'accepted' ? 'Aboard' : 'Awaitin\' passage' }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const invites = ref([])
const loading = ref(true)
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')
const invitesLeft = ref(3)

const form = reactive({ name: '', email: '' })

async function fetchInvites() {
  loading.value = true
  try {
    const { data } = await api.get('/invites')
    invites.value = data
  } finally {
    loading.value = false
  }
}

async function sendInvite() {
  formError.value = ''
  formSuccess.value = ''
  submitting.value = true
  try {
    const { data } = await api.post('/invites', form)
    invites.value.unshift(data)
    invitesLeft.value--
    form.name = ''
    form.email = ''
    formSuccess.value = 'Boardin\' pass sent! They\'ll get a scroll via email, arr!'
  } catch (err) {
    formError.value = err.response?.data?.error || 'Failed to send invite'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchInvites)
</script>

<style scoped>
.invite-form {
  margin-bottom: 2rem;
}

.invite-form h2 {
  font-size: 1.3rem;
  color: var(--gold);
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.5rem;
  color: var(--neon-pink);
  margin-bottom: 1rem;
}

.invite-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.invite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.invite-item strong {
  display: block;
  color: var(--neon-cyan);
}

.invite-item__email {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
