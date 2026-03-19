<template>
  <div :class="layoutCls">
    <t-head-menu
      :class="menuCls"
      :theme="menuTheme"
      expand-type="popup"
      :value="active"
    >
      <template #logo>
        <span
          v-if="showLogo"
          class="header-logo-container"
          @click="handleNav('/')"
        >
          <img :src="LogoFull" class="t-logo" />
          <span class="header-logo-text">Wan Bridge</span>
        </span>
        <div v-else class="header-operate-left">
          <t-button
            theme="default"
            shape="square"
            variant="text"
            @click="changeCollapsed"
          >
            <t-icon class="collapsed-icon" name="view-list" />
          </t-button>

          <!-- <search :layout="layout" /> -->
        </div>
      </template>

      <template #default>
        <div v-if="visibleSystems.length > 0" class="header-system-nav">
          <!-- 显示前 N 个系统 -->
          <t-menu-item
            v-for="item in visibleSystems"
            :key="item.mapUuid || item.id"
            :value="item.mapUuid || item.id"
            :class="[
              'system-nav-item',
              { active: currentSystem?.mapUuid === item.mapUuid },
            ]"
            @click="handleSystemClick(item)"
          >
            {{
              item.mapShowname ||
              item.mapShowName ||
              item.name ||
              item.systemName ||
              '未命名系统'
            }}
          </t-menu-item>

          <!-- 更多系统下拉菜单 -->
          <t-dropdown v-if="moreSystems.length > 0" trigger="hover">
            <t-menu-item value="more" class="system-nav-item more-btn">
              更多
              <template #suffix>
                <chevron-down-icon />
              </template>
            </t-menu-item>
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item
                  v-for="item in moreSystems"
                  :key="item.mapUuid || item.id"
                  @click="handleSystemClick(item)"
                >
                  {{
                    item.mapShowname ||
                    item.mapShowName ||
                    item.name ||
                    item.systemName ||
                    '未命名系统'
                  }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </div>
      </template>

      <template #operations>
        <div class="operations-container">
          <!-- 搜索框 -->
          <!-- <search v-if="layout !== 'side'" :layout="layout" /> -->

          <!-- 全局通知 -->
          <!-- <notice /> -->

          <!-- 帮助 -->
          <!-- <t-tooltip placement="bottom" :content="$t('layout.header.help')">
            <t-button theme="default" shape="square" variant="text" @click="navToHelper">
              <t-icon name="help-circle" />
            </t-button>
          </t-tooltip> -->
          <!--  -->
          <t-dropdown trigger="click">
            <div class="icon-wrapper">
              <translate-icon />
            </div>
            <t-dropdown-menu>
              <t-dropdown-item
                v-for="(lang, index) in langList"
                :key="index"
                :value="lang.value"
                @click="changeLang"
                >{{ lang.content }}</t-dropdown-item
              ></t-dropdown-menu
            >
          </t-dropdown>
          <!-- 用户下拉菜单 -->
          <t-dropdown
            :min-column-width="150"
            trigger="click"
            placement="bottom-right"
            :popper-options="{
              modifiers: [{ name: 'offset', options: { offset: [-30, 0] } }],
            }"
          >
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item
                  class="operations-dropdown-container-item"
                  @click="handleNav('/user/index')"
                >
                  <user-circle-icon />{{ $t('layout.header.user') }}
                </t-dropdown-item>
                <t-dropdown-item
                  class="operations-dropdown-container-item"
                  @click="handleLogout"
                >
                  <poweroff-icon />{{ $t('layout.header.signOut') }}
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
            <div class="user-menu-wrapper">
              <t-icon class="header-user-avatar" name="user-circle" />
              <div class="header-user-account">
                Hello,{{ user.userInfo.nickName }}
              </div>
              <chevron-down-icon />
            </div>
          </t-dropdown>
          <!-- 设置 -->
          <!-- <t-tooltip placement="bottom" :content="$t('layout.header.setting')">
            <t-button theme="default" shape="square" variant="text" @click="toggleSettingPanel">
              <setting-icon />
            </t-button>
          </t-tooltip> -->
        </div>
      </template>
    </t-head-menu>
  </div>
</template>

