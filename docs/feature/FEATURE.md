# feat/project-scope-permission 功能变更总览

> 本文档描述 `feat/project-scope-permission` 分支相对于 `main` 分支的所有变更。
> 目标：在另一台电脑的 main 分支上，按照本文档可以完整复现当前分支的所有功能。

## 一、功能概述

本分支实现了 **项目级权限隔离** 功能，核心变更包括：

1. **数据库迁移脚本合并重构** — 将 V1~V11 的迁移脚本合并为单个 V1，包含完整表结构 + 演示数据
2. **项目-系统模块关联** — 项目表新增 `systems` JSON 字段，支持配置项目下的系统模块
3. **权限点项目隔离** — 权限点表新增 `project_id` 字段，支持按项目过滤权限
4. **角色项目隔离** — 角色表新增 `project_id` 字段，支持按项目过滤角色
5. **API 层项目过滤** — 权限/角色的查询接口新增 `projectId` 参数
6. **前端项目选择器** — 权限管理、角色管理、用户授权页面增加项目选择器
7. **前端权限树重构** — 权限页面改为卡片式分组展示（菜单→页面→操作）
8. **用户授权页面重构** — 改为按项目维度的权限树 checkbox 批量授权
9. **路由守卫增强** — ProtectedRoute 改为异步 token 验证
10. **菜单权限优化** — 超级管理员直接显示所有菜单
11. **项目创建自动创建管理员角色** — 创建项目时自动创建 `{projectCode}_ADMIN` 角色
12. **配置默认值** — application.yml 增加开发环境默认密码

## 二、变更文件清单

### 数据库（详见 [01-database-schema.md](./01-database-schema.md)）
| 操作 | 文件 |
|------|------|
| 重写 | `permission-bootstrap/src/main/resources/db/migration/V1__init_schema.sql` |
| 删除 | `V2__init_demo_data.sql` ~ `V11__add_project_id_to_org_role.sql`（共10个文件） |

### 后端 Java（详见 [02-backend-changes.md](./02-backend-changes.md)）
| 层级 | 文件 | 变更 |
|------|------|------|
| DAL | `PermissionDO.java` | 新增 `projectId` 字段 |
| DAL | `RoleDO.java` | 新增 `projectId` 字段 |
| DAL | `ProjectDO.java` | 新增 `systems` JSON 字段 + `SystemModule` 内部类 |
| DTO | `CreatePermissionDTO.java` | 新增 `projectId` 字段 |
| DTO | `CreateRoleDTO.java` | 新增 `projectId` 字段 |
| DTO | `CreateProjectDTO.java` | 新增 `systems` 字段 + `SystemModuleDTO` 内部类 |
| DTO | `UpdateProjectDTO.java` | 新增 `systems` 字段 + `SystemModuleDTO` 内部类 |
| VO | `PermissionVO.java` | 新增 `projectId` 字段 |
| VO | `RoleVO.java` | 新增 `projectId` 字段 |
| VO | `ProjectVO.java` | 新增 `systems` 字段 + `SystemModuleVO` 内部类 |
| Service接口 | `PermissionService.java` | 新增 `pageWithProjectFilter`、`listAllWithProjectFilter` |
| Service接口 | `RoleService.java` | 新增 `existsByCode`、`pageWithProjectFilter` |
| Service实现 | `PermissionServiceImpl.java` | 实现上述两个方法 |
| Service实现 | `RoleServiceImpl.java` | 实现上述两个方法 |
| Service实现 | `AuthzServiceImpl.java` | 优化 `getUserPermissionCodes` 逻辑 + 移除冗余日志 |
| Manager接口 | `PermissionManager.java` | 新增 3 个项目过滤方法 |
| Manager接口 | `RoleManager.java` | 新增 1 个项目过滤方法 |
| Manager实现 | `PermissionManagerImpl.java` | 实现项目过滤查询 + 权限树 |
| Manager实现 | `ProjectManagerImpl.java` | 系统模块支持 + 自动创建项目管理员角色 |
| Manager实现 | `RoleManagerImpl.java` | 项目过滤查询 + 自动设置 projectId |
| Controller | `PermissionController.java` | 3 个接口新增 `projectId` 参数 |
| Controller | `RoleController.java` | 1 个接口新增 `projectId` 参数 |

### 前端（详见 [03-frontend-changes.md](./03-frontend-changes.md)）
| 文件 | 变更 |
|------|------|
| `types/index.ts` | 类型定义新增 `projectId`、`SystemModule` 等字段 |
| `services/api.ts` | `listPermissions`、`listAllPermissions` 支持 `projectId` 参数 |
| `pages/PermissionPage.txt` | 整体重构为卡片式分组 + 项目选择器 |
| `pages/ProjectPage.tsx` | 系统模块管理 UI |
| `pages/RolePage.tsx` | 新增项目列选择 + 所属项目列 |
| `pages/UserGrantPage.tsx` | 重构为按项目维度的权限树 checkbox |
| `pages/UserGrantPage.module.css` | 新增权限树样式 |
| `components/ProtectedRoute.tsx` | 异步 token 验证 |
| `layouts/MainLayout.tsx` | 超级管理员菜单优化 |

### 配置（详见 [04-config-changes.md](./04-config-changes.md)）
| 文件 | 变更 |
|------|------|
| `application.yml` | 数据库密码、JWT Secret、用户密码增加默认值 |

### 文档
| 文件 | 变更 |
|------|------|
| `README.md` | 功能列表、API 文档更新（详见 [05-readme-changes.md](./05-readme-changes.md)） |

### 构建产物（无需手动处理）
| 文件 | 变更 |
|------|------|
| `permission-web-frontend/dist/index.html` | 前端重新构建后 JS hash 自动变化 |

## 三、部署注意事项

1. **必须重建数据库** — 由于迁移脚本从多文件合并为单个 V1，已有的 Flyway 历史会冲突。需要：
   ```sql
   DROP DATABASE IF EXISTS permission;
   CREATE DATABASE permission DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. 重启后端后 Flyway 会自动执行 V1 脚本，创建所有表并插入演示数据
3. 前端无需额外操作，代码变更即可

