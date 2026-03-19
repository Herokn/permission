# 权限系统快速开始

## 🚀 5分钟快速接入

### 第一步：在主应用顶部导航添加系统切换器

找到您的 [GlobalHeader.vue](../fe/src/components/GlobalHeader.vue) 或类似的头部组件：

```vue
<template>
  <div class="global-header">
    <div class="logo">Logo</div>

    <!-- 👇 添加系统切换器 -->
    <SystemSwitcher />

    <div class="user-info">
      <!-- 用户信息 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import SystemSwitcher from '@/components/SystemSwitcher.vue'
</script>
```

### 第二步：确认登录后自动获取系统列表

检查 [user store](../fe/src/stores/modules/user.ts) 的登录方法，确保已经调用 `fetchSystemPermissions()`：

```typescript
async login(loginParams: LoginParams) {
  const response = await Login(loginParams);
  // ... 登录逻辑

  // ✅ 已自动添加：获取系统列表
  await this.fetchSystemPermissions();

  return response;
}
```

### 第三步：在组件中使用权限控制

#### 方法一：使用指令（推荐）

```vue
<template>
  <!-- 有权限才显示按钮 -->
  <t-button v-permission="'user:add'">新增用户</t-button>

  <!-- 多个权限，满足一个即可 -->
  <t-button v-permission="['user:edit', 'user:delete']">编辑</t-button>
</template>
```

#### 方法二：使用 Hook

```vue
<script setup lang="ts">
import { usePermission } from '@/hooks/usePermission'

const { hasPermission, currentSystem } = usePermission()
</script>

<template>
  <div>
    <t-button v-if="hasPermission('user:add')">新增</t-button>
    <p>当前系统：{{ currentSystem?.mapShowname }}</p>
  </div>
</template>
```

---

## 🧪 测试和调试

### 浏览器控制台调试

项目已集成调试工具，在浏览器控制台输入：

```javascript
// 查看当前权限状态
$permission.status()

// 测试权限
$permission.test('user:add')

// 切换系统（索引从0开始）
$permission.switch(1)

// 刷新当前系统权限
$permission.refresh()

// 查看帮助
$permission.help()
```

### Mock 权限数据（开发调试）

```javascript
// 在控制台设置 Mock 数据
$permission.mock()

// 现在按钮权限包含：
// - user:add
// - user:edit
// - user:delete
// - role:add
// - role:edit
```

---

## 📡 子应用接入

### 方案一：通过 Garfish Props（推荐）

```typescript
// 子应用入口文件 main.ts
export function provider({ dom, basename }) {
  return {
    render({ props }) {
      const app = createApp(App)

      // 注入主应用提供的权限方法
      app.provide('$mainApp', props)

      app.mount(dom)
    },
  }
}
```

在子应用组件中使用：

```vue
<script setup lang="ts">
import { inject, computed } from 'vue'

const mainApp = inject('$mainApp')

// 检查权限
const canAdd = computed(() => {
  return mainApp.permission.hasPermission('user:add')
})

// 获取菜单
const menus = computed(() => mainApp.permission.menus)
</script>

<template>
  <t-button v-if="canAdd">新增</t-button>
</template>
```

### 方案二：监听权限更新事件

```typescript
// 子应用监听权限变化
window.addEventListener('garfish:permission', (event) => {
  const { system, permissions } = event.detail.data

  console.log('权限已更新:', system.mapShowname)
  console.log('菜单:', permissions.menus)
  console.log('按钮:', permissions.buttons)

  // 更新子应用内部状态
  updateLocalPermissions(permissions)
})
```

---

## 🔍 常见问题

### 1. 系统列表为空？

**原因**: 登录后未调用 `fetchSystemPermissions()`

**解决**:

```typescript
// 在登录成功后调用
await userStore.fetchSystemPermissions()
```

### 2. 切换系统后权限不生效？

**原因**: 子应用未监听权限更新事件

**解决**:

```typescript
// 子应用添加事件监听
window.addEventListener('garfish:permission', handlePermissionUpdate)
```

### 3. 权限接口报错？

**检查清单**:

- ✅ Token 是否有效
- ✅ 用户名是否正确
- ✅ fatherUuid 参数是否正确传递
- ✅ 网络代理配置是否正确

**调试方法**:

```javascript
// 查看当前状态
$permission.status()

// 查看缓存
$permission.export()
```

### 4. 如何清除权限缓存？

```javascript
// 方法一：控制台
$permission.clearCache()

// 方法二：代码
const permissionStore = usePermissionStore()
permissionStore.clearCache()
```

---

## ✅ 检查清单

上线前确认：

- [ ] 登录后能正常获取系统列表
- [ ] 系统切换器正常显示
- [ ] 点击系统能切换并加载权限
- [ ] 权限数据正确缓存
- [ ] 按钮权限指令正常工作
- [ ] 子应用能接收权限数据
- [ ] 子应用监听权限更新事件
- [ ] Token 过期后能正常处理
- [ ] 生产环境调试工具已禁用

---

## 📚 相关文档

- [完整设计方案](./permission-design.md)
- [API 接口文档](./permission-design.md#-接口说明)
- [架构设计图](./permission-design.md#-架构设计)

---

## 💡 最佳实践

### ✅ 推荐做法

1. **权限接口在主应用调用**
2. **使用内存缓存减少请求**
3. **通过 Garfish Props 传递权限**
4. **使用指令控制按钮显示**
5. **开发环境启用调试工具**

### ❌ 避免做法

1. ❌ 子应用直接调用权限接口
2. ❌ 使用全局变量传递权限（不稳定）
3. ❌ 频繁刷新权限数据
4. ❌ 在生产环境暴露调试工具
5. ❌ 硬编码权限判断逻辑

---

## 🆘 获取帮助

如果遇到问题：

1. 查看浏览器控制台输出
2. 使用 `$permission.status()` 检查状态
3. 查看 Network 面板的接口请求
4. 检查 Redux/Pinia DevTools 中的 store 状态
5. 参考 [完整设计文档](./permission-design.md)
