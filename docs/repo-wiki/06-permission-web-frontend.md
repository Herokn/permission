# permission-web-frontend 模块分析

## 模块概述
前端 Web 应用，基于 React + TypeScript + Ant Design 构建。提供权限中心管理界面和用户中心管理界面。

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| React Router | 6.x | 路由管理 |
| Vite | 5.x | 构建工具 |
| Axios | - | HTTP 请求 |

---

## 目录结构

```
permission-web-frontend/
└── src/
    ├── components/         # 公共组件
    │   ├── ErrorBoundary.tsx
    │   └── ProtectedRoute.tsx
    ├── hooks/              # 自定义 Hooks
    │   └── useAuth.ts
    ├── layouts/            # 布局组件
    │   └── MainLayout.tsx
    ├── pages/              # 页面组件
    │   ├── user-center/
    │   │   ├── OrganizationPage.tsx
    │   │   ├── PositionPage.tsx
    │   │   └── UserCenterUserPage.tsx
    │   ├── AuthzTestPage.tsx
    │   ├── LoginPage.tsx
    │   ├── PermissionPage.tsx
    │   ├── ProjectPage.tsx
    │   ├── RolePage.tsx
    │   └── UserGrantPage.tsx
    ├── services/           # API 服务
    │   └── api.ts
    ├── types/              # 类型定义
    │   └── index.ts
    ├── utils/              # 工具函数
    │   └── request.ts
    ├── App.tsx             # 根组件
    └── main.tsx            # 入口文件
```

---

## 路由配置

### 路由结构
| 路径 | 组件 | 权限要求 |
|------|------|----------|
| /login | LoginPage | 无 |
| /user-center/users | UserCenterUserPage | 登录即可 |
| /user-center/organizations | OrganizationPage | 登录即可 |
| /user-center/positions | PositionPage | 登录即可 |
| /permission-center/projects | ProjectPage | PERMISSION_CENTER_PROJECT_VIEW |
| /permission-center/permissions | PermissionPage | PERMISSION_CENTER_PERMISSION_VIEW |
| /permission-center/roles | RolePage | ROLE_VIEW |
| /permission-center/user-grants | UserGrantPage | USER_AUTH_VIEW |

### 路由守卫
- **ProtectedRoute**: 检查登录状态和可选权限
- **LoginEntry**: 处理登录页面逻辑

---

## API 服务

### 认证相关
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| login | POST | /api/auth/login | 登录 |
| logout | POST | /api/auth/logout | 登出 |
| refreshToken | POST | /api/auth/refresh | 刷新 Token |
| getCurrentUser | GET | /api/auth/current-user | 获取当前用户 |

### 权限点管理
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| listPermissions | GET | /api/permissions | 分页查询 |
| getPermission | GET | /api/permissions/:id | 查询详情 |
| createPermission | POST | /api/permissions | 创建 |
| updatePermission | POST | /api/permissions/:id/update | 更新 |
| deletePermission | POST | /api/permissions/:id/delete | 删除 |
| listAllPermissions | GET | /api/permissions/all | 查询所有 |

### 角色管理
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| listRoles | GET | /api/roles | 分页查询 |
| listAllRoles | GET | /api/roles/all | 查询所有 |
| getRole | GET | /api/roles/:id | 查询详情 |
| createRole | POST | /api/roles | 创建 |
| updateRole | POST | /api/roles/:id/update | 更新 |
| deleteRole | POST | /api/roles/:id/delete | 删除 |
| grantPermissionsToRole | POST | /api/roles/:id/permissions | 分配权限 |

### 用户授权
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| getUserAuthDetail | GET | /api/user-auth/:userId | 查询授权详情 |
| assignUserRole | POST | /api/user-auth/roles/assign | 分配角色 |
| revokeUserRole | POST | /api/user-auth/roles/revoke | 移除角色 |
| grantUserPermission | POST | /api/user-auth/permissions/grant | 授予权限 |
| revokeUserPermission | POST | /api/user-auth/permissions/revoke | 移除权限 |
| batchAssignUserRole | POST | /api/user-auth/roles/batch-assign | 批量分配角色 |
| batchRevokeUserRole | POST | /api/user-auth/roles/batch-revoke | 批量移除角色 |
| batchGrantUserPermission | POST | /api/user-auth/permissions/batch-grant | 批量授予权限 |
| batchRevokeUserPermission | POST | /api/user-auth/permissions/batch-revoke | 批量移除权限 |

### 统一鉴权
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| checkPermission | POST | /api/authz/check | 单次鉴权 |
| batchCheckPermissions | POST | /api/authz/check-batch | 批量鉴权 |

### 项目管理
| 函数 | 方法 | 路径 | 说明 |
|------|------|------|------|
| listProjects | GET | /api/projects | 分页查询 |
| listAllProjects | GET | /api/projects/all | 查询所有 |
| createProject | POST | /api/projects | 创建 |
| updateProject | POST | /api/projects/:id/update | 更新 |
| deleteProject | POST | /api/projects/:id/delete | 删除 |

