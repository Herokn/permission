<template>
  <div ref="containerRef" id="sub-app-container" class="sub-app-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

let subAppInstance: any = null;
const containerRef = ref<HTMLElement | null>(null);

onMounted(async () => {
  (window as any).__IS_GARFISH_SUB_APP__ = true;

  try {
    const entry = (import.meta as any).env?.VITE_USER_MANAGEMENT_URL || 'http://localhost:3042/users/';
    const moduleUrl = new URL('src/main.ts', entry).toString();

    let attempts = 0;
    const maxAttempts = 150;
    
    const mountSubApp = async () => {
      const container = containerRef.value;
      if (!container) {
        return false;
      }

      if ((window as any).userManagementProvider) {
        const providerFactory = (window as any).userManagementProvider;

        subAppInstance = providerFactory({
          basename: '/users',
          dom: container,
          appName: 'user-management',
        });

        if (subAppInstance && subAppInstance.render) {
          await subAppInstance.render({
            basename: '/users',
            dom: container,
          });
          return true;
        }
      } 
      
      return false;
    };

    const checkProvider = async () => {
      if (!(window as any).userManagementProvider && attempts === 0 && (import.meta as any).env?.DEV) {
        await import(/* @vite-ignore */ moduleUrl);
      }

      if (attempts < maxAttempts) {
        attempts++;
        if ((window as any).userManagementProvider) {
          await mountSubApp();
          return;
        }
        setTimeout(checkProvider, 100);
      } else {
        await mountSubApp();
      }
    };
    
    checkProvider();

  } catch (e) {
  }
});

onUnmounted(() => {
  if (subAppInstance && subAppInstance.destroy) {
      subAppInstance.destroy();
  }
  (window as any).__IS_GARFISH_SUB_APP__ = false;
});
</script>

<style scoped>
.sub-app-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 100px);
}
</style>
