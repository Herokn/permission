<template>
  <div id="sub-app-container" class="sub-app-container">
    <transition name="fade">
      <div v-if="loading" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <div class="loading-text">Loading Application...</div>
          <div class="loading-subtext">Please wait a moment</div>
        </div>
      </div>
    </transition>
    <iframe
      ref="iframeRef"
      :src="iframeSrc"
      class="sub-app-iframe"
      :class="{ 'iframe-loading': loading }"
      frameborder="0"
      @load="handleIframeLoad"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { usePermissionStore } from '@/stores'

const permissionStore = usePermissionStore()
const iframeSrc = computed(() => permissionStore.currentIframeSrc)
const loading = ref(true) // Initial loading state
const iframeRef = ref<HTMLIFrameElement>()

// Watch iframe src changes and show loading
watch(
  iframeSrc,
  (newSrc, oldSrc) => {
    if (newSrc && newSrc !== oldSrc) {
      loading.value = true
    }
  },
  { immediate: true }
)

// Hide loading after iframe loaded
const handleIframeLoad = () => {
  loading.value = false
}

// Set initial loading
onMounted(() => {
  if (iframeSrc.value) {
    loading.value = true
  }
})
</script>

<style scoped>
.sub-app-container {
  background-color: #fff;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 100px);
  position: relative;
}

.loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: 0s;
  opacity: 1;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.15s;
  opacity: 0.8;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.3s;
  opacity: 0.6;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-subtext {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sub-app-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;

  &.iframe-loading {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
}
</style>
