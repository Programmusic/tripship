import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(loadUser())
  const token = ref(localStorage.getItem('tripship_token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isDj = computed(() => user.value?.role === 'dj')
  const displayName = computed(() => user.value?.displayName || user.value?.username || '')

  function loadUser() {
    try {
      const raw = localStorage.getItem('tripship_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function setSession(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('tripship_token', newToken)
    localStorage.setItem('tripship_user', JSON.stringify(newUser))
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem('tripship_token')
    localStorage.removeItem('tripship_user')
  }

  async function login(username, password) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/auth/login', { username, password })
      setSession(data.token, data.user)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await api.post('/auth/register', payload)
      setSession(data.token, data.user)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    clearSession()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isDj,
    displayName,
    login,
    register,
    logout,
  }
})
