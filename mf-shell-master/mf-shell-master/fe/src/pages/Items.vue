<template>
  <div style="padding:16px;">
    <t-space direction="vertical" size="small">
      <t-alert theme="success" :message="t('views.items.title')" />
      <t-button @click="load">{{ t('views.items.load') }}</t-button>
      <ul>
        <li v-for="it in items" :key="it.id">{{ it.id }} - {{ it.name }}</li>
      </ul>
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { Space as TSpace, Alert as TAlert, Button as TButton } from 'tdesign-vue-next'
import { getCurrentInstance, ref } from 'vue'
import type { Item } from '@wb/shared'
import { API } from '@wb/shared'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const items = ref<Item[]>([])
async function load() {
  const ins = getCurrentInstance()!.appContext.config.globalProperties.$http
  const r = await ins.get(API.mockItems)
  items.value = r.data.data as Item[]
}
</script>
