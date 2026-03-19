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
| Spring Boot | 3.x | 基础框架 |
| MyBatis-Plus | 3.x | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| Redis | 7.x | 缓存（可选） |
| Flyway | 9.x | 数据库迁移 |
| JWT | - | 认证方案 |

### 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5.x | 类型支持 |
| Vite | 5.x | 构建工具 |
| Ant Design | 5.x | UI 组件库 |
| React Router | 6 | 路由管理 |

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

📖 **详细设计文档**：[docs/DESIGN.md](docs/DESIGN.md)

---

## 数据模型

### 核心表结构

```
permission          # 权限点表（树形结构）
role                # 角色表（scope + domain）
role_permission     # 角色-权限关联
user_role           # 用户-角色关联（含 projectId）
user_permission     # 用户直接权限（ALLOW/DENY）
organization        # 组织架构表
user_org            # 用户-组织关联
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
│    user      │                              │   org_role   │
└──────────────┘                              └──────────────┘
```

📂 **数据库脚本**：
- 建表 SQL：[permission-bootstrap/src/main/resources/db/migration/V1__init_schema.sql](permission-bootstrap/src/main/resources/db/migration/V1__init_schema.sql)
- 演示数据：[permission-bootstrap/src/main/resources/db/migration/V2__init_demo_data.sql](permission-bootstrap/src/main/resources/db/migration/V2__init_demo_data.sql)

---

## 快速开始

### 环境要求

- Docker & Docker Compose（推荐）
- 或手动环境：JDK 17+、Node.js 16+、MySQL 8.0+、Redis 7+

### 方式一：Docker 一键部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Herokn/permission.git
cd permission

# 2. 一键启动所有服务（MySQL + Redis + 后端 + 前端）
docker-compose up -d

# 3. 查看服务状态
docker-compose ps

# 4. 停止服务
docker-compose down
```

### 方式二：Shell 脚本部署

```bash
# 1. 克隆项目
git clone https://github.com/Herokn/permission.git
cd permission

# 2. 创建数据库
mysql -u root -p -e "CREATE DATABASE permission DEFAULT CHARACTER SET utf8mb4;"

# 3. 编译部署
chmod +x deploy.sh start-all.sh stop-all.sh
./deploy.sh
./start-all.sh
```

### 方式三：手动部署

**Step 1: 准备基础环境**
```bash
# 启动 MySQL 和 Redis
docker-compose up -d mysql redis
```

**Step 2: 启动后端**
```bash
# 编译打包
./mvnw clean package -DskipTests

