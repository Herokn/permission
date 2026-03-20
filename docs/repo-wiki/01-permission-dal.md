# permission-dal 模块分析

## 模块概述
数据访问层（Data Access Layer），负责与数据库的交互，使用 MyBatis-Plus 作为 ORM 框架。

## 数据模型

### 核心实体表

#### 1. PermissionDO - 权限点实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| code | String | 权限编码（唯一标识） |
| name | String | 权限名称 |
| systemCode | String | 所属系统编码 |
| projectId | String | 项目ID，NULL表示全局权限 |
| type | String | 权限类型：MENU/PAGE/ACTION |
| parentCode | String | 父权限编码（树形结构） |
| sortOrder | Integer | 排序号 |
| status | String | 状态：ENABLED/DISABLED |
| description | String | 描述 |

**特点**：
- 支持树形结构（parentCode）
- 支持全局/项目级隔离（projectId）
- 三级权限类型：菜单/页面/操作

---

#### 2. ProjectDO - 项目实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| code | String | 项目编码 |
| name | String | 项目名称 |
| description | String | 描述 |
| systems | List<SystemModule> | 系统模块列表（JSON存储） |
| status | String | 状态 |

**内嵌类型 SystemModule**：
```java
class SystemModule {
    String code;
    String name;
}
```

**特点**：
- 一对多：一个项目包含多个系统模块
- systems 字段使用 JSON 格式存储

---

#### 3. RoleDO - 角色实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| code | String | 角色编码 |
| name | String | 角色名称 |
| roleScope | String | 角色范围：GLOBAL/PROJECT |
| roleDomain | String | 角色域：APP/PERM_CENTER |
| projectId | String | 项目ID，NULL表示全局角色 |
| status | String | 状态：ENABLED/DISABLED |
| description | String | 描述 |

**特点**：
- 双维度分类：roleScope（范围） + roleDomain（域）
- 支持全局/项目级隔离

---

#### 4. UserDO - 用户实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| userId | String | 用户唯一标识 |
| displayName | String | 显示名称 |
| fullName | String | 全名 |
| mobile | String | 手机号 |
| email | String | 邮箱 |
| avatarUrl | String | 头像URL |
| status | Integer | 状态：1=启用, 0=禁用 |
| primaryOrgId | Long | 主组织ID |
| positionId | Long | 岗位ID |
| employeeNo | String | 工号 |

**特点**：
- 支持组织关联（primaryOrgId）
- 支持岗位关联（positionId）

---

### 关联关系表

#### 5. UserRoleDO - 用户角色关系
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| userId | String | 用户ID |
| roleId | Long | 角色ID |
| projectId | String | 项目ID（NULL表示全局） |
| deletedTime | LocalDateTime | 删除时间 |

**特点**：
- 多对多：用户 ↔ 角色
- 支持项目级隔离
- 软删除 + 删除时间记录

---

#### 6. RolePermissionDO - 角色权限关系
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| roleId | Long | 角色ID |
| permissionCode | String | 权限编码 |

**特点**：
- 多对多：角色 ↔ 权限
- 使用 permissionCode 而非 permissionId 关联

---

#### 7. UserPermissionDO - 用户直接权限
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| userId | String | 用户ID |
| permissionCode | String | 权限编码 |
| effect | String | 效果：ALLOW/DENY |
| projectId | String | 项目ID（NULL表示全局） |
| deletedTime | LocalDateTime | 删除时间 |

**特点**：
- 支持用户级别的权限覆盖
- effect 字段支持允许/拒绝两种效果
- 软删除 + 删除时间记录

---

### 组织架构表

#### 8. OrganizationDO - 组织实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| code | String | 组织编码 |
| name | String | 组织名称 |
| parentId | Long | 父组织ID（树形结构） |
| sortOrder | Integer | 排序号 |
| status | String | 状态：ENABLED/DISABLED |
| description | String | 描述 |

**特点**：
- 树形结构组织

---

#### 9. UserOrgDO - 用户组织关系
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| userId | String | 用户ID |
| orgId | Long | 组织ID |

**特点**：
- 多对多：用户 ↔ 组织
- 用户可属于多个组织

---

