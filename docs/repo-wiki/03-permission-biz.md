# permission-biz 模块分析

## 模块概述
业务逻辑层，负责组合 Service 层服务，提供完整的业务功能。包含 Manager（业务管理器）、DTO（数据传输对象）、VO（视图对象）、Converter（转换器）、Aspect（切面）和 Event（事件）。

---

## Manager 接口

### 1. AuthzManager - 鉴权管理器
**位置**: `com.permission.biz.manager.AuthzManager`

**方法**:
| 方法 | 说明 |
|------|------|
| check(AuthzCheckDTO) | 单次鉴权 |
| checkBatch(AuthzBatchCheckDTO) | 批量鉴权 |

---

### 2. LoginManager - 登录管理器
**位置**: `com.permission.biz.manager.LoginManager`

**方法**:
| 方法 | 说明 |
|------|------|
| login(LoginDTO) | 账号密码登录 |
| ssoLogin(SsoLoginDTO) | SSO 登录 |
| logout(sessionId) | 登出 |
| refresh(RefreshTokenDTO) | 刷新 Token |
| getCurrentUser(sessionId) | 获取当前用户信息 |

---

### 3. PermissionManager - 权限点管理器
**位置**: `com.permission.biz.manager.PermissionManager`

**方法**:
| 方法 | 说明 |
|------|------|
| createPermission(CreatePermissionDTO) | 新增权限点 |
| updatePermission(id, UpdatePermissionDTO) | 编辑权限点 |
| deletePermission(id) | 删除权限点 |
| listPermissions(...) | 分页查询权限点 |
| listPermissionsWithProjectFilter(...) | 分页查询（支持项目隔离） |
| getPermissionTree() | 查询权限树 |
| getPermissionTreeWithProjectFilter(projectId) | 查询权限树（支持项目隔离） |
| listAllPermissions() | 查询所有权限点（下拉选择用） |
| listAllPermissionsWithProjectFilter(projectId) | 查询所有权限点（支持项目隔离） |

---

### 4. RoleManager - 角色管理器
**位置**: `com.permission.biz.manager.RoleManager`

**方法**:
| 方法 | 说明 |
|------|------|
| createRole(CreateRoleDTO) | 创建角色 |
| updateRole(id, UpdateRoleDTO) | 更新角色 |
| deleteRole(id) | 删除角色 |
| listRoles(...) | 分页查询角色 |
| listRolesWithProjectFilter(...) | 分页查询（支持项目隔离） |
| getRoleDetail(id) | 获取角色详情 |
| assignPermissions(roleId, AssignRolePermissionsDTO) | 分配角色权限 |
| listAllRoles() | 查询所有角色（下拉选择用） |

---

### 5. ProjectManager - 项目管理器
**位置**: `com.permission.biz.manager.ProjectManager`

**方法**:
| 方法 | 说明 |
|------|------|
| createProject(CreateProjectDTO) | 创建项目 |
| updateProject(id, UpdateProjectDTO) | 更新项目 |
| deleteProject(id) | 删除项目 |
| listProjects(ProjectQueryDTO) | 分页查询项目 |
| listAllEnabled() | 查询所有启用项目 |

---

### 6. UserManager - 用户管理器
**位置**: `com.permission.biz.manager.UserManager`

**方法**:
| 方法 | 说明 |
|------|------|
| listUsers(UserQueryDTO) | 分页查询用户 |
| getUserByUserId(userId) | 查询用户详情 |
| createUser(CreateUserDTO) | 创建用户 |
| updateUser(userId, UpdateUserDTO) | 更新用户 |
| enableUser(userId) | 启用用户 |
| disableUser(userId) | 禁用用户 |
| deleteUser(userId) | 删除用户 |
| resetPassword(userId, newPassword) | 重置密码 |

---

### 7. OrganizationManager - 组织管理器
**位置**: `com.permission.biz.manager.OrganizationManager`

**方法**:
| 方法 | 说明 |
|------|------|
| createOrganization(CreateOrganizationDTO) | 创建组织 |
| updateOrganization(id, UpdateOrganizationDTO) | 编辑组织 |
| deleteOrganization(id) | 删除组织 |
| getOrganizationDetail(id) | 查询组织详情 |
| getOrganizationTree() | 查询组织树 |
| assignRoles(orgId, AssignOrgRolesDTO) | 为组织分配角色 |
| removeRole(orgId, roleId) | 移除组织角色 |
| listOrgRoles(orgId) | 查询组织角色列表 |
| addMembers(orgId, AssignOrgMembersDTO) | 将用户加入组织 |
| removeMember(orgId, userId) | 将用户移出组织 |
| listOrgMembers(orgId) | 查询组织成员列表 |