# 启动
java -jar permission-bootstrap/target/permission-bootstrap-*.jar
```

**Step 3: 启动前端**
```bash
cd permission-web-frontend
npm install
npm run dev
```

### 访问地址

| 服务 | Docker 部署 | 手动部署 |
|------|------------|----------|
| 前端界面 | http://localhost:3000 | http://localhost:3000 |
| 后端 API | http://localhost:8080/api | http://localhost:8080/api |
| API 文档 | http://localhost:8080/api/doc.html | http://localhost:8080/api/doc.html |

### 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user1 | user123456 |

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
| | 按项目查询全部权限点 | ✅ | /permissions/all 支持 projectId 参数 |
| **角色管理** | 创建角色 | ✅ | 支持 roleScope/roleDomain、projectId |
| | 编辑角色 | ✅ | |
| | 删除角色 | ✅ | 校验是否有关联用户 |
| | 分配权限 | ✅ | 角色-权限点关联 |
| | 角色列表 | ✅ | 分页查询，支持 projectId 筛选 |
| | 全局角色与项目角色 | ✅ | projectId=NULL 为全局角色，对所有项目生效 |
| **用户授权** | 分配角色 | ✅ | 支持指定 projectId |
| | 移除角色 | ✅ | |
| | 授予直接权限 | ✅ | 支持 ALLOW/DENY |
| | 移除直接权限 | ✅ | |
| | 查询用户授权详情 | ✅ | |
| **统一鉴权** | 单个权限检查 | ✅ | `/authz/check` |
| | 批量权限检查 | ✅ | `/authz/check-batch` |
| | 鉴权结果缓存 | ✅ | AuthzCacheService 接口 |
| **组织架构** | 创建组织 | ✅ | 支持树形结构 |
| | 编辑组织 | ✅ | |
| | 删除组织 | ✅ | 校验子组织和成员 |
| | 添加组织成员 | ✅ | |
| | 移除组织成员 | ✅ | |
| | 分配组织角色 | ✅ | 组织权限继承 |
| | 移除组织角色 | ✅ | |
| **认证** | 登录 | ✅ | 用户名密码登录 |
| | 登出 | ✅ | |
| | 获取当前用户 | ✅ | |
| | Session 管理 | ✅ | 支持会话缓存 |
| **审计日志** | 操作日志记录 | ✅ | @AuditLog 注解 + AOP |
| **Docker 部署** | Dockerfile | ✅ | 多阶段构建 |
| | docker-compose.yml | ✅ | MySQL + Redis + 后端 + 前端 |
| **数据权限** | 数据权限规则 | ✅ | 规则定义和存储 |
| | 数据权限切面 | ✅ | @DataPermission 注解 |
| | 数据权限上下文 | ✅ | ThreadLocal 传递 |
| **批量授权** | 批量分配角色 | ✅ | /user-auth/roles/batch-assign |
| | 批量移除角色 | ✅ | /user-auth/roles/batch-revoke |
| | 批量授予权限 | ✅ | /user-auth/permissions/batch-grant |
| | 批量移除权限 | ✅ | /user-auth/permissions/batch-revoke |
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
| **用户授权** | 用户查询 | ✅ | |
| | 分配角色 | ✅ | 支持选择项目 |
| | 移除角色 | ✅ | |
| | 授予/排除权限 | ✅ | 支持 ALLOW/DENY |
| | 移除直接权限 | ✅ | |
| **权限测试** | 鉴权测试页面 | ✅ | 可输入参数测试 |
| **布局** | 响应式布局 | ✅ | Ant Design Layout |
| | 导航菜单 | ✅ | 侧边栏 |

### 基础设施

| 功能 | 状态 | 说明 |
|------|:----:|------|
| Flyway 数据库迁移 | ✅ | V1~V13 迁移脚本已完成 |
| Shell 一键部署脚本 | ✅ | deploy.sh, start-all.sh, stop-all.sh |
| Swagger API 文档 | ✅ | 集成 Knife4j |
| 代码规范 (spec) | ✅ | PRD、设计规范、代码规范 |
| 开发计划 (plans) | ✅ | 6 个模块开发计划 |
| AI 技能定义 (skills) | ✅ | 3 个可复用技能 |

### 补充功能

| 功能 | 状态 | 说明 |
|------|:----:|------|
| Docker 部署验证 | ✅ | Dockerfile 和 docker-compose.yml 已完善，支持一键部署 |
| 单元测试覆盖 | ✅ | 测试类已编写并通过验证，共 50 个测试用例 |
| Redis 缓存集成 | ✅ | 缓存逻辑已完善，权限变更自动清除缓存 |
| 数据权限 | ✅ | 已实现数据权限规则、切面、上下文 |
| 批量授权操作 | ✅ | 已实现批量分配角色、批量授权 API |
| 项目维度隔离 | ✅ | 角色/权限点支持 projectId 隔离，V12/V13 迁移 |

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

### PRD 验收场景逐一验证（7 个场景）

> 以下命令基于演示数据（V2 迁移脚本），启动后即可直接执行。需先登录获取 Cookie：

```bash
# 0. 登录（Token 通过 Cookie 自动管理）
curl -s -c /tmp/perm_cookie.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'
```

```bash
# 场景 1：U1 在 P1 有 PROJECT_MANAGER 角色 → ORDER_APPROVE 应该允许
# 预期：allowed = true
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P1","explain":true}'

# 场景 2：U1 在 P2 没有该角色 → ORDER_APPROVE 应该拒绝
# 预期：allowed = false
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P2","explain":true}'

# 场景 3：U2 在 P1 无 ORDER_APPROVE（PROJECT_MEMBER 角色无审批权）
# 预期：allowed = false
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_APPROVE","projectId":"P1","explain":true}'

