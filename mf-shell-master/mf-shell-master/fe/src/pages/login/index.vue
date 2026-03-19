<template>
  <div class="login-page" :style="bgStyle">
    <div class="login-card">
      <div class="login-title">
        <div class="welcome">{{ t('pages.login.welcome') }}</div>
        <div class="platform">{{ t('pages.login.platform') }}</div>
      </div>
      <div class="login-sub">
        <!-- <span>{{ t('pages.login.noAccount') }}</span> -->
        <!-- <t-link theme="primary" href="#">{{ t('pages.login.createAccount') }}</t-link> -->
      </div>
      <t-form :data="form" :rules="rules" @submit="onSubmit" label-width="0">
        <t-form-item name="username">
          <t-input
            v-model="form.username"
            :placeholder="t('pages.login.input.username')"
            clearable
            size="large"
          >
            <template #prefix-icon>
              <user-icon />
            </template>
          </t-input>
        </t-form-item>
        <t-form-item name="password">
          <t-input
            v-model="form.password"
            :placeholder="t('pages.login.input.password')"
            type="password"
            size="large"
          >
            <template #prefix-icon>
              <lock-on-icon />
            </template>
          </t-input>
        </t-form-item>
        <div class="login-ops">
          <t-checkbox v-model="form.remember">{{
            t('pages.login.remember')
          }}</t-checkbox>
          <t-link
            theme="primary"
            href="#"
            @click.prevent="forgotPasswordVisible = true"
            >{{ t('pages.login.forgotPassword') }}</t-link
          >
        </div>
        <t-form-item>
          <t-button
            theme="primary"
            block
            type="submit"
            :loading="loading"
            size="large"
            >{{ t('pages.login.signIn') }}</t-button
          >
        </t-form-item>
      </t-form>
      <div class="login-extra">
        <!-- <t-link href="#">{{ t('pages.login.scanLogin') }}</t-link> -->
        <!-- <span class="divider">|</span> -->
        <!-- <t-link href="#">{{ t('pages.login.phoneLogin') }}</t-link> -->
      </div>
    </div>
  </div>
  <ForgotPassword v-model:visible="forgotPasswordVisible" />
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessagePlugin } from 'tdesign-vue-next'
import { UserIcon, LockOnIcon } from 'tdesign-icons-vue-next'
import bg from '@/assets/imgs/login/bg.jpg'
import router from '@/router'
import { useUserStore } from '@/stores'
import ForgotPassword from './components/ForgotPassword.vue'

const { t } = useI18n()
const userStore = useUserStore()

const form = ref({ username: '', password: '', remember: true })
const loading = ref(false)
const forgotPasswordVisible = ref(false)

const rules = {
  username: [
    {
      required: true,
      message: t('pages.login.required.username'),
      type: 'error' as const,
    },
  ],
  password: [
    {
      required: true,
      message: t('pages.login.required.password'),
      type: 'error' as const,
    },
  ],
}

const bgStyle = computed(() => ({
  backgroundImage: `url(${bg})`,
}))

async function onSubmit(ctx: any) {
  const { e, validateResult, firstError } = ctx || {}

  if (e && typeof e.preventDefault === 'function') e.preventDefault()
  if (validateResult !== true) {
    if (firstError) MessagePlugin.error(firstError)
    return
  }
  if (loading.value) return
  loading.value = true
  try {
    const res = await userStore.login({
      username: form.value.username,
      password: form.value.password,
    })

    // 处理 ssoLogin 返回的重定向逻辑
    // 假设后端 ssoLogin 返回 { code: 200, result: { redirectUrl: '...' } }
    // 或者直接返回登录成功信息

    // 如果返回 code 200 且包含 redirectUrl，则跳转

    if (res?.data?.redirectUrl) {
      window.location.href = res?.data?.redirectUrl
      return
    }

    // userStore.login 已经处理了 Token 存储和权限获取

    const token = userStore.token
    if (token) {
      MessagePlugin.success(t('pages.login.signIn'))
      router.push('/dashboard')
    } else {
      MessagePlugin.error('Login failed: No access token received')
    }
  } catch (e: any) {
    MessagePlugin.error(e?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
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
  margin-top: 8px;
  color: #666;
}
.login-ops {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 16px;
}
.login-extra {
  margin-top: 8px;
  text-align: left;
}
.divider {
  margin: 0 8px;
  color: #999;
}
</style>
