# 01 - 数据库变更

## 一、迁移脚本合并

**将 V1~V11 共 11 个迁移脚本合并为单个 `V1__init_schema.sql`**，删除以下文件：

```
删除：
  V2__init_demo_data.sql
  V3__org_schema.sql
  V4__login_session_schema.sql
  V5__data_permission_schema.sql
  V6__fix_null_unique_index.sql
  V7__project_table.sql
  V8__add_missing_permissions.sql
  V9__add_deleted_to_data_permission_rule.sql
  V10__fix_deleted_time_index_for_audit.sql
  V11__add_project_id_to_org_role.sql
```

> **注意**：部署时必须先 DROP 旧数据库再重建，否则 Flyway 历史表会冲突。

## 二、表结构变更

### 2.1 `permission` 表 —— 新增 `project_id` 字段

在 `system_code` 字段之后新增：

```sql
`project_id` VARCHAR(64) DEFAULT NULL COMMENT '项目ID，NULL表示全局权限',
```

新增索引：

```sql
KEY `idx_project_id` (`project_id`),
```

### 2.2 `role` 表 —— 新增 `project_id` 字段

在 `role_domain` 字段之后新增：

```sql
`project_id` VARCHAR(64) DEFAULT NULL COMMENT '项目ID，NULL表示全局角色',
```

新增索引：

```sql
KEY `idx_project_id` (`project_id`),
```

### 2.3 `project` 表 —— 新增 `systems` JSON 字段

在 `description` 字段之后新增：

```sql
`systems` JSON DEFAULT NULL COMMENT '系统模块列表，JSON格式',
```

JSON 格式示例：

```json
[
  {"code": "USER_CENTER", "name": "用户中心"},
  {"code": "ORDER_CENTER", "name": "订单中心"}
]
```

### 2.4 其他表无结构变更

以下表的结构与 main 分支一致（已在合并后的 V1 中完整包含）：
- `role_permission`
- `user_role`（含 `project_id` 和 `project_id_key` 虚拟列）
- `user_permission`（含 `project_id` 和 `project_id_key` 虚拟列）
- `audit_log`
- `organization`
- `org_role`
- `user_org`
- `login_session`
- `data_permission_rule`

## 三、演示数据变更

### 3.1 项目数据

新增 `systems` JSON 字段：

```sql
INSERT INTO `project` (`code`, `name`, `description`, `systems`, `status`) VALUES
('P1', '项目一', '演示项目一', JSON_ARRAY(
    JSON_OBJECT('code', 'USER_CENTER', 'name', '用户中心'),
    JSON_OBJECT('code', 'ORDER_CENTER', 'name', '订单中心'),
    JSON_OBJECT('code', 'DASHBOARD', 'name', '仪表盘')
), 'ENABLED'),
('P2', '项目二', '演示项目二', JSON_ARRAY(
    JSON_OBJECT('code', 'USER_CENTER', 'name', '用户中心'),
    JSON_OBJECT('code', 'PRODUCT_CENTER', 'name', '商品中心')
), 'ENABLED');
```

### 3.2 权限点数据 —— 新增 `project_id` 字段

业务权限点关联到项目：P1 包含订单管理、用户管理、仪表盘模块；P2 包含用户中心、商品中心模块。权限中心管理权限保持全局（`project_id` 为 NULL）。

**订单管理模块（项目 P1）：**

```sql
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('ORDER_MGMT',     '订单管理',   'ORDER_CENTER', 'P1', 'MENU',   NULL,           1, 'ENABLED', '订单管理菜单'),
('ORDER_LIST',     '订单列表',   'ORDER_CENTER', 'P1', 'PAGE',   'ORDER_MGMT',   1, 'ENABLED', '订单列表页面'),
('ORDER_VIEW',     '查看订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   1, 'ENABLED', '查看订单详情'),
('ORDER_CREATE',   '创建订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   2, 'ENABLED', '创建新订单'),
('ORDER_APPROVE',  '审批订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   3, 'ENABLED', '审批订单'),
('ORDER_DELETE',   '删除订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   4, 'ENABLED', '删除订单');
```

**用户管理模块（项目 P1）：**

```sql
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_MGMT',      '用户管理',   'USER_CENTER', 'P1', 'MENU',   NULL,           2, 'ENABLED', '用户管理菜单'),
('USER_LIST',      '用户列表',   'USER_CENTER', 'P1', 'PAGE',   'USER_MGMT',    1, 'ENABLED', '用户列表页面'),
('USER_VIEW',      '查看用户',   'USER_CENTER', 'P1', 'ACTION', 'USER_LIST',    1, 'ENABLED', '查看用户详情'),
('USER_EDIT',      '编辑用户',   'USER_CENTER', 'P1', 'ACTION', 'USER_LIST',    2, 'ENABLED', '编辑用户信息');
```

**仪表盘模块（项目 P1）：**

```sql
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('DASHBOARD_MGMT', '仪表盘',     'DASHBOARD',   'P1', 'MENU',   NULL,           3, 'ENABLED', '仪表盘菜单'),
('DASHBOARD_VIEW', '查看仪表盘', 'DASHBOARD',   'P1', 'PAGE',   'DASHBOARD_MGMT', 1, 'ENABLED', '查看仪表盘页面');
```

**用户中心模块（项目 P2）：**

```sql
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_CENTER_P2',  '用户中心',   'USER_CENTER',    'P2', 'MENU',   NULL,              1, 'ENABLED', '用户中心菜单'),
('USER_LIST_P2',    '用户列表',   'USER_CENTER',    'P2', 'PAGE',   'USER_CENTER_P2',  1, 'ENABLED', '用户列表页面'),
('USER_VIEW_P2',    '查看用户',   'USER_CENTER',    'P2', 'ACTION', 'USER_LIST_P2',    1, 'ENABLED', '查看用户详情'),
('USER_CREATE_P2',  '创建用户',   'USER_CENTER',    'P2', 'ACTION', 'USER_LIST_P2',    2, 'ENABLED', '创建新用户');
```

**商品中心模块（项目 P2）：**

```sql
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('PRODUCT_CENTER_P2', '商品中心', 'PRODUCT_CENTER', 'P2', 'MENU',   NULL,                1, 'ENABLED', '商品中心菜单'),
('PRODUCT_LIST_P2',   '商品列表', 'PRODUCT_CENTER', 'P2', 'PAGE',   'PRODUCT_CENTER_P2', 1, 'ENABLED', '商品列表页面'),
('PRODUCT_VIEW_P2',   '查看商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2',   1, 'ENABLED', '查看商品详情'),
('PRODUCT_CREATE_P2', '创建商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2',   2, 'ENABLED', '创建新商品');
```

**权限中心管理模块（全局，无 project_id）：**

保持不变，INSERT 语句中不包含 `project_id` 字段（默认 NULL）。

### 3.3 角色、角色-权限、用户-角色、用户直接权限、组织数据

与 main 分支的演示数据一致，无变更。

## 四、完整 V1 脚本

完整的 `V1__init_schema.sql` 文件位于：
`permission-bootstrap/src/main/resources/db/migration/V1__init_schema.sql`

该文件包含 12 张表的建表语句和所有演示数据，可直接作为参考。

