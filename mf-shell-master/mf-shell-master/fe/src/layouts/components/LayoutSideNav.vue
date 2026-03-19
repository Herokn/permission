<template>
  <l-side-nav
    v-if="settingStore.showSidebar"
    :show-logo="settingStore.showSidebarLogo"
    :layout="settingStore.layout"
    :is-fixed="settingStore.isSidebarFixed"
    :menu="sideMenu"
    :theme="settingStore.displayMode"
    :is-compact="settingStore.isSidebarCompact"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { usePermissionStore, useSettingStore } from '@/stores';
import type { MenuRoute } from '@/types/interface';

import LSideNav from './SideNav.vue';

const route = useRoute();
const permissionStore = usePermissionStore();
const settingStore = useSettingStore();
const { routers: menuRouters, menuTree } = storeToRefs(permissionStore);

// 转换 MenuPermission 为 MenuRoute
const transformMenu = (menus: any[]): MenuRoute[] => {
  return menus.map(menu => ({
    path: menu.path || '',
    name: menu.menuCode || menu.menuId,
    title: menu.menuName,
    icon: menu.icon || undefined,
    meta: {
      title: menu.menuName,
      icon: menu.icon,
    },
    children: menu.children ? transformMenu(menu.children) : [],
  }));
};

const sideMenu = computed(() => {
  // 1. 如果有后端返回的菜单树，优先使用
  if (menuTree.value && menuTree.value.length > 0) {
    return transformMenu(menuTree.value);
  }

  // 2. 否则使用本地路由配置 (回退逻辑)
  const { layout, splitMenu } = settingStore;
  let newMenuRouters = menuRouters.value as Array<MenuRoute>;
  if (layout === 'mix' && splitMenu) {
    newMenuRouters.forEach((menu) => {
      if (route.path.indexOf(menu.path) === 0) {
        newMenuRouters = menu.children.map((subMenu) => ({ ...subMenu, path: `${menu.path}/${subMenu.path}` }));
      }
    });
  }
  return newMenuRouters;
});
</script>
