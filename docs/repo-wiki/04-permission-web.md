# permission-web 模块分析

## 模块概述
Web 控制层，提供 RESTful API 接口。包含 9 个 Controller，处理 HTTP 请求，调用 Manager 层服务，返回统一格式的响应。

---

## Controller 接口列表

### 1. AuthzController - 统一鉴权
**路径**: `/authz`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| check | POST | /check | 无(自身) | 单权限鉴权 |
| checkBatch | POST | /check-batch | 无(自身) | 批量鉴权 |

**权限限制**: 只能查询当前登录用户自身的权限，超级管理员可查询任意用户

---

### 2. LoginController - 登录认证
**路径**: `/auth`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| login | POST | /login | 无 | 账号密码登录 |
| ssoLogin | POST | /sso-login | 无 | SSO 登录 |
| logout | POST | /logout | 无 | 登出 |
| refresh | POST | /refresh | 无 | 刷新 Token |
| getCurrentUser | GET | /current-user | 无 | 获取当前用户信息 |
| getPermissions | GET | /permissions | 无 | 获取当前用户权限 |

**Token 机制**:
- 登录成功后设置 Cookie: access_token, refresh_token
- 支持从 Header(Authorization: Bearer xxx) 或 Cookie 读取 Token

---

### 3. PermissionController - 权限点管理
**路径**: `/permissions`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| create | POST | / | PERMISSION_CENTER_PERMISSION_CREATE | 新增权限点 |
| update | POST | /{id}/update | PERMISSION_CENTER_PERMISSION_EDIT | 编辑权限点 |
| delete | POST | /{id}/delete | PERMISSION_CENTER_PERMISSION_DELETE | 删除权限点 |
| list | GET | / | PERMISSION_CENTER_PERMISSION_VIEW | 分页查询 |
| tree | GET | /tree | PERMISSION_CENTER_PERMISSION_VIEW | 查询权限树 |
| listAll | GET | /all | PERMISSION_CENTER_PERMISSION_VIEW | 查询所有(下拉用) |

**项目隔离**: 传 projectId 参数时使用项目隔离查询

---

### 4. RoleController - 角色管理
**路径**: `/roles`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| create | POST | / | ROLE_CREATE | 新增角色 |
| update | POST | /{id}/update | ROLE_UPDATE | 编辑角色 |
| delete | POST | /{id}/delete | ROLE_DELETE | 删除角色 |
| list | GET | / | ROLE_VIEW | 分页查询 |
| detail | GET | /{id} | ROLE_VIEW | 查询详情(含权限) |
| assignPermissions | POST | /{id}/permissions | ROLE_PERMISSION_ASSIGN | 分配权限 |
| listAll | GET | /all | ROLE_VIEW | 查询所有(下拉用) |

---

### 5. ProjectController - 项目管理
**路径**: `/projects`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| create | POST | / | PERMISSION_CENTER_PROJECT_CREATE | 新增项目 |
| update | POST | /{id}/update | PERMISSION_CENTER_PROJECT_EDIT | 更新项目 |
| delete | POST | /{id}/delete | PERMISSION_CENTER_PROJECT_DELETE | 删除项目 |
| list | GET | / | PERMISSION_CENTER_PROJECT_VIEW | 分页查询 |
| listAll | GET | /all | PERMISSION_CENTER_PROJECT_VIEW | 查询所有启用项目 |

---

### 6. UserController - 用户管理
**路径**: `/users`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| listUsers | GET | / | USER_CENTER_USER_VIEW | 分页查询 |
| getUserDetail | GET | /{userId} | USER_CENTER_USER_VIEW | 查询详情 |
| createUser | POST | / | USER_CENTER_USER_CREATE | 创建用户 |
| updateUser | PUT | /{userId} | USER_CENTER_USER_EDIT | 更新用户 |
| enableUser | POST | /{userId}/enable | USER_CENTER_USER_ENABLE | 启用用户 |
| disableUser | POST | /{userId}/disable | USER_CENTER_USER_ENABLE | 禁用用户 |
| deleteUser | DELETE | /{userId} | USER_CENTER_USER_DELETE | 删除用户 |
| resetPassword | POST | /{userId}/reset-password | USER_CENTER_USER_RESET_PWD | 重置密码 |

---

### 7. OrganizationController - 组织管理
**路径**: `/organizations`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| create | POST | / | USER_CENTER_ORG_MANAGE | 创建组织 |
| update | PUT | /{id} | USER_CENTER_ORG_MANAGE | 编辑组织 |
| delete | DELETE | /{id} | USER_CENTER_ORG_MANAGE | 删除组织 |
| detail | GET | /{id} | USER_CENTER_ORG_VIEW | 查询详情 |
| tree | GET | /tree | USER_CENTER_ORG_VIEW | 查询组织树 |
| assignRoles | POST | /{orgId}/roles | USER_CENTER_ORG_MANAGE | 分配角色 |
| removeRole | DELETE | /{orgId}/roles/{roleId} | USER_CENTER_ORG_MANAGE | 移除角色 |
| listRoles | GET | /{orgId}/roles | USER_CENTER_ORG_VIEW | 查询角色列表 |
| addMembers | POST | /{orgId}/members | USER_CENTER_ORG_MANAGE | 加入成员 |
| removeMember | DELETE | /{orgId}/members/{userId} | USER_CENTER_ORG_MANAGE | 移除成员 |
| listMembers | GET | /{orgId}/members | USER_CENTER_ORG_VIEW | 查询成员列表 |

