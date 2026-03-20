# PRD v3.0 与当前系统对比分析及实施计划

> 基于 6 个模块 repo-wiki 分析文档与 PRD v3.0 的详细对比

---

## 一、概述

### 1.1 PRD v3.0 核心需求

| 特性 | 说明 |
|------|------|
| 三级权限模型 | 项目(PROJECT) → 模块(MODULE) → 操作(ACTION) |
| 权限编码格式 | `{PROJECT}_{MODULE}_{OPERATION}` |
| 级联选择 | 勾选项目自动选中所有模块和操作 |
| 权限合并规则 | 多角色权限取 UNION（去重） |
| 项目隔离 | 用户中心(USER_CENTER) / 权限中心(PERMISSION_CENTER) |

### 1.2 模块分析文档

| 模块 | 文档 | 状态 |
|------|------|------|
| permission-dal | [01-permission-dal.md](docs/repo-wiki/01-permission-dal.md) | ✅ 已完成 |
| permission-service | [02-permission-service.md](docs/repo-wiki/02-permission-service.md) | ✅ 已完成 |
| permission-biz | [03-permission-biz.md](docs/repo-wiki/03-permission-biz.md) | ✅ 已完成 |
| permission-web | [04-permission-web.md](docs/repo-wiki/04-permission-web.md) | ✅ 已完成 |
| permission-common | [05-permission-common.md](docs/repo-wiki/05-permission-common.md) | ✅ 已完成 |
| permission-web-frontend | [06-permission-web-frontend.md](docs/repo-wiki/06-permission-web-frontend.md) | ✅ 已完成 |

---

## 二、模块级对比分析

### 2.1 permission-dal 模块

#### 2.1.1 PermissionDO 差异

| 字段 | 当前实现 | PRD 要求 | 改动类型 |
|------|---------|---------|---------|
| type | MENU/PAGE/ACTION | PROJECT/MODULE/ACTION | **修改** |
| parentCode | String (父权限编码) | - | **删除** |
| parentId | - | Long (父权限ID) | **新增** |
| level | - | INT (1/2/3) | **新增** |
| systemCode | String | - | **删除** |
| projectCode | - | String | **新增** |

**SQL 变更**:
```sql
ALTER TABLE `permission` 
  ADD COLUMN `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
  ADD COLUMN `level` INT DEFAULT 3 COMMENT '层级：1=项目,2=模块,3=操作',
  ADD COLUMN `project_code` VARCHAR(64) COMMENT '所属项目编码',
  MODIFY COLUMN `type` VARCHAR(32) COMMENT '类型：PROJECT/MODULE/ACTION';

UPDATE `permission` SET `parent_id` = 0 WHERE `parent_code` IS NULL OR `parent_code` = '';

ALTER TABLE `permission` DROP COLUMN `parent_code`;
ALTER TABLE `permission` DROP COLUMN `system_code`;
```

#### 2.1.2 ProjectDO 差异

| 字段 | 当前实现 | PRD 要求 | 改动类型 |
|------|---------|---------|---------|
| code | 项目编码 | - | 重命名为 projectCode |
| name | 项目名称 | - | 重命名为 projectName |
| systems | List<SystemModule> | - | **删除** |
| status | String | TINYINT | **修改类型** |
| sortOrder | - | INT | **新增** |

**SQL 变更**:
```sql
ALTER TABLE `project`
  CHANGE COLUMN `code` `project_code` VARCHAR(64) UNIQUE NOT NULL,
  CHANGE COLUMN `name` `project_name` VARCHAR(128) NOT NULL,
  ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序',
  MODIFY COLUMN `status` TINYINT DEFAULT 1 COMMENT '状态：1=启用,0=禁用';

ALTER TABLE `project` DROP COLUMN `systems`;
```

#### 2.1.3 RoleDO 差异

| 字段 | 当前实现 | PRD 要求 | 改动类型 |
|------|---------|---------|---------|
| code | 角色编码 | - | 重命名为 roleCode |
| name | 角色名称 | - | 重命名为 roleName |
| status | String | TINYINT | **修改类型** |
| sortOrder | - | INT | **新增** |

**SQL 变更**:
```sql
ALTER TABLE `role`
  CHANGE COLUMN `code` `role_code` VARCHAR(64) UNIQUE NOT NULL,
  CHANGE COLUMN `name` `role_name` VARCHAR(128) NOT NULL,
  ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序',
  MODIFY COLUMN `status` TINYINT DEFAULT 1 COMMENT '状态：1=启用,0=禁用';
