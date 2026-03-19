<template>
  <div style="padding:16px;">
    <t-space direction="vertical" size="small">
      <t-alert theme="info" :message="t('views.about.title')" />
    </t-space>
  </div>
</template>
<script setup lang="ts">
import { Space as TSpace, Alert as TAlert } from 'tdesign-vue-next'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>
