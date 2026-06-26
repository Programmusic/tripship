<template>
  <div class="profile-page">
    <h1 class="page-title">Yer Manifest Entry</h1>
    <p class="page-subtitle">Trip Ship crew member — aboard the Unsocial Media</p>

    <div v-if="profileLoading" class="empty-state">Loading yer lattice profile...</div>

    <template v-else>
      <div class="profile-card card">
        <div class="profile-card__avatar" :style="{ borderColor: form.color, boxShadow: `0 0 18px ${form.color}55` }">
          ☠
        </div>
        <div class="profile-card__info">
          <h2>{{ form.name || auth.displayName }}</h2>
          <p class="profile-card__username">@{{ auth.user?.username }}</p>
          <span :class="['badge', auth.isDj ? 'badge--dj' : 'badge--gold']">
            {{ auth.isDj ? 'Selector / DJ' : 'Crew Member' }}
          </span>
        </div>
      </div>

      <form class="profile-edit card" @submit.prevent="saveProfile">
        <h2>Lattice node profile</h2>
        <p class="profile-edit__hint">This is what mates see when they click yer node on the Cosmic Communicator.</p>

        <div class="form-group">
          <label for="profile-name">Node name</label>
          <input id="profile-name" v-model="form.name" type="text" required maxlength="80" />
        </div>
        <div class="form-group">
          <label for="profile-role">Lattice role</label>
          <input id="profile-role" v-model="form.role" type="text" maxlength="80" />
        </div>
        <div class="form-group">
          <label for="profile-signal">Signal</label>
          <textarea id="profile-signal" v-model="form.signal" rows="3" maxlength="280" />
        </div>
        <div class="form-group">
          <label for="profile-bio">Bio</label>
          <textarea id="profile-bio" v-model="form.bio" rows="4" maxlength="500" />
        </div>
        <div class="form-group">
          <label for="profile-color">Node colour</label>
          <input id="profile-color" v-model="form.color" type="color" />
        </div>

        <p v-if="saveError" class="error-msg">{{ saveError }}</p>
        <p v-if="saveSuccess" class="success-msg">{{ saveSuccess }}</p>

        <button type="submit" class="btn btn--pink" :disabled="profileStore.saving">
          {{ profileStore.saving ? 'Saving...' : 'Save lattice profile' }}
        </button>
      </form>

      <div class="profile-actions">
        <RouterLink to="/memories" class="btn">Spin a Yarn</RouterLink>
        <RouterLink to="/the-list" class="btn">The List</RouterLink>
        <RouterLink v-if="auth.isDj" to="/mixes" class="btn btn--pink">Drop a Mix</RouterLink>
        <RouterLink to="/captains-cabin" class="btn btn--ghost">Captain's Cabin</RouterLink>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLatticeProfileStore } from '@/stores/latticeProfile'

const auth = useAuthStore()
const profileStore = useLatticeProfileStore()
const profileLoading = ref(true)
const saveError = ref('')
const saveSuccess = ref('')
const form = reactive({
  name: '',
  role: 'Lattice Mate',
  signal: '',
  bio: '',
  color: '#00ffcc',
})

onMounted(async () => {
  try {
    const profile = await profileStore.fetchMyProfile()
    form.name = profile.name
    form.role = profile.role
    form.signal = profile.signal
    form.bio = profile.bio
    form.color = profile.color
  } catch {
    form.name = auth.displayName
  } finally {
    profileLoading.value = false
  }
})

async function saveProfile() {
  saveError.value = ''
  saveSuccess.value = ''
  try {
    await profileStore.updateMyProfile({ ...form })
    saveSuccess.value = 'Lattice profile saved — yer node is updated across the ship.'
  } catch (err) {
    saveError.value = err.response?.data?.error || profileStore.error || 'Save failed'
  }
}
</script>

<style scoped>
.profile-page { max-width: 640px; margin: 0 auto; }
.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.profile-card__avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), var(--wood-mid));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 2px solid var(--gold);
  flex-shrink: 0;
}
.profile-card__info h2 { font-size: 1.8rem; margin-bottom: 0.25rem; color: var(--gold); }
.profile-card__username { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; }
.profile-edit { margin-bottom: 1.5rem; }
.profile-edit h2 { font-size: 1.3rem; color: var(--gold); margin-bottom: 0.5rem; }
.profile-edit__hint { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.5; }
.profile-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
</style>