#### 10. OrgRoleDO - 组织角色关系
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| orgId | Long | 组织ID |
| roleId | Long | 角色ID |
| projectId | Long | 项目ID（可选） |

**特点**：
- 多对多：组织 ↔ 角色
- 支持项目级隔离

---

#### 11. PositionDO - 岗位实体
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| positionCode | String | 岗位编码 |
| positionName | String | 岗位名称 |
| level | Integer | 岗位级别 |
| description | String | 描述 |

---

### 会话与审计表

#### 12. LoginSessionDO - 登录会话
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| sessionId | String | 会话ID（UUID） |
| userId | String | 用户ID |
| userName | String | 用户名 |
| loginType | String | 登录类型：PASSWORD/SSO |
| accessToken | String | Access Token |
| refreshToken | String | Refresh Token |
| expiresAt | LocalDateTime | Access Token过期时间 |
| refreshExpiresAt | LocalDateTime | Refresh Token过期时间 |
| loginIp | String | 登录IP |
| userAgent | String | 浏览器UA |
| status | String | 状态：ACTIVE/EXPIRED/REVOKED |

**特点**：
- 支持 JWT Token 管理
- 支持 SSO 登录
- 会话状态管理

---

#### 13. AuditLogDO - 操作审计日志
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| operator | String | 操作人 |
| module | String | 模块 |
| action | String | 操作 |
| targetType | String | 目标类型 |
| targetId | String | 目标ID |
| detail | String | 操作详情(JSON) |
| ipAddress | String | 操作人IP |

**特点**：
- 完整的操作审计记录
- detail 字段使用 JSON 存储详细信息

---

#### 14. DataPermissionRuleDO - 数据权限规则
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键自增 |
| roleId | Long | 角色ID |
| resourceType | String | 资源类型 |
| scopeType | String | 范围类型：ALL/DEPARTMENT/SELF/CUSTOM |
| scopeValue | String | 范围值（JSON格式） |

**特点**：
- 数据级别的权限控制
- 支持多种范围类型

---

## Mapper 接口

所有 Mapper 继承 `BaseMapper<T>`，使用 MyBatis-Plus 提供的通用 CRUD 方法。

| Mapper | 实体 | 特殊方法 |
|--------|------|----------|
| PermissionMapper | PermissionDO | - |
| ProjectMapper | ProjectDO | - |
| RoleMapper | RoleDO | - |
| UserMapper | UserDO | - |
| UserRoleMapper | UserRoleDO | - |
| RolePermissionMapper | RolePermissionDO | insertBatchSomeColumn |
| UserPermissionMapper | UserPermissionDO | - |
| OrganizationMapper | OrganizationDO | - |
| UserOrgMapper | UserOrgDO | - |
| OrgRoleMapper | OrgRoleDO | - |
| PositionMapper | PositionDO | - |
| LoginSessionMapper | LoginSessionDO | - |
| AuditLogMapper | AuditLogDO | - |
| DataPermissionRuleMapper | DataPermissionRuleDO | - |

---

## 数据模型关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Project   │────>│ Permission  │<────│     Role    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   │
                    ┌──────┴──────┐     ┌──────┴──────┐
                    │UserPermission│    │RolePermission│
                    └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    │   UserRole  │
                    └─────────────┘
                           │
                    ┌──────┴──────┐
                    │    User     │
                    └─────────────┘
                      │         │
               ┌──────┴───┐ ┌───┴──────┐
               │ UserOrg  │ │ Position │
               └──────────┘ └──────────┘
                    │
               ┌────┴─────┐
               │  OrgRole │
               └──────────┘
                    │
               ┌────┴─────┐
               │Organization│
               └──────────┘
```

---

## 技术栈
- **ORM框架**: MyBatis-Plus
- **主键策略**: AUTO（自增）
- **逻辑删除**: @TableLogic
- **自动填充**: gmtCreate / gmtModified
- **JSON处理**: JacksonTypeHandler

---

## 待确认/改进点
1. PermissionDO.parentCode 是否应该改为 parentId 以保持一致性？
2. RolePermissionDO 使用 permissionCode 而非 permissionId，是否有特殊考虑？
3. DataPermissionRuleDO 的 scopeValue 是否需要更严格的类型定义？
