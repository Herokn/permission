# 项目（Project）模型与前台联动说明

## 概念对齐

| 概念 | 含义 |
|------|------|
| **项目（`project` 表）** | 内置仅 **用户中心（UC）**、**权限中心（PC）**，与左侧主导航两大入口一一对应；可按需新建其它项目。**未启用（非 ENABLED）** 的项目：下拉中不展示（`/projects/all` 仅启用项），且 **不可对用户做该项目下的角色/直接权限授权**；按项目过滤的权限点列表也会为空。 |
| **系统模块（`project.systems` JSON）** | 项目下的功能分组，用于「权限点管理」里选择**所属项目**后联动 **systemCode**（如 `UC_USER`、`PC_ROLE`）。 |
| **权限点（`permission` 表）** | 接口鉴权使用 **`USER_CENTER_*`**、**`PERMISSION_CENTER_*`**。用户中心侧 **`USER_CENTER_*`** 在库中挂在项目 **UC** 的菜单树下（如 `USER_MGMT` → `USER_LIST` → 各 ACTION），用户授权页选 UC 时与接口码一致；权限中心侧 PERM 树仍为全局 `project_id` 为空。 |
| **角色** | 仅 **系统管理员（`SUPER_ADMIN`）** 为 **GLOBAL**；其余预置角色均为 **PROJECT**，并绑定 **UC**（用户中心域）或 **PC**（权限中心域）。`role_permission` 挂载权限点；**用户授权**按**登录账号**查询业务用户后分配角色/直接权限。下拉角色列表调用 **`GET /api/roles/all?projectId=当前项目`**，服务端过滤：**全局角色 + `project_id` 等于当前项目的项目角色**；**`PERM_CENTER` 域 / `PERM_CENTER_ADMIN` 仅出现在 `projectId=PC`**；若历史数据把 **`PERM_CENTER_ADMIN` 误标为 `GLOBAL`**，在 UC 上下文中也会隐藏。演示数据不再包含 **`ORG_ADMIN`**（与 **`USER_ORG_MANAGER`** 重叠），已有库可执行 `db/remove_demo_org_admin_role.sql`。 |
| **审计日志** | 列表仅展示 **权限中心域**：模块 `ROLE`、`PERMISSION`、`USER_AUTH`（不含用户中心组织操作）。 |

## 内置项目编码

- **UC**：用户中心 — 用户管理、组织与层级管理、岗位管理。
- **PC**：权限中心 — 项目管理、权限点管理、角色管理、用户授权、审计日志。

## 数据清理（旧库曾含 P1/P2 演示项目）

执行：`permission-bootstrap/src/main/resources/db/remove_p1_p2_demo_projects.sql`  
全新环境直接使用 `init_full.sql` 即可（仅 UC/PC）。

## 多节点权限验收（简要）

1. 仅用户中心管理员：仅有 `USER_CENTER_USER_*` → 只能用户管理相关 Tab。  
2. 仅组织管理员：仅有 `USER_CENTER_ORG_*` → 只能组织管理。  
3. 仅权限中心管理员：仅有 `PERMISSION_CENTER_*` 等 → 只能权限中心各 Tab。  

接口需携带登录 Cookie 或合法 Token。
