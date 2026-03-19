# 项目基础整体模版架构设计与后续规划（增强版）

## 总览

- 支持两种部署形态、三种打包方式：
  - 合并服务部署：后端统一托管 `fe/dist` 静态资源与 API
  - 前后端分离：后端仅提供 API，前端由 Nginx 提供静态和路由
  - Docker 镜像：多阶段构建、健康检查、非 root 运行
- 支持移动端与 PC 端适配、国际化、环境隔离、pm2 进程管理

## 架构示意（兼容无图环境）

合并服务部署：

```
[Browser]
   |
   v
[Nginx]  -->  反向代理  -->  [Node (NestJS + Fastify)]
                                |-- 静态托管: /app -> fe/dist
                                |-- API: /api -> modules(health/mock/user/auth)
```

前后端分离 + pm2：

```
[Browser]
   |
   v
[Nginx]
   |-- /app  ->  /var/www/wbsmart/app (静态文件)
   |-- /api  ->  http://127.0.0.1:4120 (Node)

[pm2]
   |-- wb-fe: vite preview (或静态服务)
   |-- wb-server: node server/dist/main.js (DISABLE_FE_STATIC=1)
```

Docker 合并服务：

```
[Container: wb-xms]
   |-- node server/dist/main.js
   |-- serve fe/dist at /app
   |-- HEALTHCHECK -> GET http://127.0.0.1:PORT/api/health
```

## 组件与分层

- 前端（Vue3 + Vite）
  - 启动入口与适配：`fe/src/main.ts:1-24`（挂载路由/状态/i18n，动态 `rem`）
  - 路由：`fe/src/router/index.ts:1-113`（`VITE_BASE_URL` 驱动，模块化路由）
  - 状态：`fe/src/stores/index.ts:1-10`（Pinia + 持久化）
  - 国际化：`fe/src/locales/lang/*`（完整中英文文案集）
  - UI/样式：`TDesign`、`UnoCSS`、`Less`、`pxtorem`（`fe/vite.config.ts:22-44`）
  - 请求封装：`fe/src/utils/request/Axios.ts:1-294`（拦截、重试、取消、节流/防抖）
  - 微前端预置：`fe/src/mfe/garfish.ts:1-6`（Garfish 插件注册，按需启用）

- 后端（NestJS + Fastify）
  - 入口：`server/src/main.ts:15-63`（静态托管、代理、CORS、拦截器、过滤器）
  - 响应拦截：`server/src/common/interceptors/response.interceptor.ts:6-13`
  - 日志耗时：`server/src/common/interceptors/logging.interceptor.ts:11-17`
  - 超时与 Trace：`server/src/common/interceptors/timeout.interceptor.ts:9-16`、`trace.interceptor.ts:6-13`
  - 异常过滤器：`server/src/common/filters/global-exception.filter.ts:3-17`
  - 环境加载：`server/src/configs/env.ts:6-16`（按 `NODE_ENV` 读取 `.env.*`）
  - 核心服务：`server/src/core/http/http.service.ts:1-109`（无第三方依赖的 HTTP 客户端）
  - 业务模块：`health`、`mock`、`user`、`auth`（`server/src/modules/*`）

- 共享（workspace）
  - 类型/工具：`packages/shared`（`api` 常量、`utils` 工具、类型声明）
  - 例：`server/src/modules/mock/mock.controller.ts:2` 引用 `Item` 类型

## 运行时流转

- 静态托管开关：
  - 禁用静态托管：`DISABLE_FE_STATIC=1`（`server/src/main.ts:28`）
  - 静态路径：`fe/dist` 挂载到 `FE_BASE_PREFIX`（默认 `/app`）（`server/src/main.ts:37-43`）
- 开发代理：
  - `USE_PROXY=1` + `FE_DEV_PORT`（Vite 端口），`Fastify` 代理 `/app` 到前端（`server/src/main.ts:24-36`）
- 响应规范：所有成功响应统一包裹 `{ code: 0, data }`（`server/src/common/interceptors/response.interceptor.ts:6-13`）
- 错误规范：全局返回 `{ code: 1, msg }`（`server/src/common/filters/global-exception.filter.ts:3-17`）

