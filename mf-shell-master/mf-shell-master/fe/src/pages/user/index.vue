<template>
  <div class="micro-app-container">
    <div id="subapp-user-container"></div>
    <div v-if="!url" class="error-tip">
      Please configure VITE_MICRO_USER_URL in .env
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import garfish from '@/mfe/garfish';

const url = (import.meta as any).env.VITE_MICRO_USER_URL;
let appRef: any;

onMounted(async () => {
  if (!url) return;
  appRef = await garfish.loadApp('user-center', {
    entry: url,
    domGetter: '#subapp-user-container',
  });
  await appRef?.mount?.();
});

onUnmounted(async () => {
  await appRef?.unmount?.();
});
</script>

<style scoped>
.micro-app-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