```

#### 2.1.4 OrganizationDO 差异

| 字段 | 当前实现 | PRD 要求 | 改动类型 |
|------|---------|---------|---------|
| orgCode | ✓ | ✓ | 一致 |
| orgName | ✓ | ✓ | 一致 |
| orgType | ✓ | ✓ | 一致 |
| parentId | ✓ | ✓ | 一致 |
| level | - | INT | **新增** |
| path | - | VARCHAR(512) | **新增** |
| leaderId | - | VARCHAR(64) | **新增** |

**SQL 变更**:
```sql
ALTER TABLE `organization`
  ADD COLUMN `level` INT DEFAULT 1 COMMENT '层级',
  ADD COLUMN `path` VARCHAR(512) COMMENT '路径（逗号分隔ID）',
  ADD COLUMN `leader_id` VARCHAR(64) COMMENT '负责人用户ID';
```

#### 2.1.5 新增 PositionDO

PRD 要求新增岗位表：

```sql
CREATE TABLE `position` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `position_code` VARCHAR(64) UNIQUE NOT NULL COMMENT '岗位编码',
  `position_name` VARCHAR(128) NOT NULL COMMENT '岗位名称',
  `level` INT COMMENT '岗位级别',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1=启用,0=禁用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `description` VARCHAR(512) COMMENT '描述',
  `gmt_create` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `gmt_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0
);
```

---

### 2.2 permission-service 模块

#### 2.2.1 现有服务

| 服务 | 当前功能 | 状态 |
|------|---------|------|
| PermissionService | 权限CRUD | 需增强 |
| RoleService | 角色CRUD | 需增强 |
| ProjectService | 项目CRUD | 需增强 |
| AuthzService | 鉴权 | 需增强 |
| OrganizationService | 组织CRUD | 需增强 |

#### 2.2.2 缺失服务

| 服务 | PRD 要求 | 优先级 |
|------|---------|--------|
| UserService | 用户管理 | **高** |
| PositionService | 岗位管理 | **高** |
| AuditLogService | 审计日志 | 中 |
| UserOrgRelService | 用户组织关系 | **高** |

#### 2.2.3 PermissionService 增强需求

```java
public interface PermissionService {
    
    List<PermissionDO> selectTreeByProjectCode(String projectCode);
    
    List<Long> getAllDescendantIds(Long permissionId);
    
    List<PermissionDO> selectByLevel(Integer level);
    
    List<PermissionDO> selectByParentId(Long parentId);
}
```

#### 2.2.4 AuthzService 增强需求

```java
public interface AuthzService {
    
    Set<String> getMergedPermissions(String userId, String projectCode);
    
    Set<Long> getMergedPermissionIds(String userId, String projectCode);
    
    boolean hasAnyPermission(String userId, String[] permissionCodes);
}
```

---

### 2.3 permission-biz 模块

#### 2.3.1 现有 Manager

| Manager | 当前功能 | 状态 |
|---------|---------|------|
| AuthzManager | 鉴权管理 | 需增强 |
| PermissionManager | 权限管理 | 需增强 |
| RoleManager | 角色管理 | 需增强 |
| OrganizationManager | 组织管理 | 需增强 |

#### 2.3.2 缺失 Manager

| Manager | PRD 要求 | 优先级 |
|---------|---------|--------|
| UserManager | 用户管理 | **高** |
| PositionManager | 岗位管理 | **高** |
| UserGrantManager | 用户授权 | **高** |

#### 2.3.3 PermissionManager 增强需求

```java
public interface PermissionManager {
    
    List<PermissionVO> getPermissionTree(String projectCode);
    
    List<Long> getCascadedPermissionIds(List<Long> selectedIds);
    
    PermissionVO buildTree(List<PermissionDO> flatList);
}
```

#### 2.3.4 UserGrantManager 新增需求

```java
public interface UserGrantManager {
    
    UserGrantVO getUserGrantInfo(String userId);
    
    void assignRoles(String userId, List<Long> roleIds);
    
    void removeRoles(String userId, List<Long> roleIds);
    
    Set<String> getMergedPermissions(String userId);
}
```

