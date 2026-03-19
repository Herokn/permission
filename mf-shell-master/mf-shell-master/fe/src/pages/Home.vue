<template>
  <div style="padding:16px;">
    <t-space direction="vertical" size="small">
      <t-alert theme="success" :message="t('views.home.title')" />
      <t-space>
        <t-button theme="primary" @click="$router.push('/items')">查看列表</t-button>
      </t-space>
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { Space as TSpace, Alert as TAlert, Button as TButton } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
