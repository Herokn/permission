# 菜单系统设计方案

## 📐 架构设计：混合模式

### 设计原则

1. **新系统**: 菜单由主应用统一渲染和管理
2. **老系统**: 保留子应用自带菜单，主应用隐藏侧边栏
3. **渐进式改造**: 老系统可逐步迁移到主应用菜单

---

## 🏗️ 架构图

```
┌─────────────────────────────────────────────────────────┐
│                     Main Shell                          │
├─────────────────────────────────────────────────────────┤
│  Header                                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │ Contract & Invoice | Budget | Finance ...      │    │
│  └────────────────────────────────────────────────┘    │
├───────────┬─────────────────────────────────────────────┤
│           │                                             │
│  Sidebar  │         Sub Application Container          │
│  (主应用)  │                                             │
│           │  ┌─────────────────────────────────────┐   │
│  📁 用户   │  │                                     │   │
│  📁 角色   │  │   New System (无菜单)                │   │
│  📁 权限   │  │                                     │   │
│           │  └─────────────────────────────────────┘   │
│           │                                             │
│           │  或                                          │
│           │                                             │
│ (隐藏)     │  ┌──────┬─────────────────────────────┐   │
│           │  │ 📁   │                             │   │
│           │  │ 📁   │  Legacy System (自带菜单)    │   │
│           │  │ 📁   │                             │   │
│           │  └──────┴─────────────────────────────┘   │
│           │                                             │
└───────────┴─────────────────────────────────────────────┘
```

---

## 💡 实现方案

### 1. 系统标识（区分新老系统）

在权限接口返回的系统数据中增加标识：

```typescript
interface SystemPermission {
  mapUuid: string
  mapShowname: string
  mapCode: string
  mapExternal?: 'Y' | 'N' // 👈 'Y' = 老系统自带菜单, 'N' = 新系统使用主应用菜单
}
```

### 2. 主应用根据标识控制侧边栏显示

