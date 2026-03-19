# 项目基础模版简介与使用规范（增强版）

> 模板定位：快速搭建企业级前后端一体/分体工程，支撑移动端与 PC 适配、国际化、环境隔离、pm2 与 Docker 部署，关注工程化与规范化。

## 技术栈

- 前端：Vue3、Vite、TypeScript、Pinia、Vue-Router、UnoCSS、TDesign Vue Next、Mock、PostCSS（pxtorem）
- 后端：NestJS、Fastify、TypeScript
- 工具：pnpm workspace、Turbo、ESLint/Prettier、Husky、pm2、Docker、Mermaid/ASCII 文档图示

## 目录结构与作用

- `fe/` 前端工程（Vue3 + Vite）
  - `build/` 构建工具与插件（`vite` 插件、打包配置、配置文件生成）
    - `vite/plugin/index.ts:15-64` 插件集，自动引入、组件按需、mock、压缩、HTML 注入
    - `vite/proxy.ts:18-36` 开发代理生成
    - `script/buildConf.ts:12-40` 生成运行时配置 `window.__CONF__`
  - `mock/` 本地 mock 数据
  - `src/` 源码
    - `api/` 业务 API 封装与聚合
    - `components/` 通用与业务组件
    - `layouts/` 框架与布局
    - `locales/` 国际化文案（中/英）
    - `router/` 路由系统（模块化加载、历史模式、基础路径）
    - `stores/` Pinia 状态（持久化）
    - `styles/` 全局样式与主题（Less + UnoCSS）
    - `types/` 类型定义（Axios/通用/环境）
    - `utils/` 请求封装、路由工具、存储、校验等
    - `mfe/` 微前端预置（`garfish.ts:1-6`）
  - `vite.config.ts` 前端构建配置（pxtorem、插件与代理、`base` 前缀）

- `server/` 后端工程（NestJS + Fastify）
  - `src/common/` 全局拦截器与异常过滤器（响应统一、耗时日志、超时、trace）
  - `src/configs/env.ts:6-16` 按环境加载 `.env.*`
  - `src/core/http/http.service.ts:1-109` Node 原生 HTTP 客户端封装
  - `src/modules/` 业务模块（`auth`、`health`、`mock`、`user`）
  - `src/main.ts:15-63` 后端入口（静态托管/代理、CORS、拦截器、过滤器、启动日志）

- `packages/shared/` 共享类型与工具库（前后端复用）
  - 导出：`./src/index.ts`、`./src/api`、`./src/utils`、`./src/types`
  - 使用示例：`server/src/modules/mock/mock.controller.ts:2` 引用 `Item` 类型

- `scripts/create-wb-app/` 项目脚手架（本地使用）
  - `cli.js` 输入项目名/版本号、避免同名覆盖、拷贝模板并重写 `package.json`

- 根目录
  - `ecosystem.config.cjs` pm2 多进程配置（前后端分离运行）
  - `Dockerfile` 多阶段构建，健康检查与环境变量注入
  - `turbo.json`、`pnpm-workspace.yaml` 单仓工作流配置

## 关键能力与代码参考

- 移动端/PC 适配
  - pxtorem：`fe/vite.config.ts:22-44` 将 `px` 转为 `rem`
  - 动态根字号：`fe/src/main.ts:9-18` 根据视口宽度计算 `html` 字号

- 构建与代理
  - 基础路径：`fe/vite.config.ts:20` 默认 `/app/`；路由使用 `VITE_BASE_URL`（`fe/src/router/index.ts:101-113`）
  - 开发代理：`fe/build/vite/proxy.ts:18-36` 与 `.env.*` 配置项

- 后端静态托管与代理
  - 开发代理：`server/src/main.ts:24-36`（`USE_PROXY=1` + `FE_DEV_PORT`）
  - 生产静态：`server/src/main.ts:37-43`（挂载 `fe/dist` 到 `FE_BASE_PREFIX`）
  - 禁用静态：`DISABLE_FE_STATIC=1`（`server/src/main.ts:28`）

- 响应与错误
  - 统一成功：`server/src/common/interceptors/response.interceptor.ts:6-13` -> `{ code:0, data }`
  - 统一错误：`server/src/common/filters/global-exception.filter.ts:3-17` -> `{ code:1, msg }`
  - 日志耗时：`server/src/common/interceptors/logging.interceptor.ts:11-17`
  - 超时处理：`server/src/common/interceptors/timeout.interceptor.ts:9-16`

