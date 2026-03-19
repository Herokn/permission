# Stage 1: 构建基础镜像
FROM node:20-slim AS builder
WORKDIR /app
RUN npm i -g pnpm

# 传递构建参数（可选，用于控制是否打包前端）
ARG BUILD_TYPE=server_only
ENV BUILD_TYPE=${BUILD_TYPE}
ARG VITE_BASE_URL=/app/
ENV VITE_BASE_URL=${VITE_BASE_URL}

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY fe/package.json fe/package.json
COPY server/package.json server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --recursive
COPY . .

# 根据 BUILD_TYPE 决定构建内容
RUN if [ "$BUILD_TYPE" = "all" ]; then \
      pnpm run build:prod; \
    else \
      pnpm run build:prod:server; \
    fi

# Stage 2: 运行镜像
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# 复制服务端产物
COPY --from=builder /app/server/dist server/dist
COPY --from=builder /app/server/package.json server/package.json

# 如果构建了前端，也复制前端产物
COPY --from=builder /app/fe/dist fe/dist

RUN npm install --prefix server --omit=dev

ENV PORT=4120
# 默认开启 CORS (前后端分离时需要，合并部署时也可开启)
ENV ENABLE_CORS=1
# 默认不托管静态资源 (除非构建时覆盖此环境变量)
ENV DISABLE_FE_STATIC=1
ENV FE_BASE_PREFIX=/app

USER node
EXPOSE 4120

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>r.status===200?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node","server/dist/main.js"]
