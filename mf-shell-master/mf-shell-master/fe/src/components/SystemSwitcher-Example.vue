<!-- 
  使用示例：在主应用头部集成系统切换器
  替换您当前的 SystemSwitcher.vue 文件
-->
<template>
  <div class="global-header-system-switcher">
    <!-- 系统选项卡 -->
    <div v-if="systemList.length > 0" class="system-tabs">
      <div
        v-for="system in systemList"
        :key="system.mapUuid"
        :class="['system-tab-item', { 'is-active': isCurrentSystem(system) }]"
        @click="handleSwitchSystem(system)"
      >
        <span class="system-name">{{ system.mapShowname || system.mapRemarks }}</span>
      </div>
    </div>
    
    <!-- 加载中状态 -->
    <div v-if="loading" class="permission-loading">
      <t-loading size="small" text="加载中..." />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissionStore } from '@/stores/modules/permission';
import { MessagePlugin } from 'tdesign-vue-next';
import type { SystemPermission } from '@/stores/modules/permission';

const permissionStore = usePermissionStore();

// 系统列表
const systemList = computed(() => permissionStore.systemList);

// 当前系统
const currentSystem = computed(() => permissionStore.currentSystem);

// 加载状态
const loading = computed(() => permissionStore.loading);

// 判断是否为当前系统
const isCurrentSystem = (system: SystemPermission) => {
  return currentSystem.value?.mapUuid === system.mapUuid;
};

/**
 * 处理系统切换
 */
const handleSwitchSystem = async (system: SystemPermission) => {
  // 如果是当前系统，无需切换
  if (isCurrentSystem(system)) return;
  
  try {
    // 调用 permission store 的切换方法
    const permissions = await permissionStore.switchSystem(system);
    
    if (permissions) {
      console.log('[SystemSwitcher] 系统切换成功:', {
        system: system.mapShowname,
        menus: permissions.menus.length,
        buttons: permissions.buttons.length,
      });
      
      MessagePlugin.success(`已切换到 ${system.mapShowname}`);
      
      // 通知所有子应用权限已更新
      window.dispatchEvent(new CustomEvent('garfish:permission', {
        detail: {
          type: 'PERMISSION_UPDATED',
          data: {
            system,
            permissions,
          },
        },
      }));
      
      // 同时更新全局变量供子应用访问
      (window as any).__MICRO_APP_PERMISSIONS__ = {
        system: system,
        menus: permissions.menus,
        buttons: permissions.buttons,
      };
    }
  } catch (error) {
    console.error('[SystemSwitcher] 系统切换失败:', error);
    MessagePlugin.error('切换系统失败，请重试');
  }
};
</script>

<style scoped lang="less">
.global-header-system-switcher {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-tabs {
  display: flex;
  gap: 4px;
  align-items: center;
}

.system-tab-item {
  position: relative;
  padding: 6px 16px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
  transition: all 0.2s ease;
  user-select: none;
  white-space: nowrap;
  
  &:hover {
    background-color: var(--td-bg-color-container-hover);
    color: var(--td-text-color-primary);
  }
  
  &.is-active {
    background-color: var(--td-brand-color);
    color: #fff;
    font-weight: 500;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background-color: currentColor;
    }
  }
}

.system-name {
  display: inline-block;
}

.permission-loading {
  padding: 0 12px;
}
</style>
