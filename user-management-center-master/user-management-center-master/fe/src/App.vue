<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view :key="locale" 
  /></t-config-provider>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { useLocale } from '@/locales/useLocale';




const { getComponentsLocale, locale } = useLocale();
</script>

<style lang="less" scoped>

</style>