- 国际化
  - 文案目录：`fe/src/locales/lang/zh_CN/*`、`fe/src/locales/lang/en_US/*`
  - 入口挂载：`fe/src/main.ts:19-24` 使用 `i18n`

- 微前端（可选）
  - `fe/src/mfe/garfish.ts:1-6` 已注册 `router/browser-vm/browser-snapshot` 插件，可按需启用

## 开发、构建与运行

- 安装依赖：`pnpm install`
- 开发：
  - 全量：`pnpm run start`
  - 仅前端：`pnpm run start:fe`
  - 仅后端：`pnpm run start:server`
- 构建：
  - 生产全量：`pnpm run build:prod`
  - 单独：`pnpm run build:prod:server` / `pnpm run build:prod:fe`
- 预览与启动：
  - 前端预览：`pnpm --dir fe preview`
  - 服务端（合并部署）：`pnpm --dir server start`
- pm2 分离：
  - 启动：`pm2 start ecosystem.config.cjs`
  - 日志：`pm2 logs`
- Docker 合并：
  - 构建：`docker build -t wb-xms:prod --build-arg VITE_BASE_URL=/app/ .`
  - 运行：`docker run -d -p 4120:4120 -e PORT=4120 -e FE_BASE_PREFIX=/app wb-xms:prod`

## 规范（参考主流前端规范）

- 代码与类型：严格 TS、杜绝 `any`、显式 props/返回值、公共类型集中
- 命名与结构：目录/文件用短横线、组件 PascalCase、变量 camelCase、常量 UPPER_SNAKE_CASE
- 组件与状态：单一职责、通用组件复用、Pinia 模块按领域拆分
- 样式与主题：Less 变量集中、禁止硬编码 px、使用 rem 与 pxtorem
- 请求与错误：统一请求封装与返回结构；错误页收敛到 `fe/src/pages/result/*`
- 国际化：所有文案走 i18n，避免硬编码
- 提交与分支：Conventional Commits；分支 `feature/*`、`fix/*`、`release/*`
- 质量：ESLint+Prettier+Husky；`pnpm run typecheck`

## 常见任务指引

- 新增页面路由：在 `fe/src/router/modules` 添加路由文件，并在 `router/index.ts` 的模块加载范围内
- 新增 API：在 `fe/src/api/modules` 增加模块；后端在 `server/src/modules` 对应实现
- 新增状态：在 `fe/src/stores/modules` 新增 Pinia 模块，并在入口 `stores/index.ts` 统一挂载
- 新增文案：在 `fe/src/locales/lang/zh_CN|en_US` 下新增并在页面引用
- 新增组件：在 `fe/src/components` 下新增，自动生成 dts（`unplugin-vue-components`）
- 修改主题：更新 `fe/src/styles/variables.less` 与 `fe/src/styles/theme.less`
- 调整基础路径：修改 `VITE_BASE_URL` 并确保 Nginx/后端 `FE_BASE_PREFIX` 保持一致
- 启用微前端：在路由或入口处初始化 `garfish`，并配置子应用

## 环境变量对照

- 前端：`VITE_BASE_URL`、`VITE_PORT`、`VITE_PROXY`、`VITE_USE_MOCK`、`VITE_BUILD_COMPRESS` 等（`fe/vite.config.ts:17-71`）
- 后端：`PORT`、`FE_BASE_PREFIX`、`USE_PROXY`、`FE_DEV_PORT`、`ENABLE_CORS`、`DISABLE_FE_STATIC`（`server/src/main.ts:24-43`）

## 注意事项与小贴士

- `VITE_BASE_URL` 与 `FE_BASE_PREFIX` 必须一致（默认 `/app`）
- 分离部署时使用 `DISABLE_FE_STATIC=1`，由 Nginx 提供静态与路由
- 生产建议开启 gzip（`vite` 压缩或 Nginx）
- 当前前端存在类型检查问题（如缺失 `vue-clipboard3`、空值判断），建议按模块修复

---

需要我继续把 `@wb/shared` 与脚手架改造为可发布 npm 包，并补充发布指南与 CI 流程，我可以直接实施并在文档中追加发布章节与命令清单。