<script setup lang="ts">
// SettingIcon
import {
  ChevronDownIcon,
  PoweroffIcon,
  TranslateIcon,
  UserCircleIcon,
} from 'tdesign-icons-vue-next'
import type { PropType } from 'vue'
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

import LogoFull from '@/assets/imgs/header/logo.png'
import { prefix } from '@/config/global'
import { langList } from '@/locales/index'
import { useLocale } from '@/locales/useLocale'
import { getActive } from '@/router'
import { useSettingStore, useUserStore, usePermissionStore } from '@/stores'
import type { MenuRoute } from '@/types/interface'

import MenuContent from './MenuContent.vue'
// import Notice from './Notice.vue';
import Search from './Search.vue'

const props = defineProps({
  theme: {
    type: String,
    default: 'light',
  },
  layout: {
    type: String,
    default: 'top',
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  menu: {
    type: Array as PropType<MenuRoute[]>,
    default: () => [],
  },
  isFixed: {
    type: Boolean,
    default: false,
  },
  isCompact: {
    type: Boolean,
    default: false,
  },
  maxLevel: {
    type: Number,
    default: 3,
  },
})

const router = useRouter()
const routeTitle = computed(() => router.currentRoute.value.meta.title || '')
const settingStore = useSettingStore()
const user = useUserStore()
const permissionStore = usePermissionStore()

// 系统导航相关
const MAX_VISIBLE_SYSTEMS = 8 // 最多显示8个系统，超出的放到"更多"下拉
const currentSystem = computed(() => permissionStore.currentSystem)
const visibleSystems = computed(() => {
  const systems = user.systemList || []
  console.log('[Header] visibleSystems:', systems.slice(0, MAX_VISIBLE_SYSTEMS))
  return systems.slice(0, MAX_VISIBLE_SYSTEMS)
})
const moreSystems = computed(() => {
  const systems = user.systemList || []
  return systems.slice(MAX_VISIBLE_SYSTEMS)
})

onMounted(() => {
  // 页面刷新后，如果有token则获取最新权限数据
  if (user.token) {
    user.fetchSystemPermissions()
  }
})

// 监听 token 变化（登录后），自动获取权限
watch(
  () => user.token,
  (newVal) => {
    if (newVal) {
      user.fetchSystemPermissions()
    }
  }
)

// const toggleSettingPanel = () => {
//   settingStore.updateConfig({
//     showSettingPanel: true,
//   });
// };

const active = computed(() => getActive())

const layoutCls = computed(() => [`${prefix}-header-layout`])

const menuCls = computed(() => {
  const { isFixed, layout, isCompact } = props
  return [
    {
      [`${prefix}-header-menu`]: !isFixed,
      [`${prefix}-header-menu-fixed`]: isFixed,
      [`${prefix}-header-menu-fixed-side`]: layout === 'side' && isFixed,
      [`${prefix}-header-menu-fixed-side-compact`]:
        layout === 'side' && isFixed && isCompact,
    },
  ]
})
const menuTheme = computed(() => props.theme as 'light' | 'dark')

// 切换语言
const { changeLocale } = useLocale()
const changeLang = ({ value: lang }: { value: string }) => {
  changeLocale(lang)
}

const changeCollapsed = () => {
  settingStore.updateConfig({
    isSidebarCompact: !settingStore.isSidebarCompact,
  })
}

const handleNav = (url: string) => {
  // Navigate to user settings or back to sub-app
  router.push(url)
}

const handleSystemClick = async (item: any) => {
  try {
    // Update current system to switch highlight state
    permissionStore.switchSystem(item)

    // Update iframe src
    const iframeSrc = item.mapUrl || '/'

    // Force trigger loading by clearing and resetting iframe src
    permissionStore.setIframeSrc('')
    await new Promise((resolve) => setTimeout(resolve, 10))
    permissionStore.setIframeSrc(iframeSrc)

    // Navigate to dashboard if not already there
    if (!router.currentRoute.value.path.startsWith('/dashboard')) {
      router.push('/dashboard')
    }
  } catch (e) {
    console.error(e)
  }
}

const handleLogout = async () => {
  // 调用 退出 登录接口
  try {
    await user.logout(true)
  } catch (e) {
    console.log(e)
  }
  // 如果当前已经是 /login，则不操作
  if (router.currentRoute.value.path === '/login') return
  router.push({
    path: '/login',
    query: { redirect: router.currentRoute.value.fullPath },
  })
}
</script>
<style lang="less" scoped>
.@{starter-prefix}-header {
  &-menu-fixed {
    position: fixed;
    top: 0;
    z-index: 1001;

    :deep(.t-head-menu__inner) {
      padding-right: var(--td-comp-margin-xl);
    }

    &-side {
      left: 232px;
      right: 0;
      z-index: 10;
      width: auto;
      transition: all 0.3s;

      &-compact {
        left: 64px;
      }
    }
  }

  &-logo-container {
    cursor: pointer;
    display: inline-flex;
  }
}

.header-menu {
  flex: 1 1 1;
  display: inline-flex;

  :deep(.t-menu__item) {
    min-width: unset;
  }
}

.operations-container {
  display: flex;
  align-items: center;

  .t-popup__reference {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // 图标包裹样式
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: var(--td-comp-margin-l);
    color: #ffffff;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.2s ease;

    :deep(.t-icon) {
      font-size: 20px;
      color: #ffffff;
      transition: color 0.2s ease;
    }

    // &:hover {
    // background-color: transparent !important;
    // }
  }

  // 用户菜单包裹样式
  .user-menu-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: var(--td-comp-margin-l);
    padding: 4px 12px;
    color: #ffffff;
    cursor: pointer;
    border-radius: 3px;
    transition: all 0.2s ease;

    .header-user-avatar {
      font-size: 20px;
      color: #ffffff;
    }

    .header-user-account {
      font-size: 14px;
      color: #ffffff;
    }

    :deep(.t-icon) {
      font-size: 16px;
      color: #ffffff;
    }

    // &:hover {
    // background-color: rgba(255, 255, 255, 0.12);
    // }
  }
}