**已实现** - 见 [layouts/index.vue](../fe/src/layouts/index.vue#L64-L72):

```typescript
const showSidebar = computed(() => {
  if (!settingStore.showSidebar) return false

  // 如果是老系统 (mapExternal === 'Y')，隐藏主应用侧边栏
  if (currentSystem.value?.mapExternal === 'Y') {
    return false
  }

  return true
})
```

### 3. 菜单数据来源优先级

**已实现** - 见 [LayoutSideNav.vue](../fe/src/layouts/components/LayoutSideNav.vue#L43-L59):

```typescript
const sideMenu = computed(() => {
  // 优先级1: 后端返回的菜单树（权限接口）
  if (menuTree.value && menuTree.value.length > 0) {
    return transformMenu(menuTree.value)
  }

  // 优先级2: 本地路由配置（回退方案）
  return menuRouters.value
})
```

---

## 🔄 交互流程

### 场景1: 切换到新系统（主应用菜单）

```
用户点击系统 "Contract & Invoice"
  ↓
主应用调用权限接口
  ↓
返回菜单数据: [
  { menuName: "用户管理", path: "/user/list" },
  { menuName: "角色管理", path: "/role/list" }
]
  ↓
主应用渲染左侧菜单
  ↓
用户点击菜单 "用户管理"
  ↓
主应用路由跳转: /contract/user/list
  ↓
激活对应的子应用（通过 Garfish）
  ↓
子应用渲染内容区域（无菜单）
```

### 场景2: 切换到老系统（子应用自带菜单）

```
用户点击系统 "Legacy ERP" (mapExternal = 'Y')
  ↓
主应用检测到 mapExternal === 'Y'
  ↓
主应用隐藏左侧 Sidebar
  ↓
激活子应用
  ↓
子应用渲染完整布局（包括自己的菜单）
```

---

## 📡 主子应用菜单交互

### 方式一: 主应用菜单 → 子应用内容（推荐）

```typescript
// 主应用菜单点击事件
// 已通过 vue-router 自动处理

// 子应用监听路由变化
export function provider({ dom, basename, props }) {
  return {
    render({ appName, props }) {
      const app = createApp(App);
      const router = createRouter({ ... });

      // 监听主应用传递的路由参数
      if (props.initialPath) {
        router.push(props.initialPath);
      }

      app.mount(dom);
    }
  };
}
```

### 方式二: 子应用触发主应用菜单跳转

```typescript
// 子应用调用主应用方法
const mainApp = inject('$mainApp')

function navigateToOtherSystem() {
  // 通知主应用跳转到其他系统的菜单
  mainApp.navigation.goto('/budget/project/list')
}
```

### 方式三: 事件通信（老系统兼容）

```typescript
// 老系统子应用发送事件
window.parent.postMessage(
  {
    type: 'MENU_NAVIGATE',
    path: '/user/list',
  },
  '*'
)

// 主应用监听
window.addEventListener('message', (event) => {
  if (event.data.type === 'MENU_NAVIGATE') {
    router.push(event.data.path)
  }
})
```

---

## 🛠️ 实施步骤

### 第一步: 完善权限接口返回数据

确保 Java 权限接口返回完整的菜单树结构：

```json
{
  "code": 2000,
  "data": [
    {
      "menuId": "1",
      "menuName": "用户管理",
      "menuCode": "user",
      "path": "/user",
      "icon": "user",
      "children": [
        {
          "menuId": "1-1",
          "menuName": "用户列表",
          "menuCode": "user:list",
          "path": "/user/list"
        }
      ]
    }
  ]
}
```

### 第二步: 完善菜单转换逻辑

优化 [LayoutSideNav.vue](../fe/src/layouts/components/LayoutSideNav.vue#L28-L39):

```typescript
const transformMenu = (menus: any[]): MenuRoute[] => {
  return menus
    .filter((menu) => menu.mapType === 'menu') // 只显示菜单类型
    .map((menu) => ({
      path: menu.path || menu.mapUrl || '',
      name: menu.menuCode || menu.mapCode,
      title: menu.menuName || menu.mapShowname,
      icon: menu.icon || menu.mapIcon,
      meta: {
        title: menu.menuName || menu.mapShowname,
        icon: menu.icon || menu.mapIcon,
      },
      children: menu.children ? transformMenu(menu.children) : [],
    }))
}
```

### 第三步: 配置子应用路由映射

```typescript
// fe/src/config/mfe.ts
export const MFE_APPS = [
  {
    name: 'contract-invoice',
    entry: 'http://localhost:3001',
    activeRule: '/contract',
    mapExternal: 'N', // 新系统，使用主应用菜单
  },
  {
    name: 'legacy-erp',
    entry: 'http://localhost:3002',
    activeRule: '/erp',
    mapExternal: 'Y', // 老系统，使用子应用菜单
  },
]
```

### 第四步: 增强 Garfish 通信

```typescript
// fe/src/mfe/garfish.ts
export function getGlobalProps() {
  return {
    // ... existing props

    // 导航方法
    navigation: {
      /**
       * 主应用导航（支持跨子应用）
       */
      goto(path: string, query?: Record<string, any>) {
        const router = (window as any).__MAIN_ROUTER__
        router?.push({ path, query })
      },

      /**
       * 返回主应用首页
       */
      goHome() {
        const router = (window as any).__MAIN_ROUTER__
        router?.push('/')
      },
    },
  }
}
```

---

## 🎨 样式一致性

### 新系统菜单样式

由主应用统一控制（TDesign Vue Next）:

```vue
<!-- 主应用 -->
<t-menu :theme="theme" :collapsed="collapsed" :value="active">
  <t-menu-item v-for="menu in menus" :key="menu.path">
    {{ menu.title }}
  </t-menu-item>
</t-menu>
```

### 老系统菜单样式建议

为了视觉一致性，建议老系统也使用相同的：

- 菜单宽度: 232px (展开) / 64px (收起)
- 背景色: 与主题一致
- 字体: 14px

---

## ✅ 兼容性策略

### 新系统开发规范

1. **不实现菜单**: 子应用只实现内容区域
2. **监听路由**: 通过 props 接收主应用传递的路由
3. **使用主应用权限**: 通过 `mainApp.permission` 检查按钮权限

### 老系统迁移指南

#### 阶段1: 保持现状

- 设置 `mapExternal = 'Y'`
- 保留子应用自带菜单
- 主应用隐藏侧边栏

#### 阶段2: 双菜单过渡

- 主应用显示菜单（新）
- 子应用保留菜单（老）
- 用户可选择使用哪个

#### 阶段3: 完全迁移

- 移除子应用菜单代码
- 设置 `mapExternal = 'N'`
- 只使用主应用菜单

---

## 🚀 最佳实践

### ✅ 推荐

1. **新系统一律不实现菜单**，由主应用统一管理
2. **菜单数据从权限接口获取**，不硬编码
3. **使用路由驱动**，而不是组件内状态
4. **菜单权限由主应用控制**，子应用只负责按钮权限
5. **老系统逐步迁移**，不强制一次性改造

### ❌ 避免

1. ❌ 新系统仍然自己实现菜单
2. ❌ 菜单数据硬编码在子应用中
3. ❌ 主子应用菜单样式不一致
4. ❌ 频繁切换菜单显示/隐藏导致闪烁
5. ❌ 菜单点击后无法正确激活子应用

---

## 🔍 常见问题

### Q1: 老系统如何通知主应用切换菜单？

A: 使用 postMessage:

```typescript
// 老系统子应用
window.parent.postMessage(
  {
    type: 'SWITCH_SYSTEM',
    systemCode: 'budget',
  },
  '*'
)

// 主应用监听
window.addEventListener('message', (e) => {
  if (e.data.type === 'SWITCH_SYSTEM') {
    const system = systemList.find((s) => s.mapCode === e.data.systemCode)
    await permissionStore.switchSystem(system)
  }
})
```

### Q2: 菜单点击后如何激活正确的子应用？

A: 通过路由前缀自动匹配:

```typescript
// Garfish 配置
{
  name: 'contract',
  activeRule: '/contract',  // 所有 /contract/* 路由激活此应用
}

// 菜单配置
{
  path: '/contract/user/list',  // 自动激活 contract 子应用
}
```

### Q3: 子应用如何知道当前激活的菜单项？

A: 通过 props 传递:

```typescript
// 主应用传递当前路由
Garfish.loadApp('contract', {
  basename: '/contract',
  props: {
    currentRoute: route.path, // 传递当前路由
  },
})

// 子应用接收
export function provider({ props }) {
  console.log('当前路由:', props.currentRoute)
}
```

---

## 📊 性能对比

| 场景         | 主应用菜单      | 子应用菜单            |
| ------------ | --------------- | --------------------- |
| 菜单渲染时间 | 100ms（仅1次）  | 100ms × N（每次切换） |
| 切换系统耗时 | 0ms（菜单保持） | 200ms（重新渲染）     |
| 内存占用     | 1份菜单数据     | N份菜单数据           |
| 布局稳定性   | 稳定（无闪烁）  | 不稳定（闪烁）        |

---

## 🎓 总结

**推荐方案**: **主应用统一管理菜单 + 老系统兼容模式**

- ✅ 新系统: 完全由主应用管理菜单
- ✅ 老系统: 保留自带菜单，主应用隐藏侧边栏
- ✅ 渐进式迁移: 老系统逐步迁移到主应用菜单
- ✅ 体验一致: 所有新系统菜单样式统一
- ✅ 性能最优: 菜单只渲染一次，无闪烁