# 场景 4：U2 在 P1 有 ORDER_VIEW（PROJECT_MEMBER 角色有查看权）
# 预期：allowed = true
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_VIEW","projectId":"P1","explain":true}'

# 场景 5：为 U2 在 P1 配置 ORDER_VIEW + DENY → DENY 优先级覆盖角色权限
curl -s -X POST http://localhost:8080/api/user-auth/permissions/grant \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_VIEW","effect":"DENY","projectId":"P1"}'

# 验证 DENY 生效
# 预期：allowed = false，reason 包含 "DENY"
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_VIEW","projectId":"P1","explain":true}'

# 场景 6：撤销 DENY 后恢复
curl -s -X POST http://localhost:8080/api/user-auth/permissions/revoke \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_VIEW","effect":"DENY","projectId":"P1"}'

# 验证恢复
# 预期：allowed = true
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U2","permissionCode":"ORDER_VIEW","projectId":"P1","explain":true}'

# 场景 7：U3 无任何角色 → 默认拒绝
# 预期：allowed = false
curl -s -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -b /tmp/perm_cookie.txt \
  -d '{"userId":"U3","permissionCode":"ORDER_VIEW","projectId":"P1","explain":true}'
```

📖 **详细测试用例**：[docs/TEST_CASES.md](docs/TEST_CASES.md)

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

实现机制：
1. **鉴权结果缓存**：用户权限检查结果缓存到 Redis，TTL 默认 5 分钟
2. **主动失效**：权限变更时通过 `AuthzCacheService.evictUser()` 自动清除对应用户缓存
3. **一致性保证**：角色修改、权限分配、用户授权变更都会触发缓存清除

```java
// 权限变更时自动清除缓存
@Override
public void assignRole(AssignUserRoleDTO dto) {
    // ... 业务逻辑
    authzCacheService.evictUser(dto.getUserId());  // 清除用户缓存
    log.info("用户角色分配完成，已清除用户 {} 的鉴权缓存", dto.getUserId());
}
```

**缓存 Key 设计**：
```
authz:{userId}:{permissionCode}:{projectId}    # 鉴权结果缓存
```

### 2. 部署方案：Docker Compose 一键部署

项目支持多种部署方式，推荐使用 Docker Compose 一键部署。

| 方案 | 适用场景 | 说明 |
|------|----------|------|
| **Docker Compose** | 开发/测试/生产环境 | 一键启动所有服务，环境隔离 |
| Shell 脚本部署 | 生产环境（无 Docker） | 可控性更强，资源开销更小 |
| Kubernetes | 大规模分布式部署 | 企业级容器编排 |

**Docker Compose 一键部署（推荐）**：

```bash
# 1. 克隆项目
git clone https://github.com/Herokn/permission.git
cd permission

# 2. 一键启动所有服务
docker-compose up -d

# 服务包含：
# - MySQL 8.0（端口 3306）
# - Redis 7（端口 6379）
# - 后端服务（端口 8080）
# - 前端服务（端口 3000）
```

**手动部署**：

适合需要自定义环境配置的场景：

```bash
# Step 1: 准备基础环境（Docker）
docker-compose up -d mysql redis

# Step 2: 编译后端
./mvnw clean package -DskipTests

# Step 3: 启动后端
java -jar permission-bootstrap/target/permission-bootstrap-*.jar

