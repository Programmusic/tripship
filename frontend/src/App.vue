<template>
  <div class="app-shell">
    <div class="scanlines" aria-hidden="true"></div>
    <DemoBanner v-if="isDemoMode" />
    <AppHeader />
    <main class="main-content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import DemoBanner from '@/components/DemoBanner.vue'
import { isDemoMode } from '@/api/client.js'
</script>