---

### 8. UserAuthManager - 用户授权管理器
**位置**: `com.permission.biz.manager.UserAuthManager`

**方法**:
| 方法 | 说明 |
|------|------|
| assignRole(AssignUserRoleDTO) | 分配用户角色 |
| batchAssignRole(BatchAssignRoleDTO) | 批量分配用户角色 |
| batchRevokeRole(BatchAssignRoleDTO) | 批量移除用户角色 |
| revokeRole(AssignUserRoleDTO) | 移除用户角色 |
| grantPermission(GrantUserPermissionDTO) | 授予/排除用户直接权限 |
| batchGrantPermission(BatchGrantPermissionDTO) | 批量授予用户权限 |
| batchRevokePermission(BatchGrantPermissionDTO) | 批量移除用户权限 |
| revokePermission(GrantUserPermissionDTO) | 移除用户直接权限 |
| getUserAuthDetail(userId) | 查询用户授权详情 |

---

## DTO（数据传输对象）

### 认证相关
| DTO | 用途 |
|-----|------|
| LoginDTO | 账号密码登录请求 |
| SsoLoginDTO | SSO 登录请求 |
| RefreshTokenDTO | 刷新 Token 请求 |

### 鉴权相关
| DTO | 用途 |
|-----|------|
| AuthzCheckDTO | 单次鉴权请求 |
| AuthzBatchCheckDTO | 批量鉴权请求 |

### 权限点相关
| DTO | 用途 |
|-----|------|
| CreatePermissionDTO | 创建权限点 |
| UpdatePermissionDTO | 更新权限点 |

### 角色相关
| DTO | 用途 |
|-----|------|
| CreateRoleDTO | 创建角色 |
| UpdateRoleDTO | 更新角色 |
| AssignRolePermissionsDTO | 分配角色权限 |

### 项目相关
| DTO | 用途 |
|-----|------|
| CreateProjectDTO | 创建项目 |
| UpdateProjectDTO | 更新项目 |
| ProjectQueryDTO | 项目查询条件 |

### 用户相关
| DTO | 用途 |
|-----|------|
| CreateUserDTO | 创建用户 |
| UpdateUserDTO | 更新用户 |
| UserQueryDTO | 用户查询条件 |

### 组织相关
| DTO | 用途 |
|-----|------|
| CreateOrganizationDTO | 创建组织 |
| UpdateOrganizationDTO | 更新组织 |
| AssignOrgMembersDTO | 分配组织成员 |
| AssignOrgRolesDTO | 分配组织角色 |

### 用户授权相关
| DTO | 用途 |
|-----|------|
| AssignUserRoleDTO | 分配用户角色 |
| BatchAssignRoleDTO | 批量分配角色 |
| GrantUserPermissionDTO | 授予用户权限 |
| BatchGrantPermissionDTO | 批量授予权限 |

---

## VO（视图对象）

### 认证相关
| VO | 用途 |
|----|------|
| LoginVO | 登录结果 |
| SsoLoginVO | SSO 登录结果 |
| UserInfoVO | 用户信息 |

### 鉴权相关
| VO | 用途 |
|----|------|
| AuthzResultVO | 鉴权结果（allowed, reason） |
| AuthzBatchResultVO | 批量鉴权结果 |

### 权限点相关
| VO | 用途 |
|----|------|
| PermissionVO | 权限点详情 |
| PermissionTreeVO | 权限树节点 |

### 角色相关
| VO | 用途 |
|----|------|
| RoleVO | 角色详情 |

### 项目相关
| VO | 用途 |
|----|------|
| ProjectVO | 项目详情 |

### 用户相关
| VO | 用途 |
|----|------|
| UserVO | 用户详情 |

### 组织相关
| VO | 用途 |
|----|------|
| OrganizationVO | 组织详情 |
| OrganizationTreeVO | 组织树节点 |
| OrgMemberVO | 组织成员 |
| OrgRoleVO | 组织角色 |

### 用户授权相关
| VO | 用途 |
|----|------|
| UserAuthDetailVO | 用户授权详情（含角色和直接权限） |
| UserRoleVO | 用户角色 |
| UserDirectPermissionVO | 用户直接权限 |

---

## 切面（Aspect）

### 1. AuditLogAspect - 审计日志切面
**位置**: `com.permission.biz.aspect.AuditLogAspect`

