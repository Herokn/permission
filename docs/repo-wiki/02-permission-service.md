# permission-service 模块分析

## 模块概述
业务服务层，封装核心业务逻辑，提供权限系统的各种服务接口。

## 服务接口列表

### 核心鉴权服务

#### 1. AuthzService - 鉴权服务
**位置**: `com.permission.service.AuthzService`

**核心方法**:
| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| check | userId, permissionCode, projectId | AuthzResult | 核心鉴权方法 |
| getUserPermissionCodes | userId, projectId | Set<String> | 获取用户所有权限编码 |

**鉴权优先级**（从高到低）:
1. 用户直接 DENY（最高优先级）
2. 用户直接 ALLOW
3. 用户直接角色权限
4. 组织角色权限（含上级组织继承）
5. 默认拒绝

**实现特点**:
- 组织权限支持继承（递归收集祖先组织）
- 有深度限制防止循环引用
- 支持项目级隔离

---

#### 2. AuthzCacheService - 鉴权缓存服务
**位置**: `com.permission.service.cache.AuthzCacheService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| checkWithCache | 带缓存的鉴权 |
| evictUser | 清除指定用户的所有缓存 |
| evictUsers | 批量清除多个用户的缓存 |
| evictPermission | 清除与指定权限编码相关的所有缓存 |
| evictAll | 清除所有缓存 |

---

#### 3. RateLimitService - 限流服务
**位置**: `com.permission.service.RateLimitService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| allowLogin | 检查是否允许登录尝试 |
| getRemainingTime | 获取剩余等待时间 |
| reset | 重置限流计数 |

**用途**: 基于 Redis 的登录限流

---

### 实体管理服务

#### 4. PermissionService - 权限点服务
**位置**: `com.permission.service.PermissionService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| getById | 根据 ID 查询 |
| getByCode | 根据编码查询 |
| save / updateById / removeById | CRUD 操作 |
| countByParentCode | 根据父编码统计子节点数 |
| listByStatus | 根据状态查询列表 |
| page / pageWithProjectFilter | 分页查询（支持项目隔离） |
| listAll / listAllWithProjectFilter | 查询所有（支持项目隔离） |
| listByCodes | 根据编码列表批量查询 |

---

#### 5. RoleService - 角色服务
**位置**: `com.permission.service.RoleService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| getById / getByCode | 查询方法 |
| existsByCode | 检查编码是否存在 |
| save / updateById / removeById | CRUD 操作 |
| page / pageWithProjectFilter | 分页查询（支持项目隔离） |
| listAll / listByStatus | 列表查询 |
| listByIds | 批量查询角色 |

---

#### 6. ProjectService - 项目服务
**位置**: `com.permission.service.ProjectService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| getByCode / getById | 查询方法 |
| existsByCode | 检查编码是否存在 |
| save / updateById / removeById | CRUD 操作 |
| page | 分页查询 |
| listByStatus | 按状态查询列表 |

---

### 关联关系服务

#### 7. UserRoleService - 用户角色关系服务
**位置**: `com.permission.service.UserRoleService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| listByUserIdAndProjectId | 根据用户和项目查询角色列表 |
| listByUserId | 根据用户ID查询所有角色 |
| listByRoleId | 根据角色ID查询所有用户角色 |
| countByRoleId / countByProjectId | 统计引用数 |
| assign | 分配用户角色（幂等） |
| revoke | 移除用户角色（幂等） |
| exists | 判断是否存在 |

---

#### 8. RolePermissionService - 角色权限关系服务
**位置**: `com.permission.service.RolePermissionService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| listByRoleId | 根据角色ID查询权限编码列表 |
| countByPermissionCode | 根据权限编码统计引用数 |
| exists | 判断角色是否拥有指定权限 |
| replacePermissions | 全量覆盖角色权限 |
| removeByRoleId | 删除角色的所有权限关系 |
| listByRoleIdsAndPermissionCode | 批量查询哪些角色拥有指定权限 |

---

#### 9. UserPermissionService - 用户直接权限服务
**位置**: `com.permission.service.UserPermissionService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| findDeny | 查找用户直接 DENY 记录 |
| findAllow | 查找用户直接 ALLOW 记录 |
| countByPermissionCode / countByProjectId | 统计引用数 |
| listByUserId | 根据用户ID查询所有直接权限 |
| grant | 授予/排除用户直接权限（幂等） |
| revoke | 移除用户直接权限（幂等） |

---

### 组织架构服务

