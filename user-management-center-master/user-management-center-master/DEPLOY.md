# Server Deployment Guide (AWS Ubuntu)

本文档介绍如何将 User Management Center 服务端部署到 AWS Ubuntu 服务器。
推荐使用 **Docker** 方式部署，环境一致性最好，运维成本最低。

---

## 方案 A: Docker 容器化部署 (强烈推荐)

### 1. 服务器准备工作

登录 AWS Ubuntu 服务器，执行以下命令安装 Docker：

```bash
# 更新软件包索引
sudo apt-get update

# 安装 Docker 依赖
sudo apt-get install -y ca-certificates curl gnupg

# 添加 Docker 官方 GPG Key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 设置 Docker 仓库
echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker 并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# (可选) 允许当前用户直接运行 docker 命令（无需 sudo）
sudo usermod -aG docker $USER
# 注意：执行完上一行后，需要退出重新登录服务器生效
```

### 2. 代码上传

您不需要上传 `node_modules`，只需上传源码和配置文件。
推荐上传以下文件/目录到服务器 (例如 `/home/ubuntu/project`)：

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `Dockerfile`
- `.dockerignore`
- `packages/` (整个目录)
- `server/` (整个目录，**排除** `server/node_modules` 和 `server/dist`)
- `fe/` (如果需要构建全栈镜像，**排除** `fe/node_modules` 和 `fe/dist`)

**技巧**: 可以在本地压缩后上传：

```bash
# 本地执行
tar --exclude='node_modules' --exclude='dist' -czf project.tar.gz .
scp -i your-key.pem project.tar.gz ubuntu@<AWS_IP>:/home/ubuntu/
```

### 3. 构建与启动

在服务器上解压代码并进入目录：

```bash
# 1. 构建镜像 (耗时约 3-5 分钟)
docker build -t user-center-server .

# 2. 启动容器
# 注意替换为您实际的环境变量
docker run -d \
  --name user-center \
  --restart always \
  -p 5120:5120 \
  -e NODE_ENV=production \
  -e PORT=5120 \
  -e ENABLE_CORS=1 \
  -e DISABLE_FE_STATIC=1 \
  user-center-server
```

### 4. 验证

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs -f user-center

# 测试接口
curl http://localhost:5120/api/health
```

---

## 方案 B: 传统 PM2 部署 (不使用 Docker)

如果您坚持不使用 Docker，请参考以下步骤：

### 1. 服务器准备工作

```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 和 PNPM
sudo npm install -g pm2 pnpm
```

### 2. 部署目录结构

需要上传**构建后**的产物。在本地执行 `npm run build:test` 后，上传以下内容：

```text
/home/ubuntu/project/
├── ecosystem.config.cjs
├── package.json (根目录的)
├── pnpm-workspace.yaml
├── packages/
│   └── shared/
│       ├── package.json
│       └── dist/ (构建产物)
└── server/
    ├── package.json
    ├── .env.test
    └── dist/ (构建产物)
```

### 3. 安装依赖与启动

```bash
cd /home/ubuntu/project

# 安装生产环境依赖
pnpm install --prod

# 启动服务
pm2 start ecosystem.config.cjs --env test

# 保存自启
pm2 save
pm2 startup
```

---

## 常见问题

1.  **AWS 安全组**: 无论哪种方式，记得在 AWS 控制台 -> EC2 -> Security Groups 中放行 **TCP 5120** 端口。
2.  **pnpm store**: 如果 Docker 构建过程中 pnpm 下载慢，可以尝试挂载本地缓存或配置国内源（如果服务器在国内）。
3.  **内存限制**: 如果构建时出现 `JavaScript heap out of memory`，请在 `package.json` 的 build 命令中增加 `NODE_OPTIONS="--max-old-space-size=4096"`。