# Step 4: 构建并启动前端
cd permission-web-frontend
npm install && npm run build
# 使用 nginx 托管 dist 目录
```

**访问地址**：

| 服务 | Docker 部署地址 | 手动部署地址 |
|------|----------------|--------------|
| 前端界面 | http://localhost:3000 | http://localhost:3000 |
| 后端 API | http://localhost:8080/api | http://localhost:8080/api |
| API 文档 | http://localhost:8080/api/doc.html | http://localhost:8080/api/doc.html |

### 3. 分层架构：为什么采用六层架构？

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

**选择：六层架构**

理由：
1. **biz vs service 分离**：biz 处理跨领域编排，service 处理单领域逻辑
2. **便于代码生成**：service/dal 可根据设计规范自动生成
3. **适合团队协作**：不同人负责不同层，减少冲突

### 4. 认证方案：为什么用 JWT 而不是 Session？

| 方案 | 优点 | 缺点 |
|------|------|------|
| Session + Cookie | 服务端可控，可主动踢人 | 需要共享存储，水平扩展复杂 |
| **JWT（当前采用）** | 无状态，天然支持水平扩展 | 无法主动失效，Token 泄露风险 |

**选择：JWT + 短过期时间 + Refresh Token**

理由：
1. **微服务友好**：权限中心作为独立服务，JWT 天然适合
2. **实现简单**：不需要 Redis 存储 Session
3. **风险缓解**：Access Token 15分钟过期，Refresh Token 支持吊销

### 5. 数据库设计：为什么 permissionCode 用字符串而不是数字ID？

| 方案 | 优点 | 缺点 |
|------|------|------|
| 数字 ID（BIGINT） | 存储小，索引快 | 不直观，需要额外映射表 |
| **字符串 Code（当前采用）** | 语义清晰，便于调试 | 索引稍大 |

**选择：字符串 Code**

理由：
1. **可读性**：日志中直接看到 `ORDER_APPROVE` 而不是 `10023`
2. **业务系统友好**：调用方不需要维护 ID 映射
3. **索引优化**：前缀索引 + 合理长度（64字符），性能影响可控

### 6. 规范化开发流程：为什么引入 spec/skills/plans 目录？

这是本项目的核心特色——**SDD（Spec-Driven Development）规范驱动开发**：

```
spec/               # 规范定义
├── PRD/            # 产品需求文档
├── code-spec/      # 代码规范
├── be-design-spec/ # 后端设计规范
└── docs/           # 详细设计文档

skills/             # AI 技能定义（将规范转化为可执行指令）
├── prd-to-sysdesign/    # PRD → 系统设计
├── be-design-spec/      # 后端设计规范
└── java-code-with-spec/ # 规范化代码生成