---

### 8. UserAuthController - 用户授权
**路径**: `/user-auth`

| 方法 | HTTP | 路径 | 权限码 | 说明 |
|------|------|------|--------|------|
| assignRole | POST | /roles/assign | USER_AUTH_MANAGE | 分配角色 |
| batchAssignRole | POST | /roles/batch-assign | USER_AUTH_MANAGE | 批量分配角色 |
| batchRevokeRole | POST | /roles/batch-revoke | USER_AUTH_MANAGE | 批量移除角色 |
| revokeRole | POST | /roles/revoke | USER_AUTH_MANAGE | 移除角色 |
| grantPermission | POST | /permissions/grant | USER_AUTH_MANAGE | 授予/排除权限 |
| batchGrantPermission | POST | /permissions/batch-grant | USER_AUTH_MANAGE | 批量授予权限 |
| batchRevokePermission | POST | /permissions/batch-revoke | USER_AUTH_MANAGE | 批量移除权限 |
| revokePermission | POST | /permissions/revoke | USER_AUTH_MANAGE | 移除权限 |
| detail | GET | /{userId} | USER_AUTH_VIEW | 查询授权详情 |

---

### 9. PositionController - 岗位管理
**路径**: `/positions`

*待分析具体接口*

---

## API 权限码汇总

### 权限中心模块
| 权限码 | 说明 |
|--------|------|
| PERMISSION_CENTER_PERMISSION_CREATE | 创建权限点 |
| PERMISSION_CENTER_PERMISSION_EDIT | 编辑权限点 |
| PERMISSION_CENTER_PERMISSION_DELETE | 删除权限点 |
| PERMISSION_CENTER_PERMISSION_VIEW | 查看权限点 |
| PERMISSION_CENTER_PROJECT_CREATE | 创建项目 |
| PERMISSION_CENTER_PROJECT_EDIT | 编辑项目 |
| PERMISSION_CENTER_PROJECT_DELETE | 删除项目 |
| PERMISSION_CENTER_PROJECT_VIEW | 查看项目 |

### 用户中心模块
| 权限码 | 说明 |
|--------|------|
| USER_CENTER_USER_VIEW | 查看用户 |
| USER_CENTER_USER_CREATE | 创建用户 |
| USER_CENTER_USER_EDIT | 编辑用户 |
| USER_CENTER_USER_DELETE | 删除用户 |
| USER_CENTER_USER_ENABLE | 启用/禁用用户 |
| USER_CENTER_USER_RESET_PWD | 重置密码 |
| USER_CENTER_ORG_VIEW | 查看组织 |
| USER_CENTER_ORG_MANAGE | 管理组织 |

### 角色授权模块
| 权限码 | 说明 |
|--------|------|
| ROLE_CREATE | 创建角色 |
| ROLE_UPDATE | 更新角色 |
| ROLE_DELETE | 删除角色 |
| ROLE_VIEW | 查看角色 |
| ROLE_PERMISSION_ASSIGN | 分配角色权限 |
| USER_AUTH_MANAGE | 管理用户授权 |
| USER_AUTH_VIEW | 查看用户授权 |

---

## 统一响应格式

### ApiResponse
```json
{
  "code": "0",
  "message": "success",
  "data": { ... }
}
```

### PageResult
```json
{
  "total": 100,
  "pageNum": 1,
  "pageSize": 10,
  "list": [ ... ]
}
```

---

## 技术特点

1. **统一权限注解**: 使用 `@RequirePermission` 注解进行接口级权限控制
2. **项目隔离**: 列表查询支持项目级数据隔离
3. **Cookie + Header 双模式**: Token 支持从 Cookie 或 Authorization Header 读取
4. **Swagger 文档**: 使用 OpenAPI 3.0 注解生成 API 文档
5. **参数校验**: 使用 Jakarta Validation 进行参数校验

---

## 架构图

```
┌────────────────────────────────────────────────────────────────┐
│                        HTTP Request                             │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                      AuthInterceptor                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. 提取 Token (Header/Cookie)                           │   │
│  │ 2. 解析 JWT Claims                                      │   │
│  │ 3. 验证 Token 类型 (access)                             │   │
│  │ 4. 验证 Session 有效性                                  │   │
│  │ 5. 设置 UserContextHolder                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                      Controllers                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Authz   │ │  Login   │ │Permission│ │   Role   │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Project  │ │   User   │ │ Org      │ │ UserAuth │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                      permission-biz                             │
│                      (Manager 层)                               │
└────────────────────────────────────────────────────────────────┘
```
