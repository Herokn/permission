<template>
  <div class="system-switcher">
    <!-- 系统选项卡 -->
    <div class="system-tabs">
      <div
        v-for="system in systemList"
        :key="system.mapUuid"
        :class="['system-tab', { active: isActive(system) }]"
        @click="handleSystemSwitch(system)"
      >
        <span class="system-name">{{ system.mapShowname }}</span>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <t-loading text="加载权限中..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '@/stores/modules/permission';
import { useRouter } from 'vue-router';
import type { SystemPermission } from '@/stores/modules/permission';

const permissionStore = usePermissionStore();
const router = useRouter();

const systemList = computed(() => permissionStore.systemList);
const currentSystem = computed(() => permissionStore.currentSystem);
const loading = computed(() => permissionStore.loading);

const isActive = (system: SystemPermission) => {
  return currentSystem.value?.mapUuid === system.mapUuid;
};

/**
 * 处理系统切换
 * 1. 调用权限接口获取菜单和按钮权限
 * 2. 通知子应用权限已更新
 * 3. 跳转到对应系统首页
 */
const handleSystemSwitch = async (system: SystemPermission) => {
  if (isActive(system)) return;
  
  try {
    // 切换系统并加载权限
    const permissions = await permissionStore.switchSystem(system);
    
    if (permissions) {
      console.log('[SystemSwitcher] 权限加载成功:', permissions);
      
      // 通知子应用权限已更新
      notifyMicroApps({
        type: 'PERMISSION_UPDATED',
        data: {
          system: system,
          permissions: permissions,
        },
      });
      
      // 可选：跳转到该系统的首页
      // router.push(`/${system.mapCode}`);
    }
  } catch (error) {
    console.error('[SystemSwitcher] 切换系统失败:', error);
  }
};

/**
 * 通知所有子应用
 */
const notifyMicroApps = (message: any) => {
  // 通过 Garfish 的事件系统通知子应用
  window.dispatchEvent(new CustomEvent('garfish:permission', {
    detail: message,
  }));
  
  // 也可以通过 props 传递给子应用
  (window as any).__MICRO_APP_PERMISSIONS__ = {
    system: permissionStore.currentSystem,
    menus: permissionStore.menuTree,
    buttons: permissionStore.buttonPermissions,
  };
};
</script>

<style scoped lang="less">
.system-switcher {
  position: relative;
}

.system-tabs {
  display: flex;
  gap: 4px;
  align-items: center;
}

.system-tab {
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 14px;
  color: var(--td-text-color-secondary);
  
  &:hover {
    background-color: var(--td-bg-color-container-hover);
    color: var(--td-text-color-primary);
  }
  
  &.active {
    background-color: var(--td-brand-color);
    color: #fff;
    font-weight: 500;
  }
}

.system-name {
  white-space: nowrap;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
</style>
