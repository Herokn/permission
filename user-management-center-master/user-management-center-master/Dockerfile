# Stage 1: Builder
FROM node:20-slim AS builder
WORKDIR /app
# 安装 pnpm
RUN npm install -g pnpm

# 复制源码
COPY . .

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建 Server (会自动构建依赖的 packages/shared)
RUN pnpm run build:prod:server

# (可选) 构建前端 - 如果需要全栈镜像，取消注释下一行
# RUN pnpm run build:prod:fe

# 准备部署产物
# pnpm deploy 会将 server 及其生产环境依赖复制到 /app/deploy 目录
RUN pnpm --filter=@wb/user-magagement-center-server --prod deploy /app/deploy

# 补充复制 dist 目录 (防止 pnpm deploy 未包含构建产物)
RUN [ -d /app/deploy/dist ] || cp -r server/dist /app/deploy/dist

# 补充复制 workspace 依赖的 dist (例如 packages/shared)
# 注意：路径取决于 pnpm 链接结构，通常在 node_modules 下
RUN if [ -d packages/shared/dist ]; then \
      dest=$(find /app/deploy/node_modules -name shared -type d | head -n 1); \
      if [ -n "$dest" ]; then cp -r packages/shared/dist "$dest/"; fi; \
    fi

# (可选) 复制前端产物到部署目录
# RUN if [ -d fe/dist ]; then mkdir -p /app/deploy/fe/dist && cp -r fe/dist/* /app/deploy/fe/dist; fi

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

# 复制部署产物
COPY --from=builder /app/deploy ./

# 环境变量设置
ENV NODE_ENV=production
ENV PORT=5120
# 如果是全栈模式，设置 DISABLE_FE_STATIC=0
ENV DISABLE_FE_STATIC=1 

EXPOSE 5120

CMD ["node", "dist/main.js"]
