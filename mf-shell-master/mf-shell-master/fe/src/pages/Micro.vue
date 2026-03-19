<template>
  <div style="padding:16px;">
    <t-space direction="vertical" size="small">
      <t-alert theme="info" message="Micro Frontend" />
      <div id="mfe-container" style="min-height:240px;border:1px dashed #ddd;"></div>
      <div v-if="!url">Set VITE_MICRO_URL to load sub app</div>
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { Space as TSpace, Alert as TAlert } from 'tdesign-vue-next'
import garfish from '@/mfe/garfish'
import { onMounted, onUnmounted } from 'vue'
const url = (import.meta as any).env?.VITE_MICRO_URL || ''
let appRef: any
onMounted(async () => {
  if (!url) return
  appRef = await garfish.loadApp('subapp', { entry: url, domGetter: '#mfe-container' })
  await appRef?.mount?.()
})
onUnmounted(async () => { await appRef?.unmount?.() })
</script>