**功能**:
- 拦截标注了 `@AuditLog` 注解的 Manager 方法
- 自动记录操作日志到 audit_log 表
- 支持敏感字段过滤（password, token 等）

**记录字段**:
| 字段 | 来源 |
|------|------|
| operator | UserContextHolder |
| module/action/targetType | @AuditLog 注解 |
| targetId | 方法参数提取 |
| detail | 方法参数 JSON 序列化 |
| ipAddress | HttpServletRequest |

---

### 2. DataPermissionAspect - 数据权限切面
**位置**: `com.permission.biz.aspect.DataPermissionAspect`

**功能**:
- 拦截标注了 `@DataPermission` 注解的方法
- 自动注入数据权限上下文
- 支持从方法名推断资源类型

**处理流程**:
1. 检查注解是否启用
2. 获取资源类型（注解指定或方法名推断）
3. 获取当前用户角色列表
4. 查询角色的数据权限规则
5. 构建并设置 DataPermissionContext

---

## 事件（Event）

### PermissionChangedEvent - 权限变更事件
**位置**: `com.permission.biz.event.PermissionChangedEvent`

**变更类型**:
| 类型 | 说明 |
|------|------|
| ROLE_ASSIGN | 分配角色 |
| ROLE_REVOKE | 移除角色 |
| PERMISSION_GRANT | 授予权限 |
| PERMISSION_REVOKE | 移除权限 |
| ROLE_PERMISSION_CHANGED | 角色权限变更 |

**字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | String | 用户ID |
| changeType | String | 变更类型 |
| detail | String | 变更详情 |
| operatorId | String | 操作人 |
| eventTime | LocalDateTime | 事件时间 |

---

### PermissionChangedEventListener - 权限变更事件监听器
**位置**: `com.permission.biz.event.PermissionChangedEventListener`

**功能**:
- 使用 `@TransactionalEventListener` 确保事务提交后执行
- 异步处理权限变更事件
- 角色权限变更时清除相关用户的鉴权缓存
- 发送权限变更通知

---

## 配置类

### AuthUsersConfig - 授权用户配置
**位置**: `com.permission.biz.config.AuthUsersConfig`

**用途**: 配置授权相关的用户信息

---

## 转换器（Converter）

### PermissionWebConverter
**位置**: `com.permission.biz.converter.PermissionWebConverter`

### RoleWebConverter
**位置**: `com.permission.biz.converter.RoleWebConverter`

**用途**: DTO/DO 与 VO 之间的转换

---

## 模块架构图

```
┌─────────────────────────────────────────────────────────────┐
│                       permission-web                         │
│                      (Controller 层)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      permission-biz                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Aspect 切面                       │    │
│  │  ┌─────────────────┐  ┌───────────────────────┐    │    │
│  │  │ AuditLogAspect  │  │ DataPermissionAspect  │    │    │
│  │  │  (审计日志)      │  │    (数据权限)         │    │    │
│  │  └─────────────────┘  └───────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Manager 业务管理器                 │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │ Authz    │ │ Login    │ │Permission│            │    │
│  │  │ Manager  │ │ Manager  │ │ Manager  │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    │
│  │  │  Role    │ │ Project  │ │  User    │            │    │
│  │  │ Manager  │ │ Manager  │ │ Manager  │            │    │
│  │  └──────────┘ └──────────┘ └──────────┘            │    │
│  │  ┌──────────────────┐ ┌──────────────────┐        │    │
│  │  │ Organization     │ │   UserAuth       │        │    │
│  │  │ Manager          │ │   Manager        │        │    │
│  │  └──────────────────┘ └──────────────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 Event 事件处理                       │    │
│  │  PermissionChangedEvent → PermissionChangedListener │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    permission-service                        │
│                      (Service 层)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术特点

1. **事务性事件监听**: 使用 `@TransactionalEventListener` 确保事件在事务提交后处理
2. **异步处理**: 使用 `@Async` 异步处理权限变更事件
3. **AOP 增强**: 审计日志和数据权限通过切面自动处理
4. **敏感信息过滤**: 审计日志自动过滤密码、Token 等敏感字段
5. **项目隔离支持**: 多个 Manager 支持项目级数据隔离

---

## 待确认/改进点

1. PermissionChangedEventListener 中的 sendNotification 方法目前只打印日志，是否需要接入实际通知系统？
2. DataPermissionAspect 的资源类型推断逻辑是否足够健壮？
3. 是否需要增加更多的批量操作接口？
