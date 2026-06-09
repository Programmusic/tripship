<template>
  <div class="auth-page">
    <h1 class="page-title">Join the Crew</h1>
    <p class="page-subtitle">Create your Trip Ship account</p>

    <form class="auth-form card" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="form.username" type="text" required autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="displayName">Display Name</label>
        <input id="displayName" v-model="form.displayName" type="text" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required minlength="6" autocomplete="new-password" />
      </div>
      <div class="form-group">
        <label for="role">I am a...</label>
        <select id="role" v-model="form.role">
          <option value="member">Crew Member</option>
          <option value="dj">DJ / Selector</option>
        </select>
      </div>
      <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>
      <button type="submit" class="btn btn--pink" :disabled="auth.loading">
        {{ auth.loading ? 'Creating account...' : 'Set Sail' }}
      </button>
      <p class="auth-form__switch">
        Already aboard? <RouterLink to="/login">Login</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  role: 'member',
})

async function handleRegister() {
  try {
    await auth.register(form)
    router.push('/')
  } catch {
    // error shown via store
  }
}
</script>

<style scoped>
.auth-page {
  max-width: 440px;
  margin: 0 auto;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.auth-form .btn {
  width: 100%;
  margin-top: 0.5rem;
}

.auth-form__switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
