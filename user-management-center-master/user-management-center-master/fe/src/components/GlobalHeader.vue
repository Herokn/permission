<template>
  <div style="padding:8px;display:flex;gap:12px;align-items:center;border-bottom:1px solid #eee;">
    <t-space size="small">
      <router-link to="/">{{ t('nav.home') }}</router-link>
      <router-link to="/items">{{ t('nav.items') }}</router-link>
      <router-link to="/about">{{ t('nav.about') }}</router-link>
    </t-space>
    <t-space size="small" style="margin-left:auto;">
      <t-radio-group v-model="value" variant="default-filled">
        <t-radio-button value="zh-CN">中文</t-radio-button>
        <t-radio-button value="en-US">English</t-radio-button>
      </t-radio-group>
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { Space as TSpace, RadioGroup as TRadioGroup, RadioButton as TRadioButton } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { storage } from '@/utils/storage'
const { t, locale } = useI18n()
const appStore = useAppStore()
const value = ref(appStore.locale || locale.value)
import { watch } from 'vue'
watch(value, (v) => { appStore.setLocale(v); locale.value = v; storage.set('locale', v as string) })
</script>
