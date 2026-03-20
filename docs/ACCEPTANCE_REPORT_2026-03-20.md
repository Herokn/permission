# 项目验收报告（基于案例指标模板 + 现网风险深度审查）

- 验收时间：2026-03-20
- 验收范围：`permission` 全仓（后端、前端、测试/CI、部署）
- 参考标准：`PROJECT_ISSUES.md`（53项指标）+ `project_branch_review_main.md`（P0/阻塞项）
- 验收方式：静态代码审查 + 配置审查 + 关键构建验证（`test-compile`）

## 一、总体结论

**结论：有条件通过（不建议直接生产上线）**

- 总指标：53
- 通过：38
- 部分通过：4
- 不通过：11

关键阻塞点集中在 4 类：

1. 时间与会话边界处理仍有不一致（B-M7）
2. 鉴权/授权详情存在性能隐患（B-M10/B-M11）
3. 安全基线仍有遗留（B-L1/B-L8/B-L6/B-L3）
4. 测试与质量门禁不完整（T-H3/T-M1/T-M2/T-M3/T-M4/T-L4）

## 二、关键发现（按严重度）

### 高风险

1. **缺少集成测试，发布风险不可量化（T-H3）**
   - 证据：`permission-test` 仅 Mockito 单测基类，无 `@SpringBootTest` / Testcontainers / 嵌入式 Redis/H2。
   - 参考：`permission-test/src/test/java/com/permission/test/base/BaseTest.java:11`

2. **默认配置仍暴露弱口令/弱密钥占位（B-L8，伴随 B-H1 防御式兜底）**
   - 证据：主配置保留 `DB_PASSWORD:root123`、`JWT_SECRET` 弱默认值占位。
   - 参考：`permission-bootstrap/src/main/resources/application.yml:16,80`
   - 说明：`JwtConfig.validateConfig()` 能拦截弱密钥并阻止启动，但仍建议移除主配置默认敏感占位，避免误配。

### 中风险

1. **时区处理不一致，可能导致会话 TTL 偏差（B-M7）**
   - 证据：TTL 计算使用 `ZoneOffset.UTC`，而登录会话时间转换使用 `ZoneId.systemDefault()`。
   - 参考：
     - `permission-service/src/main/java/com/permission/service/impl/LoginSessionServiceImpl.java:285-286`
     - `permission-biz/src/main/java/com/permission/biz/manager/impl/LoginManagerImpl.java:123,125,225,252-253`

2. **`getUserAuthDetail` 仍存在角色权限 N+1 查询（B-M10）**
   - 证据：循环 roleId 逐个 `listByRoleId`。
   - 参考：`permission-biz/src/main/java/com/permission/biz/manager/impl/UserAuthManagerImpl.java:307-309`

3. **批量鉴权仍是逐权限串行执行（B-M11）**
   - 证据：`checkBatch` 对每个 code 调 `checkWithCache()`。
   - 参考：`permission-biz/src/main/java/com/permission/biz/manager/impl/AuthzManagerImpl.java:53-56`

4. **SSO `redirectUri` 未做白名单校验（B-L1）**
   - 证据：直接拼接 `redirectUri`。
   - 参考：`permission-biz/src/main/java/com/permission/biz/manager/impl/LoginManagerImpl.java:302-304`

5. **Flyway 被整体关闭，Schema 漂移风险（B-M14）**
   - 证据：`flyway.enabled: false`。
   - 参考：`permission-bootstrap/src/main/resources/application.yml:19-20`

### 低到中风险

1. **逻辑删除唯一索引策略在部分表仍有冲突隐患（B-L6）**
   - 证据：多表仍为 `UNIQUE KEY uk_code(code, deleted)`。
   - 参考：`permission-bootstrap/src/main/resources/db/init_full.sql:53,74,160,234`

2. **`permission-common` 仍承载 Spring 组件（B-L3）**
   - 证据：`@Component/@Configuration` 存在于 common 层。
   - 参考：
     - `permission-common/src/main/java/com/permission/common/config/AuthInterceptor.java:20`
     - `permission-common/src/main/java/com/permission/common/config/JwtConfig.java:19`
     - `permission-common/src/main/java/com/permission/common/config/AsyncConfig.java:15`

3. **前端仍有局部异常吞没（F-M4，部分通过）**
   - 证据：部分 `catch { // ignore }` 或仅 console。
   - 参考：
     - `permission-web-frontend/src/pages/PermissionPage.tsx:107-109`
     - `permission-web-frontend/src/pages/RolePage.tsx:86-88,145-146`

4. **CI 质量门禁仍不完整（T-M3/T-M4/T-L4）**
   - 证据：
     - 有 `npm run test`，但无 `npm run lint`
     - 无 Checkstyle/SpotBugs
     - `.gitignore` 缺 `*.pid`、`application-local.yml`
   - 参考：
     - `.github/workflows/ci.yml:63`
     - `.gitignore`

## 三、53项验收矩阵（逐项）

状态说明：`通过` / `部分通过` / `不通过`

### 1) 后端（27项）

