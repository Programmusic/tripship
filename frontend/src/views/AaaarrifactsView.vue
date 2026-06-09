<template>
  <div class="artifacts-page">
    <h1 class="page-title">Aaaarrifacts ☠</h1>
    <p class="page-subtitle">Buried treasure from the dancefloor — old fliers, posters, tickets & loot from back in the day</p>

    <div class="invite-gate">
      <p class="invite-gate__title">The Museum o' Mayhem</p>
      <p class="invite-gate__text">Dig out them photocopied fliers from yer attic. This be where we preserve the plunder — no museum curators, just crew.</p>
    </div>

    <div v-if="loading" class="empty-state">Hoistin' the artifacts from the hold...</div>
    <div v-else class="grid-2">
      <ArtifactCard v-for="item in artifacts" :key="item.id" :artifact="item" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/client'
import ArtifactCard from '@/components/ArtifactCard.vue'

const artifacts = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/artifacts')
    artifacts.value = data
  } finally {
    loading.value = false
  }
})
</script>