---

### 2.4 permission-web 模块

#### 2.4.1 API 路径标准化

| 当前路径 | PRD 要求 | 状态 |
|---------|---------|------|
| /permissions | /api/permission-center/permissions | 需调整 |
| /roles | /api/permission-center/roles | 需调整 |
| /projects | /api/permission-center/projects | 需调整 |
| /users | /api/user-center/users | 需调整 |
| /organizations | /api/user-center/organizations | 需调整 |

#### 2.4.2 缺失 Controller

| Controller | PRD 要求 | 优先级 |
|------------|---------|--------|
| PositionController | 岗位管理API | **高** |
| UserGrantController | 用户授权API | **高** |

#### 2.4.3 新增 API 接口

**PositionController** (`/api/user-center/positions`):
| 方法 | HTTP | 路径 | 说明 |
|------|------|------|------|
| list | GET | / | 分页查询 |
| listAll | GET | /all | 查询所有 |
| create | POST | / | 创建岗位 |
| update | PUT | /{id} | 更新岗位 |
| delete | DELETE | /{id} | 删除岗位 |

**UserGrantController** (`/api/permission-center/user-grants`):
| 方法 | HTTP | 路径 | 说明 |
|------|------|------|------|
| getUserGrant | GET | /{userId} | 获取用户授权信息 |
| assignRoles | POST | /{userId}/roles | 分配角色 |
| removeRoles | DELETE | /{userId}/roles | 移除角色 |
| getPermissions | GET | /{userId}/permissions | 获取合并后权限 |

---

### 2.5 permission-common 模块

#### 2.5.1 枚举扩展

**新增 PermissionTypeEnum 值**:
```java
public enum PermissionTypeEnum {
    PROJECT,    // 项目级
    MODULE,     // 模块级
    ACTION;     // 操作级
}
```

**新增 OrgTypeEnum**:
```java
public enum OrgTypeEnum {
    COMPANY,      // 公司
    DEPARTMENT,   // 部门
    TEAM,         // 团队
    GROUP;        // 小组
}
```

#### 2.5.2 错误码扩展

```java
public enum ErrorCode {
    // 用户中心模块 (101xxx)
    USER_NOT_FOUND(101001, "用户不存在"),
    USER_ALREADY_EXISTS(101002, "用户已存在"),
    
    // 组织管理 (102xxx)
    ORG_NOT_FOUND(102001, "组织不存在"),
    ORG_HAS_CHILDREN(102002, "存在子组织，无法删除"),
    
    // 岗位管理 (103xxx)
    POSITION_NOT_FOUND(103001, "岗位不存在"),
    POSITION_IN_USE(103002, "岗位正在使用中"),
    
    // 权限中心模块 (201xxx)
    PERMISSION_NOT_FOUND(201001, "权限不存在"),
    PERMISSION_LEVEL_ERROR(201002, "权限层级错误"),
    ROLE_NOT_FOUND(202001, "角色不存在"),
}
```

---

### 2.6 permission-web-frontend 模块

#### 2.6.1 现有组件

| 组件 | 当前功能 | 状态 |
|------|---------|------|
| ProtectedRoute | 路由守卫 | ✅ 可用 |
| MainLayout | 主布局 | ✅ 可用 |
| useAuth | 认证Hook | ✅ 可用 |
| api.ts | API服务 | 需扩展 |

#### 2.6.2 缺失组件

| 组件 | PRD 要求 | 优先级 |
|------|---------|--------|
| PermissionSelector | 三级权限级联选择器 | **高** |
| PermissionTree | 权限树组件 | **高** |
| OrgTree | 组织树组件 | **高** |
| PermissionGuard | 按钮级权限守卫 | **高** |

#### 2.6.3 PermissionSelector 组件设计

```typescript
interface PermissionSelectorProps {
  value?: number[];
  onChange?: (value: number[]) => void;
  projectCode: string;
  disabled?: boolean;
}

// 功能说明：
// 1. 展示三级权限树：项目 → 模块 → 操作
// 2. 勾选项目级 → 自动勾选所有子模块和操作
// 3. 勾选模块级 → 自动勾选所有子操作
// 4. 支持半选状态显示
// 5. 返回所有选中的权限ID（包含级联选中的）
```

