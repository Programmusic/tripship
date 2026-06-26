<template>
  <aside v-if="member" class="lattice-profile card">
    <div class="lattice-profile__header">
      <span class="lattice-profile__dot" :style="{ background: member.color }" />
      <div>
        <p class="lattice-profile__eyebrow">{{ editing ? 'Edit yer node' : 'Lattice profile' }}</p>
        <h3 class="lattice-profile__name">{{ form.name || member.name }}</h3>
        <p class="lattice-profile__role">{{ form.role || member.role }}</p>
      </div>
    </div>

    <form v-if="editing" class="lattice-profile__form" @submit.prevent="save">
      <label>
        <span>Node name</span>
        <input v-model="form.name" type="text" required maxlength="80" />
      </label>
      <label>
        <span>Lattice role</span>
        <input v-model="form.role" type="text" maxlength="80" />
      </label>
      <label>
        <span>Signal</span>
        <textarea v-model="form.signal" rows="3" maxlength="280" />
      </label>
      <label>
        <span>Bio</span>
        <textarea v-model="form.bio" rows="4" maxlength="500" />
      </label>
      <label>
        <span>Node colour</span>
        <input v-model="form.color" type="color" />
      </label>
      <p v-if="saveError" class="error-msg">{{ saveError }}</p>
      <div class="lattice-profile__actions">
        <button type="button" class="btn btn--ghost" @click="cancelEdit">Cancel</button>
        <button type="submit" class="btn btn--pink" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save node' }}
        </button>
      </div>
    </form>

    <template v-else>
      <p class="lattice-profile__signal">{{ member.signal }}</p>
      <p v-if="member.bio" class="lattice-profile__bio">{{ member.bio }}</p>
      <p v-else class="lattice-profile__bio lattice-profile__bio--empty">No bio yet on the lattice.</p>

      <div v-if="canEdit" class="lattice-profile__owner">
        <button type="button" class="btn btn--pink" @click="startEdit">Edit my profile</button>
        <RouterLink to="/profile" class="btn btn--ghost">Full manifest</RouterLink>
      </div>

      <div class="lattice-profile__linked">
        <p class="lattice-profile__linked-title">Lattice mates</p>
        <ul>
          <li v-for="mate in linked" :key="mate.id">
            <button type="button" class="lattice-profile__link-btn" @click="$emit('select', mate.id)">
              <span class="lattice-profile__link-dot" :style="{ background: mate.color }" />
              {{ mate.name }}
            </button>
          </li>
        </ul>
      </div>
    </template>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useLatticeProfileStore } from '@/stores/latticeProfile'

const emit = defineEmits(['select', 'updated'])

const props = defineProps({
  member: { type: Object, default: null },
  linked: { type: Array, default: () => [] },
})

const profileStore = useLatticeProfileStore()
const editing = ref(false)
const saving = ref(false)
const saveError = ref('')
const form = ref(emptyForm())

const canEdit = computed(() => profileStore.canEdit(props.member))

function emptyForm() {
  return { name: '', role: '', signal: '', bio: '', color: '#00ffcc' }
}

function syncForm() {
  if (!props.member) return
  form.value = {
    name: props.member.name || '',
    role: props.member.role || 'Lattice Mate',
    signal: props.member.signal || '',
    bio: props.member.bio || '',
    color: props.member.color || '#00ffcc',
  }
}

function startEdit() {
  syncForm()
  editing.value = true
  saveError.value = ''
}

function cancelEdit() {
  editing.value = false
  saveError.value = ''
}

async function save() {
  saving.value = true
  saveError.value = ''
  try {
    const updated = await profileStore.updateMyProfile({ ...form.value })
    editing.value = false
    emit('updated', updated)
  } catch (err) {
    saveError.value = err.response?.data?.error || profileStore.error || 'Save failed'
  } finally {
    saving.value = false
  }
}

watch(() => props.member?.id, () => {
  editing.value = false
  saveError.value = ''
})
</script>

<style scoped>
.lattice-profile {
  padding: 1rem 1.1rem;
  background: rgba(10, 14, 24, 0.85);
  border: 1px solid rgba(0, 255, 204, 0.2);
  border-radius: 4px;
}

.lattice-profile__header {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.lattice-profile__dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.35rem;
  box-shadow: 0 0 12px currentColor;
}

.lattice-profile__eyebrow {
  font-size: 0.6rem;
  color: var(--neon-cyan);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.lattice-profile__name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--gold);
  margin-bottom: 0.15rem;
}

.lattice-profile__role {
  font-size: 0.72rem;
  color: var(--neon-pink);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lattice-profile__signal {
  font-size: 0.85rem;
  color: var(--text-primary);
  line-height: 1.55;
  margin-bottom: 0.75rem;
}

.lattice-profile__bio {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin-bottom: 1rem;
}

.lattice-profile__bio--empty {
  font-style: italic;
}

.lattice-profile__owner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.lattice-profile__form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lattice-profile__form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.lattice-profile__form label span {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lattice-profile__form input,
.lattice-profile__form textarea {
  width: 100%;
}

.lattice-profile__form input[type='color'] {
  height: 2.5rem;
  padding: 0.2rem;
}

.lattice-profile__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lattice-profile__linked-title {
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.lattice-profile__linked ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.lattice-profile__link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0.25rem 0;
  text-align: left;
}

.lattice-profile__link-btn:hover {
  color: var(--neon-cyan);
}

.lattice-profile__link-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
