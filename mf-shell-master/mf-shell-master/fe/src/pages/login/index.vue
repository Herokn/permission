<template>
  <div class="login-page" :style="bgStyle">
    <div class="login-card">
      <div class="login-title">
        <div class="welcome">{{ t('pages.login.welcome') }}</div>
        <div class="platform">{{ t('pages.login.platform') }}</div>
      </div>
      <div class="login-sub">{{ loginText }}</div>
      <t-button theme="primary" block :loading="loading" @click="goPermissionLogin">
        去 permission 登录
      </t-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import bg from '@/assets/imgs/login/bg.jpg'
import router from '@/router'
import { useUserStore } from '@/stores'

const { t } = useI18n()
const userStore = useUserStore()

const loading = ref(false)
const loginText = ref('正在校验 permission 登录态...')

const bgStyle = computed(() => ({
  backgroundImage: `url(${bg})`,
}))

function goPermissionLogin() {
  const loginBase = import.meta.env.VITE_PERMISSION_CENTER_URL || 'http://localhost:3000/'
  const redirect = encodeURIComponent(window.location.href)
  window.location.href = `${loginBase}login?redirect=${redirect}`
}

async function bootstrapLogin() {
  loading.value = true
  try {
    await userStore.loginByPermissionSession('P1')
    if (userStore.token) {
      router.push('/dashboard')
      return
    }
    loginText.value = '未检测到 permission 登录态，准备跳转登录'
    goPermissionLogin()
  } catch {
    loginText.value = '未检测到 permission 登录态，准备跳转登录'
    goPermissionLogin()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  bootstrapLogin()
})
</script>
<style scoped lang="less">
.login-page {
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 420px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 24px;
}
.login-title .welcome {
  font-size: 20px;
  font-weight: 600;
}
.login-title .platform {
  margin-top: 6px;
  font-size: 18px;
  color: #666;
}
.login-sub {
  margin-top: 12px;
  margin-bottom: 16px;
  color: #666;
}
</style>
