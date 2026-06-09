<template>
  <div class="auth-page">
    <h1 class="page-title">Login</h1>
    <p class="page-subtitle">Welcome back to the sound system</p>

    <form class="auth-form card" @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" v-model="username" type="text" required autocomplete="username" />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="current-password" />
      </div>
      <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>
      <button type="submit" class="btn btn--pink" :disabled="auth.loading">
        {{ auth.loading ? 'Logging in...' : 'Enter the Dancefloor' }}
      </button>
      <p class="auth-form__switch">
        New to Trip Ship? <RouterLink to="/register">Join the crew</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await auth.login(username.value, password.value)
    router.push(route.query.redirect || '/')
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