## 环境与配置（前后端）

- 前端环境
  - `fe/vite.config.ts:17-71` 读取 `.env.*` 并注入 `VITE_*` 变量（`wrapperEnv` 在 `fe/build/utils.ts`）
  - 基础路径：`VITE_BASE_URL`（默认 `/app/`）影响路由历史与静态资源
  - 代理：`VITE_PROXY` -> `fe/build/vite/proxy.ts:18-36`
- 后端环境
  - `server/.env.*`（`development/test/production`）
  - `PORT`、`FE_BASE_PREFIX`、`USE_PROXY`、`FE_DEV_PORT`、`ENABLE_CORS`、`DISABLE_FE_STATIC`

## 构建与流程

- Turbo pipeline：`turbo.json:1-29`
  - `dev/start/preview` 持久任务
  - `build` 产出 `dist/**`
  - `typecheck` 联动工作区
- 前端 Vite 插件集：`fe/build/vite/plugin/index.ts:15-64`
  - `vue`、`vue-jsx`、`svg-loader`、`UnoCSS`
  - `unplugin-auto-import`（自动引入 `vue`、`router`、`i18n`、`pinia`）
  - `unplugin-vue-components`（组件自动按需 + dts）
  - `vite-plugin-mock`（开发/生产可控）
  - `vite-plugin-html`、`压缩`（`gzip/brotli`）

## 包装与部署

- pm2：`ecosystem.config.cjs`
  - `wb-server`：`DISABLE_FE_STATIC=1`，仅 API
  - `wb-fe`：`vite preview`（默认 `4173`）
- Docker：`Dockerfile`
  - 构建参数：`VITE_BASE_URL=/app/`
  - 运行变量：`PORT`、`FE_BASE_PREFIX`、`ENABLE_CORS`、`DISABLE_FE_STATIC`
  - 健康检查：容器 `HEALTHCHECK` 请求 `/api/health`
  - 非 root：`USER node`
- Nginx（分离部署示例）
  - `/app` 静态：`root /var/www/wbsmart; try_files $uri $uri/ /app/index.html;`
  - `/api` 反代：`proxy_pass http://127.0.0.1:4120/api/;`

## API 一览（示例）

- 健康检查：
  - `GET /api/health`（`server/src/modules/health/health.controller.ts`）
- Mock：
  - `GET /api/mock/items` 返回示例数据（`server/src/modules/mock/mock.controller.ts:6-12`）
- 用户：
  - `GET /api/user/list`、`GET /api/user/:id`、`POST /api/user`、`PUT /api/user/:id`、`DELETE /api/user/:id`
- 鉴权：
  - `POST /api/auth/login`、`POST /api/auth/logout`、`GET /api/auth/echo`、`GET /api/auth/external`

## 质量与安全

- 类型检查：`pnpm run typecheck`（根工作区）
  - 当前前端存在若干类型错误（依赖缺失如 `vue-clipboard3`、泛型与空值判断），需要按模块修复
- 跨域：`ENABLE_CORS=1` 使用 `@fastify/cors`
- 超时：`REQ_TIMEOUT_MS`（默认 10s）
- 认证：`server/src/common/guards/auth.guard.ts:6-9`（示例基于 `Authorization`）

## 路线图（落地项）

- 版本与发布
  - 将 `packages/shared` 转为可发布包（`dist` 构建、`exports/files`、`private:false`）
  - 将 `scripts/create-wb-app/cli.js` 迁移到 `packages/create-wb-app`，配置 `bin` 发包
  - 引入 Changesets 做多包版本与 `publish` 流程
- 工程完善
  - CI/CD：push 触发 typecheck/lint/build/test/docker-build 与推送
  - 文档：接口规范、部署与故障处置
- 可观测与安全
  - 结构化日志、APM、指标、报警；速率限制、Helmet、安全头
- 前端增强
  - 单测/E2E（Vitest/Playwright）；权限/菜单映射；产物优化与按需加载；微前端场景示例（Garfish）

---

如需我将 `@wb/shared` 与脚手架改造成可发布 npm 包并加 CI 工作流，我可以继续实施改造与验证，并在本文追加发布指南与命令清单。
