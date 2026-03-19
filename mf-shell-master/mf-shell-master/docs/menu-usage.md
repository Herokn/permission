# 菜单系统使用指南

## 🚀 快速开始

### 主应用 - 配置菜单

菜单会根据权限接口自动显示，无需手动配置。只需确保：

1. **登录后获取系统列表**（已实现）
2. **切换系统时加载菜单权限**（已实现）
3. **侧边栏自动渲染菜单**（已实现）

---

## 📝 使用场景

### 场景1: 新系统（无菜单）

新开发的子应用**不需要实现菜单**，完全由主应用管理。

```typescript
// 子应用入口 main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'

let app: any

export function provider({ dom, basename, props }) {
  return {
    render({ appName, props }) {
      app = createApp(App)

      // 1. 创建子应用路由
      const router = createRouter({
        history: createWebHistory(basename),
        routes: [
          { path: '/user/list', component: UserList },
          { path: '/role/list', component: RoleList },
        ],
      })

      // 2. 注入主应用提供的方法
      app.provide('$mainApp', props)

      // 3. 监听主应用路由变化（可选）
      if (props.currentRoute) {
        router.push(props.currentRoute)
      }

      app.use(router)
      app.mount(dom)
    },

    destroy() {
      app?.unmount()
    },
  }
}
```

**子应用组件**:

```vue
<template>
  <div class="user-list">
    <!-- 只需要实现内容区域，无需菜单 -->
    <h1>用户列表</h1>
    <t-button @click="goToRole">跳转到角色管理</t-button>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

const mainApp = inject('$mainApp')

// 使用主应用导航
function goToRole() {
  mainApp.navigation.goto('/contract/role/list')
}
</script>
```

---

### 场景2: 老系统（自带菜单）

老系统保留自己的菜单，主应用自动隐藏侧边栏。

#### 第一步：标记老系统

在权限接口返回的系统数据中设置：

```json
{
  "mapUuid": "xxx",
  "mapShowname": "Legacy ERP",
  "mapExternal": "Y" // 👈 标记为外部系统
}
```

#### 第二步：老系统布局

```vue
<!-- 老系统 Layout.vue -->
<template>
  <div class="legacy-layout">
    <!-- 老系统自带的侧边栏 -->
    <aside class="legacy-sidebar">
      <ul class="legacy-menu">
        <li @click="navigate('/user')">用户管理</li>
        <li @click="navigate('/role')">角色管理</li>
      </ul>
    </aside>

    <!-- 内容区域 -->
    <main class="legacy-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function navigate(path: string) {
  router.push(path)
}
</script>
```

#### 第三步：老系统调用主应用导航（可选）

```typescript
// 老系统需要跳转到其他系统时
import { SubAppNavigator } from './utils/sub-app-navigator'

// 跳转到主应用路由
SubAppNavigator.navigateTo('/contract/user/list')

// 切换系统
SubAppNavigator.switchSystem('budget')

// 返回首页
SubAppNavigator.goHome()
```

---

### 场景3: 老系统迁移到主应用菜单

#### 阶段1: 双菜单模式（过渡期）

```vue
<!-- 老系统可以选择显示自己的菜单或使用主应用菜单 -->
<template>
  <div class="layout">
    <!-- 开关：是否使用主应用菜单 -->
    <t-switch v-model="useMainMenu" @change="handleMenuSwitch"> 使用新版菜单 </t-switch>

    <!-- 老菜单 -->
    <aside v-if="!useMainMenu" class="legacy-sidebar">
      <!-- ... -->
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const useMainMenu = ref(false)

function handleMenuSwitch(value: boolean) {
  if (value) {
    // 通知主应用显示菜单
    window.parent.postMessage(
      {
        type: 'ENABLE_MAIN_MENU',
        data: { systemCode: 'legacy-erp' },
      },
      '*'
    )
  } else {
    // 通知主应用隐藏菜单
    window.parent.postMessage(
      {
        type: 'DISABLE_MAIN_MENU',
      },
      '*'
    )
  }
}
</script>
```

#### 阶段2: 完全迁移

1. 移除子应用菜单代码
2. 修改权限接口返回：`mapExternal: 'N'`
3. 子应用只保留内容区域

---

## 🔄 主子应用交互

### 子应用 → 主应用

```typescript
// 方式1: 通过 Garfish Props（推荐）
const mainApp = inject('$mainApp')

// 跳转到主应用路由
mainApp.navigation.goto('/user/list')

// 跨系统跳转
mainApp.navigation.navigateToSystem('budget', '/project/list')

// 切换系统
mainApp.navigation.switchSystem('finance')

// 返回首页
mainApp.navigation.goHome()
```

```typescript
// 方式2: 通过 postMessage（兼容老系统）
import { SubAppNavigator } from '@/utils/sub-app-navigator'

SubAppNavigator.navigateTo('/user/list')
SubAppNavigator.switchSystem('budget')
SubAppNavigator.goHome()
```

### 主应用 → 子应用

```typescript
// 主应用监听子应用消息（已自动配置）
// 子应用发送消息后，主应用会自动处理

// 主应用主动通知子应用
window.dispatchEvent(
  new CustomEvent('main-app:route-change', {
    detail: { path: '/user/list' },
  })
)
```

---

## 📋 菜单配置示例

### 后端返回的菜单数据格式