| 指标 | 状态 | 结论摘要 |
|---|---|---|
| B-H1 | 通过 | `JwtConfig.validateConfig()` 强制校验弱密钥/空密钥 |
| B-H2 | 通过 | 登录密码比较已走 `PasswordService`（BCrypt） |
| B-H3 | 通过 | `AuthInterceptor` 增加 `SessionValidator` + token type 校验 |
| B-H4 | 通过 | `preHandle` 设置 `UserContextHolder`，`afterCompletion` 清理 |
| B-H5 | 通过 | Redis 缓存清理改为 `SCAN` |
| B-M1 | 通过 | CORS 改为配置源列表，默认非 `*` |
| B-M2 | 通过 | Actuator 默认仅 health/info 且健康详情按授权 |
| B-M3 | 通过 | Swagger 默认关闭（配置受控） |
| B-M4 | 通过 | 管理接口普遍加 `@RequirePermission` |
| B-M5 | 通过 | 主鉴权链路已改为批量 role 查询 |
| B-M6 | 通过 | 授权写操作已有事务 |
| B-M7 | 不通过 | 时区计算仍不统一 |
| B-M8 | 通过 | 异步监听已显式线程池 |
| B-M9 | 通过 | 监听器为 `@TransactionalEventListener(AFTER_COMMIT)` |
| B-M10 | 不通过 | `getUserAuthDetail` 仍有按角色逐个查权限 |
| B-M11 | 不通过 | `checkBatch` 仍逐权限串行调用 |
| B-M12 | 通过 | `replacePermissions` 改批量插入 |
| B-M13 | 通过 | 登录用户来源读取配置映射 |
| B-M14 | 不通过 | Flyway 被禁用，缺迁移校验链路 |
| B-L1 | 不通过 | SSO 回调地址无白名单 |
| B-L2 | 通过 | 拦截器按 claims 一次解析 |
| B-L3 | 不通过 | common 层仍含 Spring 组件 |
| B-L4 | 通过 | 组织祖先递归已有深度上限 |
| B-L5 | 通过 | `data_permission_rule` 已含 `deleted` |
| B-L6 | 不通过 | 多表仍使用 `uk_code(code,deleted)` |
| B-L7 | 通过 | 已有 `application-dev.yml` 分离 |
| B-L8 | 不通过 | 主配置仍有 `root123` 默认口令占位 |

### 2) 前端（12项）

| 指标 | 状态 | 结论摘要 |
|---|---|---|
| F-H1 | 通过 | Token 走 Cookie；本地仅存用户信息 |
| F-H2 | 通过 | 登录页移除硬编码测试凭据 |
| F-H3 | 通过 | 已有 `nginx.conf`，生产 `/api` 反向代理 |
| F-M1 | 通过 | 用户信息有 decode/sanitize 运行时兜底 |
| F-M2 | 通过 | 401 有刷新队列与重定向防重入 |
| F-M3 | 通过 | 全量权限改分页拉取 |
| F-M4 | 部分通过 | 主流程有报错提示，但仍存在局部静默 catch |
| F-M5 | 通过 | 鉴权状态改事件驱动，具响应性 |
| F-L1 | 通过 | `useEffect` 依赖基本合规 |
| F-L2 | 通过 | 未发现 `Tabs.TabPane` 旧 API |
| F-L3 | 通过 | 未发现 userId 直接拼路径高风险点 |
| F-L4 | 通过 | 已接入全局 `ErrorBoundary` |

### 3) 测试与 CI/CD（14项）

| 指标 | 状态 | 结论摘要 |
|---|---|---|
| T-H1 | 通过 | `LoginManagerImplTest` 已存在 |
| T-H2 | 通过 | `AuthzCacheServiceImplTest` 已存在 |
| T-H3 | 不通过 | 未发现集成测试栈（SpringBootTest/Testcontainers） |
| T-H4 | 通过 | `deploy.sh` 无硬编码数据库口令 |
| T-H5 | 通过 | `docker-compose` 强制 `JWT_SECRET` 外部注入 |
| T-M1 | 不通过 | ServiceImpl 15 个，仅 2 个对应 service 层测试 |
| T-M2 | 不通过 | Controller 测试数为 0 |
| T-M3 | 部分通过 | 有 JaCoCo/Docker 构建推送，但缺 Checkstyle/SpotBugs |
| T-M4 | 部分通过 | 前端 CI 跑 test/build，但未跑 lint |
| T-M5 | 通过 | 已收敛为 `*-exec.jar`，显著降低误拷贝 |
| T-L1 | 通过 | `AuthzServiceImplTest` 已覆盖 projectId 隔离 |
| T-L2 | 通过 | `PermissionManagerImplTest` 已补成功路径 |
| T-L3 | 通过 | `stop-all.sh` 改为 compose down，规避 pkill 误杀 |
| T-L4 | 部分通过 | 已补多项忽略，但仍缺 `*.pid`/`application-local.yml` |

## 四、构建与验收执行记录

已执行（容器化）：

- `docker run ... mvn -pl permission-test -am test-compile -DskipITs`
- 结果：`BUILD SUCCESS`，8 模块均通过，`permission-test` 测试代码可编译。

说明：完整 `test` 在交互中被中断，不纳入“全量自动化测试通过”结论。

## 五、上线建议（按优先级）

### P0（上线前必须完成）

1. 修复 B-M7 时区一致性（统一 UTC 或统一业务时区）
2. 修复 B-L1 SSO 回调白名单
3. 消除 B-L8 主配置默认敏感口令占位
4. 至少补 1 条端到端集成链路（登录 -> 鉴权 -> 授权变更 -> 缓存失效）覆盖 T-H3

### P1（本迭代建议完成）

1. 优化 B-M10/B-M11 查询与批量鉴权性能
2. 完善 CI 门禁：Checkstyle/SpotBugs + 前端 lint（T-M3/T-M4）
3. 完成 Controller 基础 Web 层测试模板（T-M2）

### P2（后续优化）

1. common 层职责收敛（B-L3）
2. 逻辑删除唯一索引策略统一升级（B-L6）
3. `.gitignore` 补充 `*.pid`、`application-local.yml`（T-L4）
