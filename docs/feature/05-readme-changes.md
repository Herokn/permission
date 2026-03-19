# 05 - README.md 变更

**文件**：`README.md`

README 中的功能列表和 API 文档需要更新，反映项目级权限隔离功能。

## 一、后端功能列表（约第 227 行起）

### 权限点管理

| 原文 | 改为 |
|------|------|
| 创建权限点：支持树形结构、parentCode | 创建权限点：支持树形结构、parentCode、projectId |
| 权限点列表：分页查询 | 权限点列表：分页查询，支持 projectId 筛选 |
| 权限树查询：返回树形结构 | 权限树查询：返回树形结构，支持 projectId 筛选 |

新增行：
```
| | 按项目查询全部权限点 | ✅ | /permissions/all 支持 projectId 参数 |
```

### 角色管理

| 原文 | 改为 |
|------|------|
| 创建角色：支持 roleScope/roleDomain | 创建角色：支持 roleScope/roleDomain、projectId |
| 角色列表：分页查询 | 角色列表：分页查询，支持 projectId 筛选 |

新增行：
```
| | 全局角色与项目角色 | ✅ | projectId=NULL 为全局角色，对所有项目生效 |
```

## 二、前端功能列表（约第 275 行起）

| 原文 | 改为 |
|------|------|
| 权限点列表：表格展示 | 权限点列表：表格展示，支持项目筛选 |
| 创建权限点：Modal 表单 | 创建权限点：Modal 表单，支持指定所属项目 |
| 权限树展示 | 权限树展示：按项目维度展示权限树 |
| 角色列表：表格展示 | 角色列表：表格展示，支持项目筛选 |
| 创建角色 | 创建角色：支持指定所属项目 |

## 三、部署运维表（约第 298 行起）

| 原文 | 改为 |
|------|------|
| Flyway 数据库迁移：V1~V5 迁移脚本已完成 | Flyway 数据库迁移：V1~V13 迁移脚本已完成 |

## 四、待完成功能表（约第 314 行起）

| 原文 | 改为 |
|------|------|
| 权限变更通知：已实现事件发布和监听机制 | 项目维度隔离：角色/权限点支持 projectId 隔离，V12/V13 迁移 |

## 五、API 文档（约第 693 行起）

### 权限点管理 API

```diff
-GET    /permissions        # 分页查询
-POST   /permissions        # 创建
-PUT    /permissions/{id}   # 更新
-DELETE /permissions/{id}   # 删除
-GET    /permissions/tree   # 权限树
-GET    /permissions/all    # 全部权限点
+GET    /permissions?projectId=xxx        # 分页查询，支持项目筛选
+POST   /permissions                       # 创建，可指定 projectId
+PUT    /permissions/{id}                  # 更新
+DELETE /permissions/{id}                  # 删除
+GET    /permissions/tree?projectId=xxx    # 权限树，支持项目筛选
+GET    /permissions/all?projectId=xxx     # 全部权限点，支持项目筛选
```

### 角色管理 API

```diff
-GET    /roles              # 分页查询
-GET    /roles/{id}         # 查询详情
-POST   /roles              # 创建
-PUT    /roles/{id}         # 更新
-DELETE /roles/{id}         # 删除
-PUT    /roles/{id}/permissions  # 分配权限
-GET    /roles/all          # 全部角色
+GET    /roles?projectId=xxx              # 分页查询，支持项目筛选
+GET    /roles/{id}                        # 查询详情
+POST   /roles                             # 创建，可指定 projectId
+PUT    /roles/{id}                        # 更新
+DELETE /roles/{id}                        # 删除
+PUT    /roles/{id}/permissions            # 分配权限
+GET    /roles/all                         # 全部角色
```

