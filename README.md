# 统一权限管理平台 (Permission Center)

一个企业级的统一权限管理平台，为多个业务系统提供统一的权限管理与鉴权能力。

> **开发模式**：本项目采用 **[SDD（Software Design & Development）规范驱动开发流程](spec/SDD-WORKFLOW.md)**，将需求分析、系统设计、代码实现的开发规范结构化，便于 AI 辅助开发和团队协作。

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [核心设计](#核心设计)
- [数据模型](#数据模型)
- [快速开始](#快速开始)
- [功能列表](#功能列表)
- [验证测试](#验证测试)
- [技术决策与设计权衡](#技术决策与设计权衡)

---

## 项目简介

本系统是一个统一权限中心（Permission Center），为多个业务系统提供统一的权限管理与鉴权能力。

**核心特性：**
- 采用**仅权限点模型**：权限中心只管理 `permissionCode`，不直接管理菜单、页面或资源实体
- 支持**多项目维度**的权限隔离（projectId）
- 支持**角色授权 + 用户直接授权 + 用户直接排除权限（DENY）**
- 提供**统一鉴权接口**，业务系统可快速接入
- **集成用户管理中心**：支持用户、组织、岗位的统一管理
- **审计日志**：完整记录权限变更操作

**业务场景：**
```
业务系统 A ──┐
业务系统 B ──┼──► 权限中心 ──► 鉴权结果
业务系统 C ──┘
```

---

## 技术栈

### 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17+ | 运行环境 |
| Spring Boot | 3.2.5 | 基础框架 |
| MyBatis-Plus | 3.5.6 | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.x | 缓存 |
| Knife4j | 4.5.0 | API 文档 |
| MapStruct | 1.5.5.Final | 对象映射 |
| Caffeine | 3.1.8 | 本地缓存 |
| Lombok | 1.18.32 | 代码简化 |

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5.x | 类型支持 |
| Vite | 5.x | 构建工具 |
| Ant Design | 5.x | UI 组件库 |
| React Router | 6 | 路由管理 |

### 用户中心前端（集成）
| 技术 | 版本 | 说明 |
|------|------|------|
| Vue | 3 | UI 框架 |
| TDesign | Next | UI 组件库 |
| Vite | 5.x | 构建工具 |

---

## 核心设计

### 权限判断优先级

```
1. 用户直接 DENY  ──────► 拒绝（最高优先级）
        ↓
2. 用户直接 ALLOW ──────► 允许
        ↓
3. 用户角色权限  ──────► 允许/继续
        ↓
4. 组织角色权限  ──────► 允许/继续
        ↓
5. 默认拒绝    ──────────► 拒绝
```

### projectId 规则

| 配置 | 说明 | 生效范围 |
|------|------|----------|
| projectId = NULL | 全局权限 | 所有项目 |
| projectId = "P1" | 项目级权限 | 仅项目 P1 |

### DENY 覆盖规则

```
用户 U1 配置：
  - P1 角色：PROJECT_MANAGER（有审批权）
  - P1 直接权限：ORDER_APPROVE = DENY

check(U1, ORDER_APPROVE, P1) → ❌ 拒绝
原因：被直接 DENY 覆盖（项目 P1）
```

📖 **详细设计文档**：[docs/repo-wiki/](docs/repo-wiki/)

---

## 数据模型

### 核心表结构

```
permission          # 权限点表（树形结构）
project             # 项目表
role                # 角色表（scope + domain）
role_permission     # 角色-权限关联
user                # 用户表
user_role           # 用户-角色关联（含 projectId）
user_permission     # 用户直接权限（ALLOW/DENY）
organization        # 组织架构表
user_org            # 用户-组织关联
position            # 岗位表
org_position        # 组织-岗位关联
org_role            # 组织-角色关联
audit_log           # 审计日志
```

### ER 图

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  permission  │◄────│ role_permission  │────►│    role      │
└──────────────┘     └──────────────────┘     └──────────────┘
                                                       │
┌──────────────┐     ┌──────────────────┐              │
│  user_role   │────►│   user_permission│              │
└──────────────┘     └──────────────────┘              │
      │                                               │
      ▼                                               ▼
┌──────────────┐                              ┌──────────────┐
│    user      │◄─────┌──────────────┐        │   org_role   │
└──────────────┘       │user_org      │        └──────────────┘
        ▲              └──────────────┘              ▲
        │                     │                       │
        │                     ▼                       │
        │            ┌──────────────┐                │
        │            │organization  │                │
        │            └──────────────┘                │
        │                     │                       │
        │              ┌──────────────┐              │
        └──────────────│  position    │──────────────┘
                       └──────────────┘
```

📂 **数据库脚本**：
- **完整初始化脚本（推荐）**：[permission-bootstrap/src/main/resources/db/init_full.sql](permission-bootstrap/src/main/resources/db/init_full.sql)
  - 一键初始化：表结构 + 基础数据 + 演示数据

---

## 快速开始

### 环境要求

- Docker Desktop（含 Compose 插件）
- Windows 推荐 PowerShell 5+；Linux/macOS 可直接运行 `.sh`

### 配置文件

```bash
cp .env.example .env
```

本地 Docker：在 `.env` 中设置 **至少 32 字符** 的 `JWT_SECRET`（勿使用曾在模板中出现的固定弱串）。

```env
DB_PASSWORD=root123
JWT_SECRET=<你的随机密钥至少32字符>
AUTH_ADMIN_PASS=admin123
AUTH_USER1_PASS=user123
```

### 启动模式

#### 1) core 模式（仅权限中心）

```bash
docker compose up -d --build mysql redis backend frontend
```

或脚本方式：

```bash
./start-all.sh core
```

Windows:

```powershell
.\start-all.ps1 core
```

#### 2) user-center 模式（权限中心 + 用户中心）

```bash
./start-all.sh user-center
```

Windows:

```powershell
.\start-all.ps1 user-center
```

#### 3) micro-frontend 模式（含 mf-shell 微前端基座）

```bash
./start-all.sh micro-frontend
```

#### 4) full 模式（全部服务）

```bash
./start-all.sh full
# 或直接
./start-all.sh
```

Windows:

```powershell
.\start-all.ps1
```

### 停止服务

```bash
./stop-all.sh
```

Windows:

```powershell
.\stop-all.ps1
```

### 访问地址

| 服务 | 地址 | 端口 |
|------|------|------|
| 权限中心前端 | http://localhost:3000 | 3000 |
| 权限中心后端 API | http://localhost:8080/api | 8080 |
| 权限中心 API 文档 | http://localhost:8080/api/doc.html | 8080 |
| MySQL | localhost | 3306 |
| Redis | localhost | 6379 |

### 测试账号

| 角色 | 用户名 | 密码 | 权限说明 |
|------|--------|------|----------|
| 超级管理员 | admin | admin123 | 所有权限 |
| 权限中心管理员 | perm_center_admin | perm_center_admin | 管理角色、权限点、用户授权 |
| 用户中心管理员 | user_center_admin | user_center_admin | 用户、组织、岗位全部权限 |
| 普通用户 | normal_user | normal_user | 基本查看权限 |

---

## 功能列表

### 后端功能

| 功能模块 | 功能点 | 状态 | 说明 |
|---------|--------|:----:|------|
| **权限点管理** | 创建权限点 | ✅ | 支持树形结构、parentCode、projectId |
| | 编辑权限点 | ✅ | 支持修改名称、类型、描述 |
| | 删除权限点 | ✅ | 级联校验子权限点 |
| | 权限点列表 | ✅ | 分页查询，支持 projectId 筛选 |
| | 权限树查询 | ✅ | 返回树形结构，支持 projectId 筛选 |
| **角色管理** | 创建角色 | ✅ | 支持 roleScope/roleDomain、projectId |
| | 编辑角色 | ✅ | |
| | 删除角色 | ✅ | 校验是否有关联用户 |
| | 分配权限 | ✅ | 角色-权限点关联 |
| | 角色列表 | ✅ | 分页查询，支持 projectId 筛选 |
| | 全局角色与项目角色 | ✅ | projectId=NULL 为全局角色，对所有项目生效 |
| **项目管理** | 项目 CRUD | ✅ | 支持项目创建、编辑、删除、查询 |
| | 项目列表 | ✅ | 分页查询所有项目 |
| **用户授权** | 分配角色 | ✅ | 支持指定 projectId |
| | 移除角色 | ✅ | |
| | 授予直接权限 | ✅ | 支持 ALLOW/DENY |
| | 移除直接权限 | ✅ | |
| | 查询用户授权详情 | ✅ | |
| | 批量分配角色 | ✅ | /user-auth/roles/batch-assign |
| | 批量移除角色 | ✅ | /user-auth/roles/batch-revoke |
| | 批量授予权限 | ✅ | /user-auth/permissions/batch-grant |
| | 批量移除权限 | ✅ | /user-auth/permissions/batch-revoke |
| **统一鉴权** | 单个权限检查 | ✅ | /authz/check |
| | 批量权限检查 | ✅ | /authz/check-batch |
| | 鉴权结果缓存 | ✅ | Redis 缓存 + 权限变更自动失效 |
| **用户管理** | 用户 CRUD | ✅ | 创建、编辑、删除、查询用户 |
| | 启用/禁用用户 | ✅ | 用户状态管理 |
| | 重置密码 | ✅ | 管理员重置用户密码 |
| **组织架构** | 组织树管理 | ✅ | 支持树形结构 |
| | 组织成员管理 | ✅ | 添加/移除组织成员 |
| | 主组织设置 | ✅ | 设置用户主组织 |
| | 分配组织角色 | ✅ | 组织权限继承 |
| **岗位管理** | 岗位 CRUD | ✅ | 创建、编辑、删除岗位 |
| | 组织岗位配置 | ✅ | 为组织配置可用岗位 |
| **认证** | 登录 | ✅ | 用户名密码登录 |
| | 登出 | ✅ | |
| | 获取当前用户 | ✅ | |
| | Session 管理 | ✅ | 支持会话缓存 |
| **审计日志** | 操作日志记录 | ✅ | @AuditLog 注解 + AOP |
| | 审计日志查询 | ✅ | 分页查询、筛选 |
| **数据权限** | 数据权限规则 | ✅ | 规则定义和存储 |
| | 数据权限切面 | ✅ | @DataPermission 注解 |
| | 数据权限上下文 | ✅ | ThreadLocal 传递 |
| **权限变更通知** | 事件发布 | ✅ | PermissionChangedEvent |
| | 事件监听 | ✅ | 异步处理通知 |

### 前端功能

| 功能模块 | 功能点 | 状态 | 说明 |
|---------|--------|:----:|------|
| **登录模块** | 登录页面 | ✅ | 带动画效果 |
| | 登录状态校验 | ✅ | ProtectedRoute |
| **权限点管理** | 权限点列表 | ✅ | 表格展示，支持项目筛选 |
| | 创建权限点 | ✅ | Modal 表单，支持指定所属项目 |
| | 编辑权限点 | ✅ | |
| | 删除权限点 | ✅ | 确认弹窗 |
| | 权限树展示 | ✅ | 按项目维度展示权限树 |
| **角色管理** | 角色列表 | ✅ | 表格展示，支持项目筛选 |
| | 创建角色 | ✅ | 支持指定所属项目 |
| | 编辑角色 | ✅ | |
| | 删除角色 | ✅ | |
| | 分配权限 | ✅ | Transfer 穿梭框 |
| **项目管理** | 项目列表 | ✅ | 表格展示所有项目 |
| | 创建项目 | ✅ | Modal 表单 |
| | 编辑项目 | ✅ | |
| | 删除项目 | ✅ | 确认弹窗 |
| **用户授权** | 用户查询 | ✅ | |
| | 分配角色 | ✅ | 支持选择项目 |
| | 移除角色 | ✅ | |
| | 授予/排除权限 | ✅ | 支持 ALLOW/DENY |
| | 移除直接权限 | ✅ | |
| **用户管理** | 用户列表 | ✅ | 分页查询、搜索 |
| | 用户详情 | ✅ | 查看用户基本信息 |
| | 用户创建 | ✅ | 新建用户 |
| | 用户编辑 | ✅ | 修改用户信息 |
| | 用户删除 | ✅ | 逻辑删除 |
| | 启用/禁用 | ✅ | 用户状态管理 |
| | 重置密码 | ✅ | 管理员重置用户密码 |
| **组织管理** | 组织树展示 | ✅ | 三级架构：公司-部门-组 |
| | 组织 CRUD | ✅ | 创建、编辑、删除组织 |
| | 组织成员管理 | ✅ | 添加/移除组织成员 |
| | 主组织设置 | ✅ | 设置用户主组织 |
| **岗位管理** | 岗位列表 | ✅ | 岗位体系管理 |
| | 岗位 CRUD | ✅ | 创建、编辑、删除岗位 |
| | 组织岗位配置 | ✅ | 为组织配置可用岗位 |
| **权限测试** | 鉴权测试页面 | ✅ | 可输入参数测试 |
| **审计日志** | 审计日志列表 | ✅ | 分页查询、筛选 |
| | 操作详情查看 | ✅ | 查看具体变更内容 |
| **布局** | 响应式布局 | ✅ | Ant Design Layout |
| | 导航菜单 | ✅ | 侧边栏 |

### 基础设施

| 功能 | 状态 | 说明 |
|------|:----:|------|
| Docker 部署 | ✅ | 多阶段构建，支持多种启动模式 |
| 一键部署脚本 | ✅ | deploy/start/stop 的 sh + ps1 双版本 |
| Swagger API 文档 | ✅ | 集成 Knife4j |
| 代码规范 (spec) | ✅ | PRD、设计规范、代码规范 |
| CI/CD | ✅ | GitHub Actions 自动化构建测试 |
| 单元测试 | ✅ | JaCoCo 代码覆盖率报告 |

---

## 验证测试

### 演示数据

系统预置了以下测试数据：

**用户：**
- U1：P1 项目经理
- U2：P1 项目成员

**权限点：**
- ORDER_VIEW：查看订单
- ORDER_CREATE：创建订单
- ORDER_APPROVE：审批订单

**角色：**
- PROJECT_MANAGER：项目经理（含审批权）
- PROJECT_MEMBER：项目成员（无审批权）

### 验证场景

| 场景 | 输入 | 预期结果 |
|------|------|----------|
| 角色权限生效 | U1 + ORDER_APPROVE + P1 | ✅ 允许 |
| 跨项目隔离 | U1 + ORDER_APPROVE + P2 | ❌ 拒绝 |
| 角色权限差异 | U2 + ORDER_APPROVE + P1 | ❌ 拒绝 |
| DENY 覆盖 | U1 + ORDER_APPROVE + P1 (DENY) | ❌ 拒绝 |

### 验证方式

**方式 1：前端测试页面**

访问「权限测试」页面，输入 userId、permissionCode、projectId 进行测试。

**方式 2：curl 命令**

```bash
# 先登录获取 Cookie
curl -s -c /tmp/perm_cookie.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'

# U1 在 P1 审批订单（有权限）
curl -s -b /tmp/perm_cookie.txt -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P1"}'

# U1 在 P2 审批订单（无权限）
curl -s -b /tmp/perm_cookie.txt -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P2"}'
```

**方式 3：Swagger 测试**

访问 http://localhost:8080/api/doc.html，找到 `/authz/check` 接口进行测试。

---

## 技术决策与设计权衡

### 1. 缓存策略：Redis 缓存集成

项目已集成 Redis 缓存，用于存储用户鉴权结果，提升系统性能。

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Redis 缓存（当前采用）** | 减少数据库查询，QPS 更高，支持分布式 | 需要维护 Redis 集群高可用 |
| 本地缓存（Caffeine） | 无网络开销，延迟更低 | 集群环境下一致性问题严重 |
| 直接查库 | 数据强一致，逻辑简单 | 高并发下数据库压力大 |

**当前选择：Redis 缓存 + 权限变更自动失效**

### 2. 分层架构：六层架构

```
permission-bootstrap  (启动层)
       ↓
permission-web        (控制器层：参数校验、异常转换)
       ↓
permission-biz        (业务编排层：复杂业务逻辑编排)
       ↓
permission-service    (服务层：单一领域逻辑)
       ↓
permission-dal        (数据访问层：数据库操作)
       ↓
permission-common     (公共层：工具类、常量、异常)
```

**与常见三层架构的对比：**

| 架构 | 优点 | 缺点 |
|------|------|------|
| 三层（Controller-Service-Dao） | 简单，适合小项目 | Service 层容易臃肿 |
| **六层（当前采用）** | 职责清晰，便于并行开发 | 模块间调用链较长 |

### 3. 认证方案：JWT

| 方案 | 优点 | 缺点 |
|------|------|------|
| Session + Cookie | 服务端可控，可主动踢人 | 需要共享存储，水平扩展复杂 |
| **JWT（当前采用）** | 无状态，天然支持水平扩展 | 无法主动失效，Token 泄露风险 |

**选择：JWT + 短过期时间 + Refresh Token**

### 4. 数据库设计：permissionCode 用字符串

| 方案 | 优点 | 缺点 |
|------|------|------|
| 数字 ID（BIGINT） | 存储小，索引快 | 不直观，需要额外映射表 |
| **字符串 Code（当前采用）** | 语义清晰，便于调试 | 索引稍大 |

**选择：字符串 Code**

理由：
1. **可读性**：日志中直接看到 `ORDER_APPROVE` 而不是 `10023`
2. **业务系统友好**：调用方不需要维护 ID 映射

---

## 项目结构

```
permission/
├── permission-bootstrap/      # 启动模块
├── permission-web/            # Web 控制器层
├── permission-biz/            # 业务逻辑层
│   ├── manager/              # 业务管理器接口
│   └── impl/                 # 业务管理器实现
│   ├── aspect/               # AOP 切面（审计日志、数据权限）
│   └── audit/                # 审计日志记录器
├── permission-service/        # 服务层
├── permission-dal/            # 数据访问层
├── permission-common/         # 公共模块
├── permission-user/           # 用户模块
├── permission-test/           # 测试模块
├── permission-web-frontend/   # 前端项目（React）
│   └── src/
│       ├── pages/            # 页面组件
│       │   ├── user-center/  # 用户中心相关页面
│       │   ├── PermissionPage.tsx
│       │   ├── RolePage.tsx
│       │   ├── UserGrantPage.tsx
│       │   ├── ProjectPage.tsx
│       │   ├── AuditLogPage.tsx
│       │   └── ...
│       ├── components/       # 公共组件
│       ├── services/         # API 服务
│       └── utils/            # 工具函数
│
├── spec/                      # 📋 规范定义（SDD 核心）
│   ├── PRD/                  # 产品需求文档
│   ├── docs/                 # 详细设计文档
│   │   └── BE-DESIGN/       # 后端设计文档
│   ├── code-spec/            # 代码规范
│   ├── be-design-spec.md     # 后端设计规范
│   ├── prd-spec.md           # PRD 编写规范
│   └── SDD-WORKFLOW.md       # SDD 工作流说明
│
├── docs/                      # 📚 文档
│   └── repo-wiki/            # 模块文档
│
├── scripts/                   # 🔧 脚本工具
├── docker/                    # 🐳 Docker 配置
├── deploy.sh                  # Linux/macOS 构建脚本
├── start-all.sh               # Linux/macOS 启动脚本
├── stop-all.sh                # Linux/macOS 停止脚本
├── deploy.ps1                 # Windows 构建脚本
├── start-all.ps1              # Windows 启动脚本
├── stop-all.ps1               # Windows 停止脚本
├── docker-compose.yml         # Docker Compose 配置
└── README.md                  # 项目说明
```

---

## API 接口

### 认证接口
```
POST /api/auth/login              # 登录
POST /api/auth/logout             # 退出
GET  /api/auth/current-user       # 获取当前用户
```

### 权限点管理
```
GET    /api/permissions                    # 分页查询
POST   /api/permissions                   # 创建
PUT    /api/permissions/{id}              # 更新
DELETE /api/permissions/{id}              # 删除
GET    /api/permissions/tree              # 权限树
GET    /api/permissions/all               # 全部权限点
```

### 角色管理
```
GET    /api/roles                  # 分页查询
POST   /api/roles                  # 创建
PUT    /api/roles/{id}             # 更新
DELETE /api/roles/{id}             # 删除
PUT    /api/roles/{id}/permissions # 分配权限
GET    /api/roles/all              # 全部角色
```

### 项目管理
```
GET    /api/projects               # 分页查询
POST   /api/projects               # 创建
PUT    /api/projects/{id}          # 更新
DELETE /api/projects/{id}          # 删除
GET    /api/projects/all           # 全部项目
```

### 用户授权
```
GET  /api/user-auth/{userId}                   # 获取授权详情
POST /api/user-auth/roles/assign               # 分配角色
POST /api/user-auth/roles/revoke               # 移除角色
POST /api/user-auth/roles/batch-assign         # 批量分配角色
POST /api/user-auth/roles/batch-revoke         # 批量移除角色
POST /api/user-auth/permissions/grant          # 授予/排除权限
POST /api/user-auth/permissions/revoke         # 移除直接权限
POST /api/user-auth/permissions/batch-grant    # 批量授予权限
POST /api/user-auth/permissions/batch-revoke   # 批量移除权限
```

### 统一鉴权
```
POST /api/authz/check         # 单个权限检查
POST /api/authz/check-batch   # 批量权限检查
```

### 用户管理
```
GET    /api/users             # 分页查询
POST   /api/users             # 创建用户
PUT    /api/users/{id}        # 编辑用户
DELETE /api/users/{id}        # 删除用户
PUT    /api/users/{id}/enable # 启用/禁用
PUT    /api/users/{id}/password # 重置密码
```

### 组织管理
```
GET    /api/organizations                  # 组织树
POST   /api/organizations                  # 创建组织
PUT    /api/organizations/{id}             # 更新组织
DELETE /api/organizations/{id}             # 删除组织
POST   /api/organizations/{orgId}/members  # 添加组织成员
DELETE /api/organizations/{orgId}/members/{userId}  # 移除组织成员
```

### 岗位管理
```
GET    /api/positions             # 分页查询
POST   /api/positions             # 创建岗位
PUT    /api/positions/{id}        # 编辑岗位
DELETE /api/positions/{id}        # 删除岗位
GET    /api/positions/org/{orgId} # 组织可用岗位
POST   /api/positions/org/{orgId} # 配置组织岗位
```

### 审计日志
```
GET /api/audit-logs    # 分页查询审计日志
```

---

## SDD 开发流程

本项目采用 **SDD（Software Design & Development）规范驱动开发流程**，将需求分析、系统设计、代码实现的开发规范结构化，便于 AI 辅助开发和团队协作。

📖 **详细流程文档**：[spec/SDD-WORKFLOW.md](spec/SDD-WORKFLOW.md)

### 核心流程

```
需求分析(PRD) → 系统设计 → 人工评审 → AI Plan生成 → 代码实现 → 验证沉淀
```

### SDD 文档结构

| 目录 | 说明 |
|------|------|
| `spec/PRD/` | 模块级需求文档 |
| `spec/docs/BE-DESIGN/` | 系分设计文档 |
| `spec/code-spec/` | 编码规范 |
| `docs/repo-wiki/` | 模块文档 |

---

## 生产部署安全须知

> 本项目 `application.yml` 中的敏感配置均已支持**环境变量覆盖**，开发环境使用默认值即可，**生产环境必须通过环境变量注入真实值**。

### 必须覆盖的环境变量

| 环境变量 | 说明 | 默认值（仅开发用） |
|---------|------|-------------------|
| `DB_PASSWORD` | 数据库密码 | `root123` |
| `JWT_SECRET` | JWT 签名密钥（至少256位） | 占位符字符串 |
| `AUTH_ADMIN_PASS` | 管理员密码 | `admin123` |

### Docker 部署示例

```bash
# 生产环境部署：通过环境变量注入敏感配置
DB_PASSWORD=<强密码> JWT_SECRET=<随机256位密钥> docker compose up -d
```

### 安全检查清单

- [ ] 替换 JWT Secret 为随机生成的强密钥
- [ ] 替换数据库密码为强密码
- [ ] 生产环境对接企业 SSO/OAuth2
- [ ] 确认 `.env` 文件不被 Git 追踪（已在 `.gitignore` 中排除）
- [ ] 日志级别设为 INFO 或 WARN
- [ ] 关闭 DEBUG 模式

---

## License

MIT