```json
{
  "code": 2000,
  "message": "操作成功",
  "data": [
    {
      "menuId": "1",
      "menuName": "用户管理",
      "menuCode": "user",
      "path": "/user",
      "icon": "user",
      "mapType": "menu",
      "children": [
        {
          "menuId": "1-1",
          "menuName": "用户列表",
          "menuCode": "user:list",
          "path": "/user/list",
          "icon": "view-list",
          "mapType": "menu"
        },
        {
          "menuId": "1-2",
          "menuName": "角色管理",
          "menuCode": "user:role",
          "path": "/user/role",
          "mapType": "menu"
        }
      ]
    },
    {
      "menuId": "2",
      "menuName": "系统设置",
      "menuCode": "system",
      "path": "/system",
      "icon": "setting",
      "mapType": "menu",
      "children": []
    }
  ]
}
```

### 菜单权限控制

菜单项的显示由后端权限接口控制，前端自动渲染。如果用户没有某个菜单的权限，后端不会返回该菜单项。

---

## 🎨 菜单样式定制

### 主应用菜单样式

主应用使用 TDesign 组件，可以通过以下方式定制：

```vue
<!-- fe/src/layouts/components/SideNav.vue -->
<template>
  <t-menu :theme="theme" :collapsed="collapsed" :value="active" :default-expanded="defaultExpanded">
    <!-- 菜单项 -->
  </t-menu>
</template>

<style scoped lang="less">
// 自定义菜单样式
.t-menu {
  width: 232px; // 展开宽度

  &.t-menu--collapsed {
    width: 64px; // 收起宽度
  }
}
</style>
```

### 老系统菜单样式建议

为了视觉一致性，建议老系统菜单样式与主应用保持一致：

```css
.legacy-sidebar {
  width: 232px;
  background-color: var(--td-bg-color-container);
  border-right: 1px solid var(--td-border-level-1-color);
}

.legacy-menu-item {
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  font-size: 14px;
  color: var(--td-text-color-primary);
  cursor: pointer;

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  &.active {
    background-color: var(--td-brand-color-light);
    color: var(--td-brand-color);
  }
}
```

---

## 🐛 调试和测试

### 浏览器控制台调试

```javascript
// 查看当前菜单数据
$permission.status()

// 查看菜单树
console.log($permission.menus)

// 模拟菜单点击
mainApp.navigation.goto('/user/list')
```

### 测试老系统兼容性

```javascript
// 测试 postMessage 通信
window.parent.postMessage(
  {
    type: 'NAVIGATE_TO',
    data: { path: '/user/list' },
  },
  '*'
)

// 检查主应用是否正确隐藏侧边栏
// 1. 切换到老系统
// 2. 观察主应用侧边栏是否隐藏
// 3. 切换到新系统
// 4. 观察主应用侧边栏是否显示
```

---

## ⚠️ 注意事项

### 新系统开发规范

1. ✅ **不要实现菜单组件**
2. ✅ **使用主应用提供的导航方法**
3. ✅ **只实现业务内容区域**
4. ✅ **通过 props 接收主应用数据**

### 老系统迁移建议

1. ⚠️ **先设置 mapExternal='Y' 保持现状**
2. ⚠️ **逐步迁移菜单配置到后端权限接口**
3. ⚠️ **测试双菜单模式**
4. ⚠️ **最后移除子应用菜单代码**

### 路由配置

1. ✅ 新系统路由以系统编码为前缀: `/contract/user/list`
2. ✅ 菜单路径需要包含系统前缀
3. ✅ 子应用内部路由可以是相对路径

### 性能优化

1. ✅ 菜单数据自动缓存，无需手动管理
2. ✅ 切换系统时优先使用缓存
3. ✅ 菜单渲染使用虚拟滚动（如果菜单项很多）

---

## 🎓 最佳实践

### ✅ 推荐

1. **新系统一律不实现菜单**
2. **菜单权限由后端控制**
3. **使用主应用导航方法进行跳转**
4. **老系统逐步迁移，不强制一次性改造**
5. **菜单样式与主应用保持一致**

### ❌ 避免

1. ❌ 新系统实现自己的菜单
2. ❌ 硬编码菜单数据
3. ❌ 使用 `window.location.href` 跳转
4. ❌ 忽略老系统的兼容性
5. ❌ 菜单样式与主应用差异过大

---

## 📞 常见问题

### Q1: 菜单点击后子应用没有激活？

**原因**: 路由前缀配置不正确

**解决**:

```typescript
// Garfish 配置
{
  name: 'contract',
  activeRule: '/contract',  // 确保与菜单路径前缀一致
}

// 菜单路径
path: '/contract/user/list',  // 以 /contract 开头
```

### Q2: 老系统菜单和主应用菜单同时显示？

**原因**: 未正确设置 `mapExternal` 标识

**解决**:

```json
{
  "mapUuid": "xxx",
  "mapExternal": "Y" // 设置为 'Y'
}
```

### Q3: 子应用如何知道当前菜单项？

**方案**: 通过路由匹配

```typescript
const mainApp = inject('$mainApp')
const route = useRoute()

const currentMenu = computed(() => {
  return mainApp.permission.menus.find((menu) => route.path.startsWith(menu.path))
})
```

### Q4: 如何实现菜单收起/展开？

**已实现** - 使用主应用的 Setting Store:

```typescript
import { useSettingStore } from '@/stores'

const settingStore = useSettingStore()

// 切换菜单收起状态
settingStore.toggleSidebarCompact()
```

---

## 🔗 相关文档

- [权限系统设计](./permission-design.md)
- [菜单系统架构](./menu-design.md)
- [微前端通信](./garfish-communication.md)