#### 2.6.4 PermissionGuard 组件设计

```typescript
interface PermissionGuardProps {
  permission: string | string[];
  mode?: 'any' | 'all';  // any=任一权限, all=全部权限
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 使用示例：
<PermissionGuard permission="USER_CENTER_USER_CREATE">
  <Button>创建用户</Button>
</PermissionGuard>

<PermissionGuard permission={['USER_CENTER_USER_EDIT', 'USER_CENTER_USER_DELETE']} mode="any">
  <Button>操作</Button>
</PermissionGuard>
```

#### 2.6.5 页面级改动

**用户中心页面**:
| 页面 | 当前状态 | PRD 要求 |
|------|---------|---------|
| UserList | 基础实现 | 增加搜索、启用/禁用 |
| OrgList | 基础实现 | 树形展示、层级字段 |
| PositionList | 待完善 | 完整CRUD |

**权限中心页面**:
| 页面 | 当前状态 | PRD 要求 |
|------|---------|---------|
| ProjectList | 基础实现 | 字段重命名 |
| PermissionList | 基础实现 | 三级树形展示 |
| RoleList | 基础实现 | 级联权限分配 |
| UserGrantList | 待完善 | 角色分配、权限预览 |

---

## 三、权限编码对照表

### 3.1 用户中心权限

| 功能 | 权限编码 | 说明 |
|------|---------|------|
| 查看用户 | USER_CENTER_USER_VIEW | 查看用户列表和详情 |
| 搜索用户 | USER_CENTER_USER_SEARCH | 多条件搜索 |
| 创建用户 | USER_CENTER_USER_CREATE | 创建新用户 |
| 编辑用户 | USER_CENTER_USER_EDIT | 编辑用户信息 |
| 删除用户 | USER_CENTER_USER_DELETE | 删除用户 |
| 启用/禁用 | USER_CENTER_USER_ENABLE | 启用或禁用用户 |
| 查看组织 | USER_CENTER_ORG_VIEW | 查看组织列表和详情 |
| 创建组织 | USER_CENTER_ORG_CREATE | 创建新组织 |
| 编辑组织 | USER_CENTER_ORG_EDIT | 编辑组织信息 |
| 删除组织 | USER_CENTER_ORG_DELETE | 删除组织 |
| 查看岗位 | USER_CENTER_POSITION_VIEW | 查看岗位列表 |
| 创建岗位 | USER_CENTER_POSITION_CREATE | 创建新岗位 |
| 编辑岗位 | USER_CENTER_POSITION_EDIT | 编辑岗位信息 |
| 删除岗位 | USER_CENTER_POSITION_DELETE | 删除岗位 |

### 3.2 权限中心权限

| 功能 | 权限编码 | 说明 |
|------|---------|------|
| 查看项目 | PERMISSION_CENTER_PROJECT_VIEW | 查看项目列表 |
| 创建项目 | PERMISSION_CENTER_PROJECT_CREATE | 创建新项目 |
| 编辑项目 | PERMISSION_CENTER_PROJECT_EDIT | 编辑项目信息 |
| 删除项目 | PERMISSION_CENTER_PROJECT_DELETE | 删除项目 |
| 查看权限点 | PERMISSION_CENTER_PERMISSION_VIEW | 查看权限树 |
| 创建权限点 | PERMISSION_CENTER_PERMISSION_CREATE | 创建新权限点 |
| 编辑权限点 | PERMISSION_CENTER_PERMISSION_EDIT | 编辑权限点 |
| 删除权限点 | PERMISSION_CENTER_PERMISSION_DELETE | 删除权限点 |
| 查看角色 | PERMISSION_CENTER_ROLE_VIEW | 查看角色列表 |
| 创建角色 | PERMISSION_CENTER_ROLE_CREATE | 创建新角色 |
| 编辑角色 | PERMISSION_CENTER_ROLE_EDIT | 编辑角色信息 |
| 删除角色 | PERMISSION_CENTER_ROLE_DELETE | 删除角色 |
| 角色授权 | PERMISSION_CENTER_ROLE_GRANT | 为角色分配权限 |
| 查看用户授权 | PERMISSION_CENTER_USER_GRANT_VIEW | 查看用户授权信息 |
| 分配用户角色 | PERMISSION_CENTER_USER_GRANT_ASSIGN | 为用户分配角色 |

