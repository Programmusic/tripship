import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/client'
import { useAuthStore } from '@/stores/auth'

export const useLatticeProfileStore = defineStore('latticeProfile', () => {
  const myProfile = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchMyProfile() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return null
    loading.value = true
    error.value = null
    try {
      const { data } = await api.get('/lattice/profile/me')
      myProfile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMyProfile(patch) {
    saving.value = true
    error.value = null
    try {
      const { data } = await api.patch('/lattice/profile/me', patch)
      myProfile.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to save profile'
      throw err
    } finally {
      saving.value = false
    }
  }

  function canEdit(profile) {
    const auth = useAuthStore()
    if (!auth.user || !profile) return false
    return profile.userId === auth.user.id || profile.latticeId === auth.user.username
  }

  return {
    myProfile,
    loading,
    saving,
    error,
    fetchMyProfile,
    updateMyProfile,
    canEdit,
  }
})

export async function fetchLatticeProfiles() {
  const { data } = await api.get('/lattice/profiles')
  return data
}

export async function fetchLatticeProfile(latticeId) {
  const { data } = await api.get(`/lattice/profiles/${latticeId}`)
  return data
}
