<template>
  <ShipExplorer />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const ShipExplorer = defineAsyncComponent(() => import('@/components/ShipExplorer.vue'))
</script>