---

## 类型定义

### 通用类型
```typescript
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageRequest {
  pageNum?: number;
  pageSize?: number;
}

interface PageResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}
```

### 用户相关
```typescript
interface LoginRequest {
  userName: string;
  password: string;
}

interface UserInfo {
  userId: string;
  userName: string;
  loginType?: string;
  permissions?: string[];
  admin?: boolean;
  modules?: string[];
}
```

### 权限点相关
```typescript
interface Permission {
  id: number;
  code: string;
  name: string;
  systemCode: string;
  projectId?: string;
  type: string;
  parentCode?: string;
  sortOrder?: number;
  status: string;
  description?: string;
}

interface PermissionRequest {
  code: string;
  name: string;
  systemCode: string;
  projectId?: string;
  type: string;
  parentCode?: string;
  sortOrder?: number;
  description?: string;
}
```

### 角色相关
```typescript
interface Role {
  id: number;
  code: string;
  name: string;
  roleScope?: string;
  roleDomain?: string;
  projectId?: string;
  status: string;
  description?: string;
  permissionCodes?: string[];
}

interface RoleRequest {
  code: string;
  name: string;
  roleScope?: string;
  roleDomain?: string;
  projectId?: string;
  description?: string;
}
```

---

## 自定义 Hooks

### useAuth
认证状态管理 Hook

**返回值**:
| 属性 | 类型 | 说明 |
|------|------|------|
| user | UserInfo \| null | 当前用户 |
| isAuthenticated | boolean | 是否已认证 |
| loading | boolean | 加载中 |
| login | (data: LoginRequest) => Promise<void> | 登录 |
| logout | () => Promise<void> | 登出 |
| fetchUser | () => Promise<void> | 获取用户信息 |

---

## 组件

### ProtectedRoute
路由保护组件

**Props**:
| 属性 | 类型 | 说明 |
|------|------|------|
| children | ReactNode | 子组件 |
| requiredPermission | string | 可选权限编码 |

**功能**:
1. 检查用户是否已登录
2. 验证 Token 有效性
3. 检查是否拥有所需权限
4. 无权限时显示 403 页面

### MainLayout
主布局组件

**功能**:
1. 顶部导航栏（用户菜单）
2. 左侧菜单（功能模块）
3. Tab 切换（用户中心/权限中心）
4. 子页面内容区

**菜单结构**:
```
├── 用户中心
│   ├── 用户管理
│   ├── 组织管理
│   └── 岗位管理
└── 权限中心
    ├── 项目管理
    ├── 权限点管理
    ├── 角色管理
    └── 用户授权
```

### ErrorBoundary
错误边界组件

**功能**: 捕获子组件渲染错误，显示友好错误页面

---

## 页面组件

### LoginPage
登录页面

### PermissionPage
权限点管理页面
- 权限树展示
- 新增/编辑/删除权限点

### RolePage
角色管理页面
- 角色列表
- 新增/编辑/删除角色
- 角色权限分配

### ProjectPage
项目管理页面
- 项目列表
- 新增/编辑/删除项目

### UserGrantPage
用户授权页面
- 用户搜索
- 角色分配
- 权限授予/排除

### OrganizationPage
组织管理页面
- 组织树展示
- 新增/编辑/删除组织

### UserCenterUserPage
用户管理页面
- 用户列表
- 新增/编辑/删除/启用/禁用用户

### PositionPage
岗位管理页面

### AuthzTestPage
鉴权测试页面
- 单权限鉴权测试
- 批量鉴权测试

---

## 认证流程

```
┌──────────────────────────────────────────────────────────────┐
│                      用户访问页面                             │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   ProtectedRoute 检查                        │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. 检查 localStorage 是否有用户信息                     │  │
│  │ 2. 调用 /auth/current-user 验证 Token                  │  │
│  │ 3. 检查 requiredPermission（如有）                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      未登录            无权限             已授权
          │                │                │
          ▼                ▼                ▼
    跳转 /login      显示 403          渲染页面
```

---

## 事件机制

### auth:token-changed
Token 变更事件，用于跨组件同步认证状态

**触发时机**:
- 登录成功
- 登出
- Token 失效

---

## 技术特点

1. **权限路由**: 支持页面级权限控制
2. **Token 双模式**: 支持 Cookie 和 Header 两种 Token 传递
3. **事件驱动**: 使用自定义事件同步认证状态
4. **TypeScript 类型安全**: 完整的类型定义
5. **Ant Design UI**: 统一的 UI 风格
6. **响应式布局**: 支持侧边栏折叠

---

## 待改进点

1. PositionPage 功能待完善
2. 缺少全局 Loading 状态
3. 缺少错误重试机制
4. 缺少国际化支持