plans/              # 实施计划（每个模块的开发计划）
├── 00-基础设施.plan.md
├── 01-数据访问层.plan.md
└── ...
```

**价值：**
1. **可追溯**：每个模块的设计决策都有文档记录
2. **可复用**：skills 可复用到其他项目
3. **AI 友好**：结构化规范便于 AI 理解和执行
4. **团队协作**：新人可快速理解项目设计思路

---

## 项目结构

```
permission/
├── permission-bootstrap/      # 启动模块
│   └── src/main/resources/
│       ├── application.yml    # 配置文件
│       └── db/migration/      # Flyway 迁移脚本
├── permission-web/            # Web 控制器层
├── permission-biz/            # 业务逻辑层
├── permission-service/        # 服务层
├── permission-dal/            # 数据访问层
├── permission-common/         # 公共模块
├── permission-web-frontend/   # 前端项目
│
├── spec/                      # 📋 规范定义（SDD 核心）
│   ├── PRD/                   # 产品需求文档
│   │   └── 权限管理/          # 各模块 PRD
│   ├── code-spec/             # 代码规范
│   ├── docs/                  # 详细设计文档
│   │   └── BE-DESIGN/         # 后端设计文档
│   ├── be-design-spec.md      # 后端设计规范
│   ├── prd-spec.md            # PRD 编写规范
│   └── SDD-WORKFLOW.md        # SDD 工作流说明
│
├── skills/                    # 🤖 AI 技能定义
│   ├── prd-to-sysdesign/      # PRD → 系统设计
│   ├── be-design-spec/        # 后端设计规范技能
│   └── java-code-with-spec/   # 规范化代码生成
│
├── plans/                     # 📅 实施计划
│   ├── 00-基础设施.plan.md
│   ├── 01-数据访问层.plan.md
│   ├── 02-权限点管理模块.plan.md
│   ├── 03-角色管理模块.plan.md
│   ├── 04-用户授权模块.plan.md
│   ├── 05-统一鉴权模块.plan.md
│   └── 06-增强功能.plan.md
│
├── docs/                      # 用户文档
│   ├── DESIGN.md              # 设计文档
│   └── TEST_CASES.md          # 测试用例
│
├── deploy.sh                  # 一键部署脚本
├── start-all.sh               # 启动脚本
├── stop-all.sh                # 停止脚本
└── README.md                  # 项目说明
```

---

## API 接口

### 认证接口
```
POST /auth/login           # 登录
POST /auth/logout          # 退出
POST /auth/refresh         # 刷新 Token
GET  /auth/current-user    # 获取当前用户
```

### 权限点管理
```
GET    /permissions?projectId=xxx        # 分页查询，支持项目筛选
POST   /permissions                       # 创建，可指定 projectId
PUT    /permissions/{id}                  # 更新
DELETE /permissions/{id}                  # 删除
GET    /permissions/tree?projectId=xxx    # 权限树，支持项目筛选
GET    /permissions/all?projectId=xxx     # 全部权限点，支持项目筛选
```

### 角色管理
```
GET    /roles?projectId=xxx              # 分页查询，支持项目筛选
GET    /roles/{id}                        # 查询详情
POST   /roles                             # 创建，可指定 projectId
PUT    /roles/{id}                        # 更新
DELETE /roles/{id}                        # 删除
PUT    /roles/{id}/permissions            # 分配权限
GET    /roles/all                         # 全部角色
```

### 用户授权
```
GET  /user-auth/{userId}                     # 获取授权详情
POST /user-auth/roles/assign                 # 分配角色
POST /user-auth/roles/revoke                 # 移除角色
POST /user-auth/roles/batch-assign           # 批量分配角色
POST /user-auth/roles/batch-revoke           # 批量移除角色
POST /user-auth/permissions/grant            # 授予/排除权限
POST /user-auth/permissions/revoke           # 移除直接权限
POST /user-auth/permissions/batch-grant      # 批量授予权限
POST /user-auth/permissions/batch-revoke     # 批量移除权限
```

### 统一鉴权
```
POST /authz/check         # 单个权限检查
POST /authz/check-batch   # 批量权限检查
```

### 组织管理
```
GET    /organizations                   # 组织树
GET    /organizations/{id}              # 查询详情
POST   /organizations                   # 创建组织
PUT    /organizations/{id}              # 更新组织
DELETE /organizations/{id}              # 删除组织
POST   /organizations/{orgId}/roles     # 分配组织角色
DELETE /organizations/{orgId}/roles/{roleId}  # 移除组织角色
GET    /organizations/{orgId}/roles     # 查询组织角色
POST   /organizations/{orgId}/members   # 添加组织成员
DELETE /organizations/{orgId}/members/{userId}  # 移除组织成员
GET    /organizations/{orgId}/members   # 查询组织成员
```

---

---

## MVP 功能完整性与设计假设

### MVP 功能清单（对照 PRD 验收）

根据 PRD 定义，本项目 MVP 阶段应实现以下核心功能，当前状态如下：

| 模块 | 功能点 | PRD 要求 | 当前状态 | 说明 |
|------|--------|----------|:--------:|------|
| **权限点管理** | CRUD | ✅ 必需 | ✅ 已完成 | 支持树形结构、parentCode |
| **角色管理** | CRUD + 权限分配 | ✅ 必需 | ✅ 已完成 | 支持 roleScope/roleDomain |
| **用户授权** | 角色分配 + 直接权限 | ✅ 必需 | ✅ 已完成 | 支持 ALLOW/DENY |
| **统一鉴权** | 单个/批量检查 | ✅ 必需 | ✅ 已完成 | 支持缓存、权限优先级 |
| **项目管理** | 项目 CRUD | ✅ 必需 | ⚠️ 简化实现 | 数据库表已有，API 未独立暴露 |
| **多项目隔离** | projectId 隔离 | ✅ 必需 | ✅ 已完成 | 权限按项目维度隔离 |
| **DENY 覆盖** | DENY 优先级最高 | ✅ 必需 | ✅ 已完成 | 鉴权逻辑正确实现 |
| **组织架构** | 组织角色继承 | 可选 | ✅ 已完成 | 支持组织权限继承 |
| **审计日志** | 操作记录 | V1.2 计划 | ✅ 已完成 | 提前实现 |
| **权限缓存** | Redis 缓存 | V1.1 计划 | ✅ 已完成 | 提前实现 |

### 设计假设与取舍

#### 1. 用户体系假设
**假设**：用户由外部统一用户中心管理，权限中心不存储用户基本信息。
**取舍**：
- ✅ 简化了用户管理复杂度
- ✅ 适配企业级多系统场景
- ⚠️ 独立部署时需自行对接用户体系

#### 2. 认证方案假设
**假设**：采用简单的用户名密码认证，生产环境应替换为统一的 SSO/OAuth2。
**取舍**：
- ✅ MVP 阶段验证便捷
- ⚠️ 生产环境需集成企业 SSO

#### 3. 项目管理简化
**假设**：项目管理功能通过数据库直接配置，暂不提供独立管理 API。
**取舍**：
- ✅ 减少 MVP 开发工作量
- ⚠️ 后续可扩展为独立项目模块

#### 4. 权限维度
**假设**：权限点为扁平化管理，虽有 parentCode 但不做权限继承。
**取舍**：
- ✅ 逻辑简单，易于理解
- ⚠️ 如需权限继承需扩展实现

### 未实现功能（后续迭代）

| 功能 | 计划版本 | 说明 |
|------|----------|------|
| 权限有效期 | V1.2 | 支持授权期限设置 |
| 项目独立管理界面 | V1.1 | 前端项目管理页面 |
| 权限变更审计查询界面 | V1.2 | 审计日志查询 |
| 权限模板 | V1.3 | 预设权限组合快速授权 |

---

## SDD 开发流程

本项目采用 **SDD（Software Design & Development）规范驱动开发流程**，将需求分析、系统设计、代码实现的开发规范结构化，便于 AI 辅助开发和团队协作。

📖 **详细流程文档**：[spec/SDD-WORKFLOW.md](spec/SDD-WORKFLOW.md)

### 核心流程

```
需求分析(PRD) → 系分设计 → 人工评审 → AI Plan生成 → 代码实现 → 验证沉淀
```

### SDD 文档结构

| 目录 | 说明 |
|------|------|
| `spec/docs/PRD/` | 模块级需求文档 |
| `spec/docs/BE-DESIGN/` | 系分设计文档 |
| `spec/code-spec/` | 编码规范 |
| `skills/` | AI 技能定义 |
| `plans/` | 实施计划 |

---

## 代码审计记录


### 已验证的功能模块

- ✅ 登录/登出/刷新 Token
- ✅ 权限点 CRUD（列表、创建、更新、删除、树形查询）
- ✅ 角色 CRUD（列表、创建、更新、删除、详情）
- ✅ 角色权限分配
- ✅ 用户授权（角色分配、权限授予/排除）
- ✅ 项目 CRUD
- ✅ 统一鉴权测试

---

## License

MIT

---

## 生产部署安全须知

> 本项目 `application.yml` 中的敏感配置均已支持**环境变量覆盖**，开发环境使用默认值即可，**生产环境必须通过环境变量注入真实值**。

### 必须覆盖的环境变量

| 环境变量 | 说明 | 默认值（仅开发用） |
|---------|------|-------------------|
| `DB_USERNAME` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `root123` |
| `JWT_SECRET` | JWT 签名密钥（至少256位） | 占位符字符串 |
| `AUTH_ADMIN_USER` | 管理员用户名 | `admin` |
| `AUTH_ADMIN_PASS` | 管理员密码 | `admin123` |
| `AUTH_USER1` | 测试用户名 | `user1` |
| `AUTH_USER1_PASS` | 测试用户密码 | `user123456` |

### Docker 部署示例

```bash
# 生产环境部署：通过环境变量注入敏感配置
DB_PASSWORD=<强密码> JWT_SECRET=<随机256位密钥> docker-compose up -d
```

### 安全检查清单

- [ ] 替换 JWT Secret 为随机生成的强密钥
- [ ] 替换数据库密码为强密码
- [ ] 生产环境对接企业 SSO/OAuth2，移除预置用户
- [ ] 确认 `.env` 文件不被 Git 追踪（已在 `.gitignore` 中排除）
- [ ] 日志级别已设为 INFO（已修改）
- [ ] MyBatis SQL 日志已关闭（已修改）