---

## 四、初始权限数据

```sql
-- 项目数据
INSERT INTO `project` (`project_code`, `project_name`, `status`, `sort_order`) VALUES
('USER_CENTER', '用户中心', 1, 1),
('PERMISSION_CENTER', '权限中心', 1, 2);

-- 用户中心权限树
INSERT INTO `permission` (`project_code`, `code`, `name`, `type`, `parent_id`, `level`, `sort_order`) VALUES
-- 项目级
('USER_CENTER', 'USER_CENTER_PROJECT', '用户中心', 'PROJECT', 0, 1, 1),

-- 模块级 (parentId 需根据实际插入ID调整)
('USER_CENTER', 'USER_CENTER_USER_MODULE', '用户管理', 'MODULE', 1, 2, 1),
('USER_CENTER', 'USER_CENTER_ORG_MODULE', '组织管理', 'MODULE', 1, 2, 2),
('USER_CENTER', 'USER_CENTER_POSITION_MODULE', '岗位管理', 'MODULE', 1, 2, 3),

-- 操作级 - 用户管理
('USER_CENTER', 'USER_CENTER_USER_VIEW', '查看用户', 'ACTION', 2, 3, 1),
('USER_CENTER', 'USER_CENTER_USER_SEARCH', '搜索用户', 'ACTION', 2, 3, 2),
('USER_CENTER', 'USER_CENTER_USER_CREATE', '创建用户', 'ACTION', 2, 3, 3),
('USER_CENTER', 'USER_CENTER_USER_EDIT', '编辑用户', 'ACTION', 2, 3, 4),
('USER_CENTER', 'USER_CENTER_USER_DELETE', '删除用户', 'ACTION', 2, 3, 5),
('USER_CENTER', 'USER_CENTER_USER_ENABLE', '启用/禁用用户', 'ACTION', 2, 3, 6),

-- 操作级 - 组织管理
('USER_CENTER', 'USER_CENTER_ORG_VIEW', '查看组织', 'ACTION', 3, 3, 1),
('USER_CENTER', 'USER_CENTER_ORG_CREATE', '创建组织', 'ACTION', 3, 3, 2),
('USER_CENTER', 'USER_CENTER_ORG_EDIT', '编辑组织', 'ACTION', 3, 3, 3),
('USER_CENTER', 'USER_CENTER_ORG_DELETE', '删除组织', 'ACTION', 3, 3, 4),

-- 操作级 - 岗位管理
('USER_CENTER', 'USER_CENTER_POSITION_VIEW', '查看岗位', 'ACTION', 4, 3, 1),
('USER_CENTER', 'USER_CENTER_POSITION_CREATE', '创建岗位', 'ACTION', 4, 3, 2),
('USER_CENTER', 'USER_CENTER_POSITION_EDIT', '编辑岗位', 'ACTION', 4, 3, 3),
('USER_CENTER', 'USER_CENTER_POSITION_DELETE', '删除岗位', 'ACTION', 4, 3, 4);

-- 权限中心权限树
INSERT INTO `permission` (`project_code`, `code`, `name`, `type`, `parent_id`, `level`, `sort_order`) VALUES
-- 项目级
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT', '权限中心', 'PROJECT', 0, 1, 2),

-- 模块级
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT_MODULE', '项目管理', 'MODULE', 1, 2, 1),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PERMISSION_MODULE', '权限点管理', 'MODULE', 1, 2, 2),
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_MODULE', '角色管理', 'MODULE', 1, 2, 3),
('PERMISSION_CENTER', 'PERMISSION_CENTER_USER_GRANT_MODULE', '用户授权', 'MODULE', 1, 2, 4),

-- 操作级 - 项目管理
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT_VIEW', '查看项目', 'ACTION', 2, 3, 1),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT_CREATE', '创建项目', 'ACTION', 2, 3, 2),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT_EDIT', '编辑项目', 'ACTION', 2, 3, 3),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PROJECT_DELETE', '删除项目', 'ACTION', 2, 3, 4),

-- 操作级 - 权限点管理
('PERMISSION_CENTER', 'PERMISSION_CENTER_PERMISSION_VIEW', '查看权限点', 'ACTION', 3, 3, 1),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PERMISSION_CREATE', '创建权限点', 'ACTION', 3, 3, 2),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PERMISSION_EDIT', '编辑权限点', 'ACTION', 3, 3, 3),
('PERMISSION_CENTER', 'PERMISSION_CENTER_PERMISSION_DELETE', '删除权限点', 'ACTION', 3, 3, 4),

-- 操作级 - 角色管理
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_VIEW', '查看角色', 'ACTION', 4, 3, 1),
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_CREATE', '创建角色', 'ACTION', 4, 3, 2),
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_EDIT', '编辑角色', 'ACTION', 4, 3, 3),
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_DELETE', '删除角色', 'ACTION', 4, 3, 4),
('PERMISSION_CENTER', 'PERMISSION_CENTER_ROLE_GRANT', '角色授权', 'ACTION', 4, 3, 5),

-- 操作级 - 用户授权
('PERMISSION_CENTER', 'PERMISSION_CENTER_USER_GRANT_VIEW', '查看用户授权', 'ACTION', 5, 3, 1),
('PERMISSION_CENTER', 'PERMISSION_CENTER_USER_GRANT_ASSIGN', '分配用户角色', 'ACTION', 5, 3, 2);
```

