<template>
  <div class="token-bridge-container">
    <div class="welcome-card">
      <div class="welcome-icon">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="url(#gradient)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-dasharray="8 4"
          />
          <path
            d="M40 20L50 30L40 40L30 30L40 20Z"
            fill="url(#gradient)"
            opacity="0.8"
          />
          <path d="M40 40L50 50L40 60L30 50L40 40Z" fill="url(#gradient)" />
          <defs>
            <linearGradient
              id="gradient"
              x1="0"
              y1="0"
              x2="80"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#667eea" />
              <stop offset="1" stop-color="#764ba2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <h1 class="welcome-title">Welcome to User Center</h1>
      <p class="welcome-subtitle">{{ statusMessage }}</p>

      <div class="loading-bar">
        <div class="loading-progress" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EmbedModeManager } from '@/utils/embed-mode'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const statusMessage = ref('Initializing your workspace...')
const progress = ref(0)

// Simulate progress animation
const animateProgress = (target: number, duration: number) => {
  const start = progress.value
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const percent = Math.min(elapsed / duration, 1)
    progress.value = start + (target - start) * percent

    if (percent < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

/**
 * Handle token bridge logic
 */
const handleTokenBridge = async () => {
  try {
    // Step 1: Initial progress
    animateProgress(30, 300)
    statusMessage.value = 'Verifying credentials...'
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Initialize embed mode and extract token
    const { hasToken, targetRoute, userType } = EmbedModeManager.initialize()

    if (!hasToken) {
      // 访问 /token-bridge 说明是嵌入模式场景，没有 token 应跳转到外部系统登录页
      animateProgress(100, 300)
      statusMessage.value = 'Token not found, redirecting to login...'

      setTimeout(() => {
        // 标记为嵌入模式，然后跳转到外部系统登录页
        EmbedModeManager.markAsEmbedMode()
        EmbedModeManager.redirectToEmbedLogin()
      }, 800)
      return
    }

    // Step 2: Token found
    animateProgress(60, 400)
    statusMessage.value = 'Authentication successful!'
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Step 3: Preparing workspace
    animateProgress(90, 400)
    statusMessage.value = 'Preparing your workspace...'
    await new Promise((resolve) => setTimeout(resolve, 400))

    // Step 4: Complete
    animateProgress(100, 300)
    statusMessage.value = 'Welcome! Redirecting...'

    setTimeout(() => {
      // 构建跳转路径，携带 userType 参数（保留在 URL 中）
      // 如果有 userType 参数，跳转到用户列表页面
      let finalRoute = userType ? '/list' : targetRoute || '/'
      if (userType) {
        const separator = finalRoute.includes('?') ? '&' : '?'
        // 添加 fromTokenBridge 标记，表示来自 token-bridge 跳转
        finalRoute = `${finalRoute}${separator}userType=${userType}&fromTokenBridge=1`
      }
      router.replace(finalRoute)
    }, 600)
  } catch (error) {
    console.error('[TokenBridge] Error:', error)
    statusMessage.value = 'Something went wrong, redirecting to login...'
    animateProgress(100, 300)

    setTimeout(() => {
      EmbedModeManager.redirectToStandaloneLogin()
    }, 1500)
  }
}

onMounted(() => {
  handleTokenBridge()
})
</script>

<style scoped lang="less">
.token-bridge-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.welcome-card {
  text-align: center;
  padding: 60px 50px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.welcome-icon {
  margin-bottom: 24px;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.welcome-title {
  font-size: 32px;
  height: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 16px 0;
}

.welcome-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  min-height: 24px;
  font-weight: 500;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: rgba(102, 126, 234, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 40px;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

@media (max-width: 600px) {
  .welcome-card {
    padding: 40px 30px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }
}
</style>