.header-operate-left {
  display: flex;
  align-items: normal;
  line-height: 0;
  // padding-left: var(--td-comp-margin-xl);
  margin-left: 0;
}

.header-logo-container {
  width: auto;
  height: 26px;
  display: flex;
  margin-left: 24px;
  color: #ffffff;
  align-items: center;

  .t-logo {
    width: auto;
    height: 100%;
    margin-right: 8px;

    &:hover {
      cursor: pointer;
    }
  }

  .header-logo-text {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    color: #ffffff;
  }

  &:hover {
    cursor: pointer;
  }
}

.header-user-account {
  display: inline-flex;
  align-items: center;
  color: #ffffff;
}

:deep(.t-head-menu__inner) {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 64px;
  background-color: #202227;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

// Header 深色主题样式
:deep(.t-head-menu) {
  .t-button {
    color: #ffffff;

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
    }
  }

  .t-icon {
    color: #ffffff;
  }

  // 用户头像图标
  .header-user-avatar {
    color: #ffffff;
  }

  // 下拉箭头
  .t-icon-chevron-down {
    color: #ffffff;
  }
}

.t-menu--light {
  .header-user-account {
    color: #ffffff;
    font-weight: 400;
  }
}

.t-menu--dark {
  .t-head-menu__inner {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-user-account {
    color: #ffffff;
    font-weight: 400;
  }
}

.operations-dropdown-container-item {
  width: 100%;
  display: flex;
  align-items: center;

  :deep(.t-dropdown__item-text) {
    display: flex;
    align-items: center;
  }

  .t-icon {
    font-size: var(--td-comp-size-xxxs);
    margin-right: var(--td-comp-margin-s);
  }

  :deep(.t-dropdown__item) {
    width: 100%;
    margin-bottom: 0;
  }

  &:last-child {
    :deep(.t-dropdown__item) {
      margin-bottom: 8px;
    }
  }
}

// 系统导航样式
.header-system-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 24px;

  .system-nav-item {
    padding: 8px 16px;
    cursor: pointer;
    font-family: 'PingFang SC', sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
    color: #b6babe;
    border-radius: 3px;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      color: #ffffff;
      font-weight: 500;
      background-color: rgba(255, 255, 255, 0.12) !important;
    }

    &.active {
      color: #ffffff;
      font-weight: 500;
      background-color: rgba(255, 255, 255, 0.12) !important;
    }
  }

  .more-btn {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="less">
.operations-dropdown-container-item {
  .t-dropdown__item-text {
    display: flex;
    align-items: center;
  }
}
</style>
