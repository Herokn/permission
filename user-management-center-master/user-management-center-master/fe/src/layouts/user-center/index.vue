<template>
  <div class="user-center-layout" :class="{ 'is-loading': isInitializing }">
    <!-- 根据URL参数控制菜单显示 -->
    <div v-if="showMenu" class="layout-sidebar">
      <t-menu
        v-model:value="activeMenu"
        theme="light"
        :collapsed="false"
        class="sidebar-menu"
      >
        <!-- <t-menu-item value="overview" @click="handleMenuClick('overview')">
          <template #icon>
            <svg-icon name="dashboard" />
          </template>
          概览
        </t-menu-item> -->
        <t-menu-item
          value="organization"
          @click="handleMenuClick('organization')"
        >
          <template #icon>
            <svg-icon name="organization" />
          </template>
          Organization
        </t-menu-item>
        <t-menu-item value="list" @click="handleMenuClick('list')">
          <template #icon>
            <svg-icon name="user" />
          </template>
          Users
        </t-menu-item>
        <t-menu-item value="position" @click="handleMenuClick('position')">
          <template #icon>
            <svg-icon name="position" />
          </template>
          Positions
        </t-menu-item>
      </t-menu>
    </div>
    <div class="layout-content" :class="{ 'no-sidebar': !showMenu }">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EmbedModeManager } from '@/utils/embed-mode'
import { Menu as TMenu, MenuItem as TMenuItem } from 'tdesign-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const activeMenu = ref('overview')
const isInitializing = ref(false) // 初始化状态

// 通过URL参数控制菜单显示
// 使用方式：?hideMenu=true 或 ?showMenu=false
const showMenu = computed(() => {
  // 优先检查 hideMenu 参数
  if (route.query.hideMenu === 'true') {
    return false
  }
  // 检查 showMenu 参数
  if (route.query.showMenu === 'false') {
    return false
  }
  // 默认显示菜单
  return true
})

/**
 * 处理 token 参数
 * 与 token-bridge 保持一致的逻辑
 * 优化：避免重复处理，智能判断是否需要更新token
 */
const handleTokenParam = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken = urlParams.get('token')
  const existingToken = EmbedModeManager.getToken()

  // 如果有token参数，显示初始化动画
  if (urlToken) {
    isInitializing.value = true
  }

  try {
    if (urlToken) {
      // 判断是否需要更新token（新token与现有token不同时才更新）
      if (urlToken !== existingToken) {
        console.log('[UserCenter] New token detected, updating localStorage')

        // 标记为嵌入模式
        EmbedModeManager.markAsEmbedMode()

        // 保存新的 token
        EmbedModeManager.saveToken(urlToken)

        // 轻微延迟以显示动画效果
        await new Promise((resolve) => setTimeout(resolve, 300))
      } else {
        console.log('[UserCenter] Token already exists, skipping update')
      }

      // 无论是否更新，都要清除 URL 中的 token 参数（防止泄露）
      const url = new URL(window.location.href)
      url.searchParams.delete('token')

      // 使用 replaceState 更新 URL，不刷新页面
      window.history.replaceState({}, '', url.toString())
      console.log('[UserCenter] Token parameter cleaned from URL')
    } else if (existingToken) {
      // 没有URL token但localStorage有token，说明是刷新页面或跨路由访问
      console.log('[UserCenter] Using existing token from localStorage')
    }
  } finally {
    // 结束初始化状态
    isInitializing.value = false
  }
}

// 监听路由变化，自动激活对应菜单
watch(
  () => route.path,
  (newPath) => {
    // 根据路由路径设置活动菜单项
    if (newPath.includes('organization')) {
      activeMenu.value = 'organization'
      document.title = 'Organization - User Center'
    } else if (newPath.includes('list')) {
      activeMenu.value = 'list'
      document.title = 'Users - User Center'
    } else if (newPath.includes('position')) {
      activeMenu.value = 'position'
      document.title = 'Positions - User Center'
    } else if (newPath.includes('audit')) {
      activeMenu.value = 'audit'
      document.title = 'Audit - User Center'
    } else if (newPath.includes('overview')) {
      activeMenu.value = 'overview'
      document.title = 'Overview - User Center'
    } else {
      document.title = 'User Center'
    }
  },
  { immediate: true }
)

const handleMenuClick = (menuKey: string) => {
  // 根据菜单key跳转到对应路由，保留 userType 等重要参数
  const preservedParams: Record<string, string> = {}

  // 保留 userType 参数
  if (route.query.userType) {
    preservedParams.userType = route.query.userType as string
  }
  // 保留 hideMenu 参数
  if (route.query.hideMenu) {
    preservedParams.hideMenu = route.query.hideMenu as string
  }
  // 保留 showMenu 参数
  if (route.query.showMenu) {
    preservedParams.showMenu = route.query.showMenu as string
  }

  router.push({
    path: `/${menuKey}`,
    query: preservedParams,
  })
}

// 组件挂载时处理 token
onMounted(() => {
  handleTokenParam()
})
</script>

<style scoped lang="less">
.user-center-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;

  // 淡入动画
  animation: fadeIn 0.4s ease-in;

  // 初始化时的加载状态
  &.is-loading {
    opacity: 0.6;
    pointer-events: none; // 防止加载时点击
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.layout-sidebar {
  width: 200px;
  background-color: #fff;
  border-right: 1px solid #e7e7e7;
  overflow-y: auto;
  flex-shrink: 0;
  overflow-x: hidden;

  .sidebar-menu {
    height: 100%;
    border-right: none;
  }

  :deep(.t-menu__item) {
    height: 48px;
    line-height: 48px;
    padding-left: 24px;
    font-size: 14px;
    color: #333;
    transition: all 0.3s;

    &:hover {
      background-color: #f5f5f5;
    }

    &.t-is-active {
      background-color: #e6f2ff;
      color: #0052d9;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #0052d9;
      }
    }
  }

  :deep(.t-icon) {
    margin-right: 8px;
    font-size: 16px;
  }
}

.layout-content {
  flex: 1;
  overflow: auto;
  background-color: transparent;
  margin: 16px;

  // 无菜单模式下保持间距一致，提供统一的视觉体验
  &.no-sidebar {
    // 保持相同的margin，确保内容间距一致
    margin: 16px;
    width: auto; // 自适应宽度
  }
}

// 如果没有使用svg-icon组件，这里是简化版
:deep(.svg-icon) {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  display: inline-block;
}
</style>
