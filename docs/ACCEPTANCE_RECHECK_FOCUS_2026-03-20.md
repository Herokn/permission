# 验收复核报告（聚焦问题项）

> 复核时间：2026-03-20  
> 复核范围：仅针对上一版报告中提出的问题项（不扩展）  
> 验收代码基线：`a1e3b23`（main）

---

## 1. 结论

本次“聚焦复核”结论为：**未通过**。  
此前指出的关键问题仍然存在，包含构建阻塞、编译错误、配置空指针风险、测试不可运行风险。

---

## 2. 复核项与结果

### 2.1 构建可通过性（Checkstyle 门禁）  
**状态：未通过**

- 复现命令：
  - `mvn -pl permission-test -am test-compile -DskipITs`（Docker Maven 17 执行）
- 结果：
  - 在 `permission-common` 阶段失败，报 `2 Checkstyle violations`。
- 关键证据：
  - `permission-common/src/main/java/com/permission/common/context/DataPermissionContextHolder.java:5`（类未声明 `final`）
  - `permission-common/src/main/java/com/permission/common/context/UserContextHolder.java:8`（类未声明 `final`）
  - `pom.xml:149` 配置为 `<failsOnError>true</failsOnError>`，导致 warning 级违规直接 fail build。

---

### 2.2 `LoginManagerImpl` 编译错误  
**状态：未修复（仍阻塞编译）**

- 复现命令：
  - `mvn -pl permission-test -am test-compile -DskipITs -Dcheckstyle.skip=true`（Docker Maven 17 执行）
- 结果：
  - `permission-biz` 编译失败，6 处错误。
- 错误证据：
  - `permission-biz/src/main/java/com/permission/biz/manager/impl/LoginManagerImpl.java:123,125,223,227` 使用 `ZoneOffset.UTC`，但文件仅导入了 `ZoneId`，未导入 `ZoneOffset`。
  - `LoginManagerImpl.java:304` 使用 `ErrorCode.INVALID_PARAM`，`ErrorCode` 中不存在该枚举项。
  - `LoginManagerImpl.java:313` 使用 `ErrorCode.SYSTEM_ERROR`，`ErrorCode` 中不存在该枚举项。
  - `permission-common/src/main/java/com/permission/common/exception/ErrorCode.java` 中现有的是 `USER_NOT_FOUND`、`LOGIN_SYSTEM_ERROR` 等，未定义 `INVALID_PARAM` / `SYSTEM_ERROR`。

---

### 2.3 SSO 白名单实现空指针风险  
**状态：风险仍在**

- 问题点：
  - `PermissionConfig` 中 `ssoRedirectWhitelistSet` 仅在 `setSsoRedirectWhitelist(...)` 中赋值。
  - `isSsoRedirectAllowed(...)` 直接调用 `ssoRedirectWhitelistSet.contains(...)` 与 `for (String allowed : ssoRedirectWhitelistSet)`，无空判断。
- 关键证据：
  - `permission-common/src/main/java/com/permission/common/config/PermissionConfig.java:44`（`ssoRedirectWhitelistSet` 声明）
  - `PermissionConfig.java:63-70`（仅 setter 中初始化）
  - `PermissionConfig.java:79,83`（直接使用，无 null guard）
  - `permission-bootstrap/src/main/resources/application.yml:96-99` 仅配置了 `super-admins/org-max-depth`，未配置 `permission.sso-redirect-whitelist`。
- 风险说明：
  - 在属性未绑定触发 setter 的情况下，存在运行时 NPE 风险。

---

### 2.4 新增 Controller 测试有效性  
**状态：不可认定为“有效补测”**

- 问题 A：测试基类缺少 Spring 测试启动注解  
  - 证据：
    - `permission-test/src/test/java/com/permission/test/base/BaseTest.java:11` 使用 `@ExtendWith(MockitoExtension.class)`。
    - `permission-test/src/test/java/com/permission/test/web/controller/BaseControllerTest.java` 未见 `@SpringBootTest`/`@WebMvcTest`/`@AutoConfigureMockMvc`。
  - 影响：
    - `@Autowired WebApplicationContext/ObjectMapper` 注入条件不满足时，`MockMvc` 初始化风险高。

- 问题 B：`LoginControllerTest` 使用不存在的 DTO 方法  
  - 证据：
    - `permission-test/.../LoginControllerTest.java:29,45,59,91` 使用 `dto.setLoginAccount(...)`。
    - `permission-biz/src/main/java/com/permission/biz/dto/auth/LoginDTO.java:16` 字段为 `userName`，对应 setter 应为 `setUserName(...)`。

- 问题 C：测试引用不存在的错误码枚举  
  - 证据：
    - `LoginControllerTest.java:66` 使用 `ErrorCode.USER_NOT_EXISTS`（应为 `USER_NOT_FOUND`）。
    - `LoginControllerTest.java:153` 使用 `ErrorCode.INVALID_PARAM`（当前枚举不存在）。
    - `permission-common/.../ErrorCode.java` 无上述枚举定义。

---

## 3. 验收结论（仅针对本次聚焦问题）

以下问题均判定为 **未通过**：

1. Checkstyle 仍阻塞构建  
2. `LoginManagerImpl` 6 处编译错误仍存在  
3. SSO 白名单空指针风险未消除  
4. 新增 Controller 测试当前不可认定有效

---

## 4. 建议修复优先级

1. **P0**：先修 `LoginManagerImpl` 编译错误（否则后续测试无法推进）  
2. **P0**：补齐 `PermissionConfig` 的 `ssoRedirectWhitelistSet` 初始化与空保护  
3. **P1**：修复 Checkstyle 剩余 2 条违规，恢复主干可构建性  
4. **P1**：修正 Controller 测试的启动方式、DTO 字段调用、错误码引用