---

## 五、实施计划

### 阶段一：数据库调整 (1天)

**任务清单**:
- [ ] 备份现有数据库
- [ ] 执行 PermissionDO 表结构变更 (parentId/level/projectCode)
- [ ] 执行 ProjectDO 表结构变更 (字段重命名)
- [ ] 执行 RoleDO 表结构变更 (字段重命名)
- [ ] 执行 OrganizationDO 表结构变更 (新增 level/path/leaderId)
- [ ] 创建 PositionDO 表
- [ ] 创建 UserOrgRelDO 表
- [ ] 插入初始权限数据
- [ ] 验证数据完整性

### 阶段二：permission-dal 改动 (1天)

**任务清单**:
- [ ] PermissionDO 增加字段 (parentId/level/projectCode)
- [ ] ProjectDO 字段重命名 (code→projectCode, name→projectName)
- [ ] RoleDO 字段重命名 (code→roleCode, name→roleName)
- [ ] OrganizationDO 增加字段 (level/path/leaderId)
- [ ] 新增 PositionDO 实体
- [ ] 新增 UserOrgRelDO 实体
- [ ] 更新 Mapper XML (字段映射)
- [ ] 新增 PositionMapper
- [ ] 新增 UserOrgRelMapper

### 阶段三：permission-service 改动 (1天)

**任务清单**:
- [ ] PermissionService 增加树查询方法
- [ ] PermissionService 增加级联ID获取方法
- [ ] AuthzService 增加权限UNION合并方法
- [ ] 新增 PositionService
- [ ] 新增 UserService
- [ ] 新增 UserOrgRelService

### 阶段四：permission-biz 改动 (1天)

**任务清单**:
- [ ] PermissionManager 增加权限树构建方法
- [ ] PermissionManager 增加级联选择支持
- [ ] AuthzManager 增加权限合并逻辑
- [ ] 新增 PositionManager
- [ ] 新增 UserManager
- [ ] 新增 UserGrantManager

### 阶段五：permission-web 改动 (1天)

**任务清单**:
- [ ] 统一 API 路径前缀 (/api/permission-center, /api/user-center)
- [ ] PermissionController 调整
- [ ] RoleController 调整
- [ ] ProjectController 调整
- [ ] UserController 调整
- [ ] OrganizationController 调整
- [ ] 新增 PositionController
- [ ] 新增 UserGrantController
- [ ] 更新 Swagger 文档

### 阶段六：permission-common 改动 (0.5天)

**任务清单**:
- [ ] PermissionTypeEnum 增加 PROJECT/MODULE
- [ ] 新增 OrgTypeEnum
- [ ] 扩展 ErrorCode 枚举
- [ ] 更新相关工具类

### 阶段七：permission-web-frontend 改动 (3天)

**Day 1**: 核心组件
- [ ] PermissionSelector 级联选择器
- [ ] PermissionTree 权限树组件
- [ ] PermissionGuard 权限守卫
- [ ] OrgTree 组织树组件