#### 10. OrganizationService - 组织服务
**位置**: `com.permission.service.OrganizationService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| getById / getByCode | 查询方法 |
| save / updateById / removeById | CRUD 操作 |
| countByParentId | 根据父组织ID统计子组织数 |
| listAll | 查询所有组织 |
| listByParentId | 根据父组织ID查询子组织列表 |

---

#### 11. UserOrgService - 用户组织关系服务
**位置**: `com.permission.service.UserOrgService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| listByUserId | 根据用户ID查询所属组织列表 |
| listByOrgId | 根据组织ID查询成员列表 |
| countByOrgId | 根据组织ID统计成员数 |
| exists | 判断是否已存在关联 |
| save / remove | 保存/删除用户-组织关联 |

---

#### 12. OrgRoleService - 组织角色关系服务
**位置**: `com.permission.service.OrgRoleService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| listByOrgId | 根据组织ID查询角色关联列表 |
| listByOrgIds | 根据多个组织ID查询角色关联列表 |
| listByOrgIdsAndProjectId | 根据多个组织ID和项目ID查询（支持项目隔离） |
| countByOrgId / countByRoleId | 统计引用数 |
| exists | 判断是否已存在关联 |
| save / remove | 保存/删除组织-角色关联 |
| removeByOrgId | 删除组织的所有角色关联 |

---

### 会话与审计服务

#### 13. LoginSessionService - 登录会话服务
**位置**: `com.permission.service.LoginSessionService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| save | 保存登录会话 |
| getBySessionId | 根据会话ID查询 |
| getByRefreshToken | 根据Refresh Token查询 |
| getByAccessToken | 根据Access Token查询 |
| listActiveByUserId | 查询用户的所有有效会话 |
| updateStatus | 更新会话状态 |
| updateAccessToken | 更新Access Token |
| revokeSession | 使会话失效（登出） |
| revokeAllSessions | 使用户所有会话失效 |

---

#### 14. DataPermissionRuleService - 数据权限规则服务
**位置**: `com.permission.service.DataPermissionRuleService`

**核心方法**:
| 方法 | 说明 |
|------|------|
| listByRoleId | 根据角色ID查询数据权限规则 |
| listByRoleIds | 根据角色ID列表批量查询数据权限规则 |
| setRules | 设置角色的数据权限规则（全量覆盖） |
| removeByRoleId | 删除角色的所有数据权限规则 |
| getByRoleIdAndResourceType | 根据角色ID和资源类型查询规则 |

---

## 内部模型

### AuthzResult - 鉴权结果
**位置**: `com.permission.service.model.AuthzResult`

```java
@Getter
public class AuthzResult {
    private final boolean allowed;  // 是否允许
    private final String reason;    // 原因说明
    
    public static AuthzResult allowed(String reason);
    public static AuthzResult denied(String reason);
}
```

---

## 服务依赖关系

```
AuthzService
    ├── PermissionService
    ├── UserPermissionService
    ├── UserRoleService
    ├── RoleService
    ├── RolePermissionService
    ├── UserOrgService
    ├── OrgRoleService
    └── OrganizationService
```

---

## 核心鉴权流程

```
┌──────────────────────────────────────────────────────────────┐
│                      AuthzService.check()                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 0: 校验权限点有效性        │
              │ (权限点存在且状态为启用)         │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 1: 检查用户直接 DENY      │
              │ → 命中则返回 denied            │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 2: 检查用户直接 ALLOW     │
              │ → 命中则返回 allowed           │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 3: 检查用户直接角色权限    │
              │ → 命中则返回 allowed           │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 4: 检查组织角色权限        │
              │ (含上级组织继承)               │
              │ → 命中则返回 allowed           │
              └───────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Step 5: 默认拒绝               │
              │ → 返回 denied                  │
              └───────────────────────────────┘
```

---

## 项目隔离说明

多个服务支持项目级隔离，通过 `*WithProjectFilter` 方法实现：

**规则**:
- `projectId = null`: 查询全局数据
- `projectId = "xxx"`: 查询该项目的数据 + 全局数据

**涉及服务**:
- PermissionService
- RoleService
- UserRoleService
- OrgRoleService
- UserPermissionService

---

## 技术特点

1. **幂等操作**: assign/revoke/grant 等方法都是幂等的
2. **软删除支持**: 通过 deleted 字段实现
3. **缓存支持**: AuthzCacheService 提供 Redis 缓存
4. **限流支持**: RateLimitService 提供登录限流
5. **组织继承**: 组织权限支持向上继承

---

## 待确认/改进点

1. 缺少 UserService（用户服务）- 用户管理可能在其他模块
2. 缺少 AuditLogService（审计日志服务）
3. 缺少 PositionService（岗位服务）
4. AuthzCacheService 是否需要增加缓存命中率监控？
