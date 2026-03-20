# 启动说明

## 快速启动

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置以下变量：
# - JWT_SECRET: JWT 密钥（至少32字符）
# - DB_PASSWORD: 数据库密码
# - AUTH_ADMIN_PASS: 管理员密码（可选）
# - AUTH_USER1_PASS: 普通用户密码（可选）
```

### 2. 启动服务

```bash
# Linux/Mac
./start-all.sh

# Windows
.\start-all.ps1
```

### 3. 访问应用

- **权限中心前端**: http://localhost:3000
- **用户中心前端**: http://localhost:5174（或通过权限中心内嵌访问）
- **后端 API**: http://localhost:8080/api

### 4. 登录账号

- **管理员**: admin / [你在 .env 中设置的密码]
- **普通用户**: user1 / [你在 .env 中设置的密码]

---

## 启动模式

### 核心模式 (core)

只启动 MySQL、Redis、后端和权限中心前端

```bash
./start-all.sh core
```

### 用户中心模式 (user-center)

启动核心服务 + 用户中心前端（推荐）

```bash
./start-all.sh user-center
```

### 微前端模式 (micro-frontend)

启动包含 mf-shell 基座的完整微前端架构

```bash
./start-all.sh micro-frontend
```

### 完整模式 (full)

启动所有服务（默认）

```bash
./start-all.sh full
# 或直接
./start-all.sh
```

---

## 重置数据库

如果需要重新初始化数据库（删除所有数据）：

```bash
./start-all.sh full --reset-db
```

---

## 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷
docker compose down -v
```

---

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│           权限中心 (React + Ant Design)                 │
│              http://localhost:3000                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Tab 切换: [用户中心] [权限管理]                   │  │
│  ├───────────────────────────────────────────────────┤  │
│  │                                                    │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  iframe 嵌入用户中心 (Vue + TDesign)         │  │  │
│  │  │  /user-center/ → user-center-frontend:80    │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │  或显示权限管理的页面                                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────────────┐
                    │ Java 后端    │
                    │ :8080/api    │
                    └──────────────┘
                           ↓
                    ┌──────────────┐
                    │ MySQL/Redis  │
                    └──────────────┘
```

---

## Docker 服务

| 服务名 | 容器名 | 端口 | 说明 |
|--------|--------|------|------|
| mysql | permission-mysql | 3306 | 数据库 |
| redis | permission-redis | 6379 | 缓存 |
| backend | permission-backend | 8080 | Java 后端 |
| frontend | permission-frontend | 3000 | 权限中心前端 |
| user-center-frontend | user-center-frontend | 5174 | 用户中心前端 |
| mf-shell | permission-mf-shell | 3050/4130 | 微前端基座（可选） |

---

## 本地开发

如果需要在本地开发（不使用 Docker）：

### 1. 启动数据库和缓存

```bash
docker compose up -d mysql redis
```

### 2. 启动后端

```bash
cd permission-bootstrap
mvn spring-boot:run
```

### 3. 启动权限中心前端

```bash
cd permission-web-frontend
npm install
npm run dev
```

### 4. 启动用户中心前端

```bash
cd user-management-center-master/user-management-center-master/fe
pnpm install
pnpm dev
```

---

## 故障排查

### 后端无法启动

1. 检查数据库是否正常运行
2. 检查 .env 文件中的密码是否正确
3. 查看后端日志：`docker logs permission-backend`

### 前端无法访问

1. 检查后端是否正常启动
2. 检查端口是否被占用
3. 查看前端日志：`docker logs permission-frontend`

### 数据库连接失败

1. 重置数据库：`./start-all.sh full --reset-db`
2. 检查 MySQL 密码是否正确

---

## 权限说明

### 用户中心权限 (USER_CENTER_*)

- `USER_CENTER_USER_VIEW` - 查看用户
- `USER_CENTER_USER_CREATE` - 创建用户
- `USER_CENTER_USER_EDIT` - 编辑用户
- `USER_CENTER_USER_ENABLE` - 启用/禁用用户
- `USER_CENTER_USER_RESET_PWD` - 重置密码
- `USER_CENTER_ORG_VIEW` - 查看组织
- `USER_CENTER_ORG_MANAGE` - 管理组织
- `USER_CENTER_POSITION_VIEW` - 查看岗位
- `USER_CENTER_POSITION_MANAGE` - 管理岗位

### 权限管理权限 (PERMISSION_MANAGE_*)

- `PERMISSION_MANAGE` - 权限管理总权限

### 超级管理员

admin 用户默认为超级管理员，拥有所有权限。