**Day 2**: 用户中心页面
- [ ] UserList 增强搜索功能
- [ ] OrgList 树形展示改造
- [ ] PositionList 完整实现
- [ ] API 服务扩展

**Day 3**: 权限中心页面
- [ ] PermissionList 三级树展示
- [ ] RoleList 级联权限分配
- [ ] UserGrantList 角色分配
- [ ] 权限预览功能

### 阶段八：集成测试 (1天)

**任务清单**:
- [ ] 后端单元测试
- [ ] 前后端联调
- [ ] 权限级联选择测试
- [ ] 角色权限分配测试
- [ ] 用户授权测试
- [ ] 权限验证测试
- [ ] E2E 测试

### 阶段九：部署上线 (0.5天)

**任务清单**:
- [ ] 数据库迁移脚本执行
- [ ] 后端服务部署
- [ ] 前端构建部署
- [ ] 线上验证

---

## 六、风险和注意事项

### 6.1 数据迁移风险

| 风险 | 缓解措施 |
|------|---------|
| 字段重命名导致关联失效 | 先备份数据，分步迁移，验证后再删除旧字段 |
| 权限编码格式变化 | 建立新旧编码映射表，渐进式迁移 |
| 现有角色权限丢失 | 迁移前导出，迁移后验证 |

### 6.2 兼容性风险

| 风险 | 缓解措施 |
|------|---------|
| API 路径变化影响调用方 | 保留旧路径兼容期，逐步废弃 |
| 前端 Token 机制变化 | 保持双模式（Header/Cookie）兼容 |
| 权限校验逻辑变化 | 灰度发布，监控异常 |

### 6.3 缓存一致性

| 风险 | 缓解措施 |
|------|---------|
| 权限变更后缓存未更新 | 权限变更时主动清除相关缓存 |
| 多实例缓存不同步 | 使用 Redis Pub/Sub 通知缓存失效 |

---

## 七、验收标准

### 7.1 功能验收

| 模块 | 功能 | 验收标准 |
|------|------|---------|
| 用户管理 | 增删改查、搜索 | 所有功能正常 |
| 组织管理 | 树形展示、增删改查 | 树形正确展示 |
| 岗位管理 | 增删改查 | 所有功能正常 |
| 项目管理 | 增删改查 | 所有功能正常 |
| 权限点管理 | 三级树展示、增删改查 | 级联选择正常 |
| 角色管理 | 增删改查、权限分配 | 权限分配正确 |
| 用户授权 | 角色分配、权限预览 | UNION合并正确 |
| 权限验证 | 页面级、按钮级 | 无权限正确拦截 |

### 7.2 性能验收

| 指标 | 标准 |
|------|------|
| 页面加载时间 | < 2s |
| 列表查询响应 | < 500ms |
| 权限树加载 | < 500ms |
| 权限验证响应 | < 100ms |

### 7.3 安全验收

| 检查项 | 标准 |
|--------|------|
| API 权限校验 | 所有接口有权限控制 |
| 审计日志 | 敏感操作有日志 |
| 密码存储 | 加密存储 |
| Token 有效期 | 合理设置 |

---

## 八、附录

### 8.1 相关文档

- [PRD v3.0](spec/PRD/系统整合/01-统一权限管理系统PRD.md)
- [permission-dal 分析](docs/repo-wiki/01-permission-dal.md)
- [permission-service 分析](docs/repo-wiki/02-permission-service.md)
- [permission-biz 分析](docs/repo-wiki/03-permission-biz.md)
- [permission-web 分析](docs/repo-wiki/04-permission-web.md)
- [permission-common 分析](docs/repo-wiki/05-permission-common.md)
- [permission-web-frontend 分析](docs/repo-wiki/06-permission-web-frontend.md)

### 8.2 技术栈确认

| 层级 | 技术 | 版本 |
|------|------|------|
| 数据库 | MySQL | 8.0+ |
| 后端框架 | Spring Boot | 2.x |
| ORM | MyBatis-Plus | 3.x |
| 缓存 | Redis | 6.x |
| 前端框架 | React | 18.x |
| UI组件库 | Ant Design | 5.x |
| 构建工具 | Vite | 5.x |
