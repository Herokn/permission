<template>
  <div>
    <template v-if="setting.layout.value === 'side'">
      <t-layout key="side" :class="mainLayoutCls">
        <t-aside v-if="!isHidePdfConfig && showSidebar"><layout-side-nav /></t-aside>
        <t-layout>
          <t-header v-if="!isHidePdfConfig"><layout-header /></t-header>
          <t-content
            ><layout-content
              :is-hide-pdf-config="isHidePdfConfig"
              :class-name="isHidePdfConfig ? 'custom-content' : ''"
          /></t-content>
        </t-layout>
      </t-layout>
    </template>

    <template v-else>
      <t-layout key="no-side">
        <t-header><layout-header /> </t-header>
        <t-layout :class="mainLayoutCls">
          <!-- <layout-side-nav /> -->
          <layout-content />
        </t-layout>
      </t-layout>
    </template>
    <setting-com />
  </div>
</template>

<script setup lang="ts">
import '@/styles/layout.less';

import { storeToRefs } from 'pinia';
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute } from 'vue-router';

import { prefix } from '@/config/global';
import { useSettingStore, useTabsRouterStore, usePermissionStore } from '@/stores';

import LayoutContent from './components/LayoutContent.vue';
import LayoutHeader from './components/LayoutHeader.vue';
import LayoutSideNav from './components/LayoutSideNav.vue';
import SettingCom from './setting.vue';

const route = useRoute();
const settingStore = useSettingStore();
const tabsRouterStore = useTabsRouterStore();
const permissionStore = usePermissionStore();
const setting = storeToRefs(settingStore);
const { currentSystem } = storeToRefs(permissionStore);

const onlyShowContentRoutePath = ref([
  '/design-construction/start-closing-tracker/ai-quality-report',
  '/design-construction/start-closing-tracker/ai-project-analysis-report',
  '/design-construction/start-closing-tracker/ai-unit-analysis-report',
]);

const isHidePdfConfig = computed(() => {
  return onlyShowContentRoutePath.value.includes(route.path);
});

// 判断是否显示侧边栏
// 1. 全局配置 showSidebar 为 true
// 2. 当前系统不为“外部系统”（老系统），即 mapExternal !== 'Y'
// 注意：如果 mapExternal 为 'Y'，则认为该系统自带菜单，Shell 不显示侧边栏
const showSidebar = computed(() => {
  if (!settingStore.showSidebar) return false;
  if (currentSystem.value && currentSystem.value.mapExternal === 'Y') {
    return false;
  }
  return true;
});

const mainLayoutCls = computed(() => [
  {
    't-layout--with-sider': showSidebar.value,
  },
]);
const appendNewRoute = () => {
  const {
    path,
    query,
    meta: { title },
    name,
  } = route;
  tabsRouterStore.appendTabRouterList({ path, query, title: title as string, name, isAlive: true, meta: route.meta });
};

onMounted(() => {
  appendNewRoute();
});

watch(
  () => route.path,
  () => {
    appendNewRoute();
    const layout = document.querySelector(`.${prefix}-layout`);
    if (layout) {
      layout.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
);
</script>

<style lang="less" scoped>
:deep(.custom-content) {
  height: max-content;
}
</style>
