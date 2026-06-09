<template>
  <div class="app-shell" :class="{ 'app-shell--immersive': isImmersive }">
    <div v-if="!isImmersive" class="scanlines" aria-hidden="true"></div>
    <DemoBanner v-if="isDemoMode && !isImmersive" />
    <AppHeader v-if="!isImmersive" />
    <main :class="isImmersive ? 'main-immersive' : 'main-content'">
      <RouterView />
    </main>
    <AppFooter v-if="!isImmersive" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import DemoBanner from '@/components/DemoBanner.vue'
import { isDemoMode } from '@/api/client.js'

const route = useRoute()
const isImmersive = computed(() => route.meta.immersive === true)
</script>

<style>
.main-immersive {
  flex: 1;
  padding: 0;
  max-width: none;
  margin: 0;
}

.app-shell--immersive {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
