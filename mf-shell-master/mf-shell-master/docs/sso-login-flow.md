# SSO 单点登录流程文档

> 本文档基于 mf-shell 项目代码，梳理 SSO 单点登录从 **前端 (Vue3)** → **Node BFF (NestJS)** → **Java SSO Server** 的完整交互流程。
> 每一步标注了依赖上一步的哪些返回值、请求传参和响应结果。

---

## 目录

- [一、登录完整流程（核心）](#一登录完整流程核心)
- [二、登出完整流程](#二登出完整流程)
- [三、Token 鉴权流程（已登录后的每次请求）](#三token-鉴权流程已登录后的每次请求)
- [四、路由守卫流程](#四路由守卫流程)
- [五、权限加载流程](#五权限加载流程)
- [六、SSO 状态检测流程](#六sso-状态检测流程)
- [七、密码相关流程（直连 Java）](#七密码相关流程直连-java)
- [八、Node BFF 全局异常处理](#八node-bff-全局异常处理)

---

## 一、登录完整流程（核心）

整个登录由 **7 个步骤** 串联，每一步都依赖上一步的返回值。

### 总览时序图

```
 用户浏览器              前端 Vue3                    Node BFF (NestJS)                   Java SSO Server
    │                      │                              │                                    │
    │─ 输入用户名/密码 ──▶│                              │                                    │
    │                      │                              │                                    │
    │                      │─── ① POST /auth/sso/login ─▶│                                    │
    │                      │    {username, password}      │                                    │
    │                      │                              │─── ② POST /api/v1/sso/login ─────▶│
    │                      │                              │    {username,password,clientId...}  │
    │                      │                              │◀── Set-Cookie:SSO_SESSION_ID ─────│
    │                      │                              │    + {redirectUrl}                  │
    │                      │                              │                                    │
    │                      │                              │─── ③ GET /oauth2/authorize ───────▶│
    │                      │                              │    Cookie:SSO_SESSION_ID            │
    │                      │                              │    (redirect:manual)                │
    │                      │                              │◀── 302 Location:?code=AUTH_CODE ──│
    │                      │                              │                                    │
    │                      │                              │─── ④ POST /oauth2/token ──────────▶│
    │                      │                              │    Basic Auth + code=AUTH_CODE      │
    │                      │                              │◀── {access_token,refresh_token...} │
    │                      │                              │                                    │
    │                      │◀── ⑤ {code:2000, data:{    │                                    │
    │                      │    accessToken,ssoSessionId  │                                    │
    │                      │    username,tokenType...}}   │                                    │
    │                      │                              │                                    │
    │                      │── ⑥ 存储token/ssoSessionId ─│                                    │
    │                      │── ⑦ 获取系统权限列表 ───────────────────────────────────────────▶│
    │                      │                              │                                    │
    │◀── 跳转 /dashboard ─│                              │                                    │
```

---

### 步骤 ① 前端发起登录请求

**来源文件**: `fe/src/pages/login/index.vue` → `fe/src/stores/modules/user.ts` → `fe/src/api/modules/auth.ts`

**调用链**:
```
login/index.vue: onSubmit()
  → userStore.login({ username, password })
    → Login({ username, password })     // api/modules/auth.ts
      → request.post({ url: '/auth/sso/login', data: payload })
```

**实际发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/mf-shell/api/auth/sso/login`（`request` 工具自动拼接 `VITE_API_URL_PREFIX=/mf-shell/api`） |
| Content-Type | `application/json` |

**请求体**:
```json
{
  "username": "admin",
  "password": "123456"
}
```

**依赖**: 无，用户手动输入

**说明**: Vite 开发代理将 `/mf-shell/api` 转发到 `http://localhost:4130/api`，因此 Node BFF 收到的实际路径是 `POST /api/auth/sso/login`

---

### 步骤 ② Node BFF → Java SSO：用户登录

**来源文件**: `server/src/modules/auth/auth.controller.ts` → `server/src/modules/auth/auth.service.ts`

**调用链**:
```
AuthController.ssoLogin(payload)
  → AuthService.ssoLogin(payload)
    → AuthService.buildAuthorizeUrl()         // 先构建 authorizeUrl 备用
    → AuthService.performLogin(payload)       // 核心：调用 Java SSO 登录
```

**Node BFF 发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `{SSO_BASE_URL}/api/v1/sso/login` |
| Content-Type | `application/json` |

**请求体（Node BFF 组装）**:
```json
{
  "username": "admin",                              // ← 来自步骤①的 payload.username
  "password": "123456",                             // ← 来自步骤①的 payload.password
  "clientId": "test-client-001",                    // ← 环境变量 SSO_CLIENT_ID
  "redirectUri": "https://ones.wbm3.com/login",    // ← 环境变量 SSO_REDIRECT_URI
  "scope": "openid profile",                        // ← 固定值
  "state": "k7x2f9",                                // ← 随机生成的防 CSRF 字符串
  "rememberMe": true                                // ← 固定值 true
}
```

**依赖**:
- `username` + `password` ← 步骤①前端传来的请求体
- `clientId` ← 环境变量 `SSO_CLIENT_ID`
- `redirectUri` ← 环境变量 `SSO_REDIRECT_URI`

**Java SSO 响应**:

*响应头*:
```
Set-Cookie: SSO_SESSION_ID=abc123def456; Path=/; HttpOnly
```

*响应体*:
```json
{
  "success": true,
  "code": 200,
  "redirectUrl": "/oauth2/authorize?client_id=test-client-001&..."
}
```

**Node BFF 从响应中提取**:

| 提取项 | 来源 | 提取方式 | 后续用途 |
|--------|------|---------|---------|
| `sessionId` | 响应头 `Set-Cookie` | 正则 `/SSO_SESSION_ID=([^;]+)/` | **传递给步骤③**，作为 Cookie 带给 Java |
| `redirectUrl` | 响应体 `data.redirectUrl` | JSON 解析；如果是相对路径自动拼接 `SSO_BASE_URL` | **传递给步骤③**，作为请求 URL |

**成功判断条件**: `loginResp.ok && (data.success === true || data.code === 200)`

**失败时返回给前端**:
```json
{
  "code": 401,
  "message": "SSO Login Failed",
  "result": { /* Java原始返回数据 */ }
}
```

---

### 步骤 ③ Node BFF → Java SSO：带 Session Cookie 获取授权码

**来源文件**: `server/src/modules/auth/auth.service.ts` → `performAuthorizeCheck()`

**调用链**:
```
AuthService.ssoLogin()  （接续步骤②之后）
  → performAuthorizeCheck(finalAuthorizeUrl, ssoSessionId)
```

**Node BFF 发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `GET` |
| URL | 步骤②返回的 `redirectUrl`（完整 URL），或回退到 `buildAuthorizeUrl()` 构造的 URL |
| Cookie | `SSO_SESSION_ID={sessionId}`（← **来自步骤②提取的 sessionId**） |
| redirect | `manual`（不自动跟随重定向，手动获取 302 Location） |

**完整 URL 示例**:
```
GET {SSO_BASE_URL}/oauth2/authorize?client_id=test-client-001&response_type=code&redirect_uri=https://ones.wbm3.com/login&scope=openid%20profile&state=k7x2f9
```

**依赖**:
- `sessionId` ← **步骤②**从 Java 响应头 `Set-Cookie` 提取的 `SSO_SESSION_ID` —— **核心依赖，没有此 Cookie，Java 不知道用户已登录**
- `finalAuthorizeUrl` ← **步骤②**返回的 `redirectUrl`（优先），或 `buildAuthorizeUrl()` 构建的默认 URL

**Java SSO 响应**:

*场景 A：302 重定向（正常流程）*
```
HTTP/1.1 302 Found
Location: https://ones.wbm3.com/login?code=AUTH_CODE_12345&state=k7x2f9
```

*场景 B：JSON 直接返回 code（兼容处理）*
```json
{
  "code": "AUTH_CODE_12345"
}
```

**Node BFF 从响应中提取**:

| 提取项 | 来源 | 提取方式 | 后续用途 |
|--------|------|---------|---------|
| `code` | 302 Location URL 的 `code` 参数 | `new URL(location).searchParams.get('code')` | **传递给步骤④** |
| 或 `code` | JSON body 的 `code` 字段（string 且长度 > 10） | JSON 解析 | **传递给步骤④** |

---

### 步骤 ④ Node BFF → Java SSO：授权码换取 Token

**来源文件**: `server/src/modules/auth/auth.service.ts` → `getToken()`

**调用链**:
```
AuthService.ssoLogin()  （接续步骤③之后）
  → AuthService.getToken(code, ssoSessionId, payload.username)
```

**Node BFF 发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `{SSO_BASE_URL}/oauth2/token` |
| Authorization | `Basic {base64(clientId:clientSecret)}`（← 环境变量 `SSO_CLIENT_ID` + `SSO_CLIENT_SECRET`） |
| Content-Type | `application/x-www-form-urlencoded` |

**请求体**:
```
grant_type=authorization_code&code=AUTH_CODE_12345&redirect_uri=https://ones.wbm3.com/login
```

| 参数 | 来自 | 说明 |
|------|------|------|
| `grant_type` | 固定值 | `authorization_code` |
| `code` | **步骤③提取的 `code`** | **核心依赖——OAuth2 授权码** |
| `redirect_uri` | 环境变量 `SSO_REDIRECT_URI` | 必须与步骤②发送给 Java 的一致 |

**依赖**:
- `code` ← **步骤③**返回的授权码 —— **核心依赖，这是整个 OAuth2 流程的交换凭证**
- `clientId` + `clientSecret` ← 环境变量（Basic Auth）
- `redirect_uri` ← 环境变量（必须与步骤②一致）

**Java SSO 响应（标准 OAuth2 Token Response）**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "Xr5kGt...",
  "id_token": "eyJhbGciOiJSUzI1NiIs...",
  "scope": "openid profile"
}
```

---

### 步骤 ⑤ Node BFF 标准化数据并返回给前端

**来源文件**: `server/src/modules/auth/auth.service.ts` → `getToken()` 的返回值处理

Node BFF 将 Java SSO 返回的下划线命名转换为驼峰命名，并注入额外字段：

**Controller 使用 `@Res()` 直接发送响应**（`auth.controller.ts`）:
```typescript
@Post('sso/login')
async ssoLogin(@Body() payload, @Res() res) {
  const result = await this.auth.ssoLogin(payload)
  return res.status(200).send(result)
}
```

**返回给前端的响应体**:
```json
{
  "code": 2000,
  "message": "Login Success",
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "refreshToken": "Xr5kGt...",
    "idToken": "eyJhbGciOiJSUzI1NiIs...",
    "scope": "openid profile",
    "ssoSessionId": "abc123def456",
    "username": "admin"
  }
}
```

**字段来源映射**:

| 返回字段 | 来自哪一步 | 具体来源 |
|---------|-----------|---------|
| `accessToken` | 步骤④ | Java 返回的 `access_token` |
| `tokenType` | 步骤④ | Java 返回的 `token_type`，默认 `"Bearer"` |
| `expiresIn` | 步骤④ | Java 返回的 `expires_in` |
| `refreshToken` | 步骤④ | Java 返回的 `refresh_token` |
| `idToken` | 步骤④ | Java 返回的 `id_token` |
| `scope` | 步骤④ | Java 返回的 `scope` |
| `ssoSessionId` | 步骤② | `performLogin()` 从响应头 `Set-Cookie` 提取的 `SSO_SESSION_ID` |
| `username` | 步骤①（优先） | `payload.username`；如为空则从 `id_token` JWT 解码 `preferred_username > sub > name` |

---

### 步骤 ⑥ 前端存储登录凭证

**来源文件**: `fe/src/stores/modules/user.ts` → `login()` action

前端收到步骤⑤的响应后，`transformRequestHook` 检测到 `code: 2000`，返回 `data` 对象。Store 执行：

```
1. 从 response.data 取出 accessToken 和 tokenType
2. 拼接完整 token = `${tokenType} ${accessToken}` → 例如 "Bearer eyJhbGci..."
3. 存入 Pinia state: this.token = "Bearer eyJhbGci..."
4. 存入 Pinia state: this.authenticationScheme = "Bearer"
5. 存入 Pinia state: this.userInfo.username = response.data.username
6. 存入 localStorage: localStorage.setItem('sso_session_id', response.data.ssoSessionId)
7. Pinia 持久化插件自动将 token/authenticationScheme/userInfo/systemList 同步到 localStorage('user')
```

**存储位置总结**:

| 数据 | 存储位置 | 后续用途 |
|------|---------|---------|
| `"Bearer {accessToken}"` | `Pinia state.token` → 自动持久化到 `localStorage('user').token` | 步骤⑦及后续所有请求的 `Authorization` / `WB-Access-Token` Header |
| `ssoSessionId` | `localStorage('sso_session_id')` | 登出流程步骤①读取 |
| `username` | `Pinia state.userInfo.username` → `localStorage('user').userInfo.username` | 页面展示 |

**依赖**: 步骤⑤返回的 `data.accessToken`、`data.tokenType`、`data.ssoSessionId`、`data.username`

---

### 步骤 ⑦ 前端拉取系统权限列表

**来源文件**: `fe/src/stores/modules/user.ts` → `fetchSystemPermissions()` → `fe/src/api/modules/auth.ts` → `getUserPermissions()`

**调用链**（紧接步骤⑥，在 `login()` action 内部）:
```
userStore.login()
  → ... 步骤⑥存储完成 ...
  → await this.fetchSystemPermissions()
    → getUserPermissions('')
      → request.post({ url: '/wb-acs/api/...', data }, { isJoinPrefix: false })
```

**实际发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/wb-acs/api/userPermissions/loadUserPermission`（`isJoinPrefix: false`，不加 `/mf-shell/api` 前缀） |
| Content-Type | `application/json` |
| Authorization | `Bearer {accessToken}`（← 步骤⑥存储的 token，请求拦截器自动从 `localStorage('user').token` 读取并附加） |
| WB-Access-Token | `Bearer {accessToken}`（← 同上，请求拦截器同时设置两个 Header） |

**请求体**:
```json
{
  "sysUuid": "9b2de387cf7a519fed2c10d40a3cea1a",
  "fatherUuid": ""
}
```

> **该请求直连 Java ACS 权限服务，不经过 Node BFF**（通过 Vite 代理或 Nginx 反向代理转发）

**依赖**:
- `token` ← **步骤⑥**刚存储的 token（请求拦截器自动读取 `localStorage('user').token` 设置到 Header）
- Java 权限服务通过 `WB-Access-Token` Header 解析用户身份，前端不需要额外传 `userName`

**响应示例**:
```json
{
  "code": 200,
  "data": [
    { "uuid": "xxx", "name": "系统A", "icon": "...", ... },
    { "uuid": "yyy", "name": "系统B", "icon": "...", ... }
  ]
}
```

**处理逻辑**: 将 `res.data` 存入 `userStore.systemList` 和 `permissionStore.setSystemList()`

**异常处理**: `try/catch` 包裹，失败只 `console.error`，**不阻断登录流程**

---

### 步骤⑦之后：前端跳转

**来源文件**: `fe/src/pages/login/index.vue` → `onSubmit()`

```
userStore.login() 返回后：

1. 检查 res.data.redirectUrl 是否存在
   → 存在 → window.location.href = redirectUrl （SSO 重定向场景）
   → 不存在 → 继续

2. 检查 userStore.token 是否存在
   → 存在 → MessagePlugin.success('登录成功') → router.push('/dashboard')
   → 不存在 → MessagePlugin.error('Login failed: No access token received')

3. catch 块: MessagePlugin.error(e.message || 'Login failed')
4. finally: loading.value = false
```

**依赖**: 步骤⑤返回的 `data.redirectUrl`（如果有）或步骤⑥存储的 `userStore.token`

---

## 二、登出完整流程

整个登出由 **5 个步骤** 串联。

### 总览时序图

```
 前端 Vue3                          Node BFF (NestJS)                Java SSO Server
    │                                    │                              │
    │── ① 调用 logout API ─────────────▶│                              │
    │   body: {ssoSessionId}            │                              │
    │   header: WB-Access-Token         │                              │
    │                                    │── ② POST /sso/logout ──────▶│
    │                                    │   Cookie: SSO_SESSION_ID     │
    │                                    │   WB-Access-Token            │
    │                                    │   {postLogoutRedirectUri}    │
    │                                    │◀── 响应 ───────────────────│
    │◀── ③ {clearStorage:true} ────────│                              │
    │                                    │                              │
    │── ④ 清除本地存储 ────────────────│                              │
    │── ⑤ 跳转 /login ────────────────│                              │
```

---

### 步骤 ① 前端发起登出请求

**来源文件**: `fe/src/stores/modules/user.ts` → `logout()` → `fe/src/api/modules/auth.ts` → `logout()`

**调用链**:
```
userStore.logout(true)                // isLogoutApi = true，需要调用后端登出接口
  → Logout()                          // api/modules/auth.ts
    → ssoSessionId = localStorage.getItem('sso_session_id')
    → request.post({ url: '/auth/logout', data: { ssoSessionId } })
```

**实际发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/mf-shell/api/auth/logout` |
| Content-Type | `application/json` |
| Authorization | `Bearer {accessToken}`（请求拦截器自动从 `localStorage('user').token` 读取） |
| WB-Access-Token | `Bearer {accessToken}`（请求拦截器同时设置） |

**请求体**:
```json
{
  "ssoSessionId": "abc123def456"
}
```

**依赖**:
- `ssoSessionId` ← `localStorage('sso_session_id')` ← **登录步骤⑥**存储的 ssoSessionId
- `token` ← `localStorage('user').token` ← **登录步骤⑥**存储的 token（请求拦截器自动读取设置到 Header）

---

### 步骤 ② Node BFF → Java SSO：调用登出接口

**来源文件**: `server/src/modules/auth/auth.controller.ts` → `server/src/modules/auth/auth.service.ts` → `logout()`

**Controller 入口**:
```typescript
@Post('logout')
async logout(
  @Body() body: { ssoSessionId?: string },          // ← 步骤①请求体的 ssoSessionId
  @Headers('wb-access-token') wbAccessToken?: string  // ← 步骤①请求头的 WB-Access-Token
) {
  const result = await this.auth.logout(body.ssoSessionId, wbAccessToken)
  return { code: 200, result }
}
```

**Node BFF 发出的 HTTP 请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `{SSO_BASE_URL}/api/v1/sso/logout` |
| Content-Type | `application/json` |
| Cookie | `SSO_SESSION_ID={ssoSessionId}`（← 步骤①请求体的 `body.ssoSessionId`） |
| WB-Access-Token | `{wbAccessToken}`（← 步骤①请求头的 `wb-access-token`） |

**请求体**:
```json
{
  "postLogoutRedirectUri": "https://ones.wbm3.com/login"
}
```

> `postLogoutRedirectUri` 来自环境变量 `SSO_REDIRECT_URI`

**依赖**:
- `ssoSessionId` ← 步骤①请求体 → 作为 Cookie 发给 Java
- `wbAccessToken` ← 步骤①请求头 → 透传给 Java

---

### 步骤 ③ Node BFF 返回结果给前端

**无论 Java 登出成功还是失败，都返回 `clearStorage: true`**

*成功情况*:
```json
{ "code": 200, "result": { "success": true, "clearStorage": true, "data": { ... } } }
```

*Java 返回错误*:
```json
{ "code": 200, "result": { "success": false, "message": "SSO Logout Failed", "clearStorage": true, "data": { ... } } }
```

*网络/代码异常*:
```json
{ "code": 200, "result": { "code": 500, "message": "Logout Failed", "clearStorage": true } }
```

---

### 步骤 ④ 前端清除本地存储

**来源文件**: `fe/src/api/modules/auth.ts` → `logout()` 和 `fe/src/stores/modules/user.ts` → `logout()`

**两层清除**:

**API 层**（`auth.ts`）:
```
正常返回时：if (response.clearStorage === true) → localStorage.clear()
catch 异常时：也执行 localStorage.clear()
```

**Store 层**（`user.ts`）— 无论 API 成功还是失败都执行:
```
this.token = ''
this.userInfo = { ...InitUserInfo }
this.systemList = []
localStorage.clear()
```

> 三重容错设计：即使 API 调用失败、即使 Java 登出失败，前端本地状态都会被清理

---

### 步骤 ⑤ 前端跳转登录页

由调用 `logout()` 的上层组件执行 `router.push('/login')` 或 `window.location.href = '/login'`

---

## 三、Token 鉴权流程（已登录后的每次请求）

登录成功后，前端每次发起 HTTP 请求都会自动附加 Token。

### 3.1 前端请求拦截器（自动附加 Token）

**来源文件**: `fe/src/utils/request/index.ts` → `requestInterceptors`

**执行逻辑**:
```
每次请求前自动执行：
1. 从 localStorage('user') 读取 JSON，解析出 token 字段
   （token 格式为 "Bearer eyJhbGci..."，在登录步骤⑥已拼接好）
2. 如果 token 存在 且 requestOptions.withToken !== false：
   设置两个请求头：
   - headers.Authorization = "Bearer eyJhbGci..."      ← 给 Node BFF 的 AuthGuard 使用
   - headers['WB-Access-Token'] = "Bearer eyJhbGci..."  ← 给 Java 权限服务使用
```

**依赖**: `localStorage('user').token` — 来自**登录步骤⑥**的存储

### 3.2 前端响应拦截器（错误码处理）

**来源文件**: `fe/src/utils/request/index.ts`

**`responseInterceptors`（先执行）**:

| 响应体 `code` | 处理方式 | 后续 |
|---------------|---------|------|
| `4001` | `localStorage.clear()` → `MessagePlugin.error('Session expired...')` → `window.location.href = '/login'` | `Promise.reject(AxiosError)` |
| `403` | 设置 `res.status = 403`, `res.statusText = message` | `Promise.reject(AxiosError)` |
| `500` | 设置 `res.status = 500`, `res.statusText = message` | `Promise.reject(AxiosError)` |
| 其他 | 正常通过，交给 `transformRequestHook` | `return res` |

**`transformRequestHook`（后执行）**:

| 响应体 `code` | 处理方式 |
|---------------|---------|
| `200` 或 `2000` | 返回 `data.result \|\| data`（正常数据） |
| 其他（未被拦截器 reject 的） | 如果 `useErrorInterceptors: true` → `MessagePlugin.error(message)` → 返回 `null` |

**`responseInterceptorsCatch`（网络层错误）**:

| 场景 | 处理 |
|------|------|
| HTTP 401 | `MessagePlugin.error('Unauthorized')` + `Promise.reject` |
| 其他网络错误 | 自动重试（最多 3 次，间隔 1000ms），超过后 `Promise.reject` |

### 3.3 Node BFF AuthGuard（受保护路由的 Token 校验）

**来源文件**: `server/src/common/guards/auth.guard.ts`

**应用于**: 需要鉴权的路由（如 `/proxy/*` 反向代理接口）。登录/登出接口**不经过此 Guard**。

**校验流程**:

```
1. 从请求头获取 Authorization
   → 缺失 → 抛出 UnauthorizedException('Missing Authorization Header')

2. 解析 "Bearer {token}" 格式
   → 格式不对 → 抛出 UnauthorizedException('Invalid Token Format')

3. 检查是否为 mock_token（开发调试后门）
   → 是 → 设置 req.user = { username: 'mock_user', roles: ['admin'] }, 放行

4. 调用 authService.validateToken(token)
   → 实际发起: GET {SSO_BASE_URL}/oauth2/userinfo
   → 请求头: Authorization: Bearer {token}   ← token 来自前端请求头

5. 根据 validateToken 结果:
   → Java 返回 HTTP 200 + 用户信息 JSON → 设置 req.user = userInfo, 放行
   → Java 返回非 200 或异常 → 抛出 UnauthorizedException('Token Validation Failed')
```

**依赖**: 前端请求头中的 `Authorization` 值 → 来自**登录步骤⑥**存储的 token

---

## 四、路由守卫流程

**来源文件**: `fe/src/main.ts` → `appRouter.beforeEach`

```
用户访问任意路由 (to)
    │
    ├── to.path 在白名单 ['/login'] 中？
    │   ├── 是 /login 且 userStore.token 存在
    │   │   → next('/dashboard')           // 已登录用户访问登录页，重定向到首页
    │   └── 否则
    │       → next()                       // 放行，显示登录页
    │
    └── to.path 不在白名单中
        ├── userStore.token 存在？
        │   → next()                       // 有 Token，放行
        └── userStore.token 不存在
            → next('/login')               // 无 Token，重定向到登录页
```

**根路由 `/` 的重定向**（`fe/src/router/modules/home.ts`）：
```
访问 / → redirect 函数执行：
  从 localStorage('user') 读取并解析 JSON
  → userData.token 存在 → 重定向到 /dashboard
  → userData.token 不存在 → 重定向到 /login
```

**依赖**: `Pinia state.token`（来自 `localStorage('user').token`）— **登录步骤⑥**的存储

---

## 五、权限加载流程

### 5.1 系统列表权限（登录时自动加载）

见 [登录步骤⑦](#步骤--前端拉取系统权限列表)，在 `userStore.login()` 内部自动调用。

### 5.2 子系统菜单/按钮权限

**来源文件**: `fe/src/api/modules/auth.ts` → `getUserSubPermissions()`

**请求**:

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/wb-acs/api/userPermissions/loadUserPermission`（直连 Java，不加前缀） |
| Authorization | `Bearer {accessToken}`（请求拦截器自动附加） |
| WB-Access-Token | `Bearer {accessToken}`（请求拦截器自动附加） |

**请求体**:
```json
{
  "sysUuid": "5a1c4589c43c138c1478fe99aa61dd66",
  "fatherUuid": "父级权限UUID"
}
```

**依赖**:
- `token` ← **登录步骤⑥**存储
- `fatherUuid` ← 由业务上下文提供（例如从 5.1 系统列表中选中的某个系统 UUID）

---

## 六、SSO 状态检测流程

**来源文件**: `server/src/modules/auth/auth.controller.ts` → `server/src/modules/auth/auth.service.ts` → `ssoCheck()`

### 前端请求

| 项目 | 值 |
|------|-----|
| 方法 | `GET` |
| URL | `/mf-shell/api/auth/sso/check` |

### Node BFF 内部逻辑

```
1. 构建 OAuth2 授权 URL:
   {SSO_BASE_URL}/oauth2/authorize?client_id={SSO_CLIENT_ID}&response_type=code&redirect_uri={SSO_REDIRECT_URI}&scope=openid%20profile&state={random}

2. 发起 GET fetch(authorizeUrl)
   ⚠️ 不带用户 Cookie（Node 端无浏览器 Cookie 上下文）

3. 解析 Java SSO 响应:
   ├── JSON: require_login === true
   │   → redirectUrl = data.login_url（相对路径自动拼接 SSO_BASE_URL）
   │   → 返回 { code: 401, message: "SSO Login Required", result: { requireLogin: true, redirectUrl } }
   │
   ├── JSON: require_login === false 或 HTTP 302/redirected
   │   → 返回 { code: 200, message: "SSO Logged In", result: { requireLogin: false } }
   │
   └── 默认/异常
       → 返回 { code: 401, message: "SSO Check Failed (Default)", result: { requireLogin: true } }
       → 或 { code: 500, message: "SSO Check Error" }
```

**依赖**: 仅需环境变量 `SSO_BASE_URL`、`SSO_CLIENT_ID`、`SSO_REDIRECT_URI`，不依赖用户 Token

**注意**: 由于 Node BFF 不持有浏览器的 SSO Cookie，此接口在代理模式下通常始终返回"需要登录"。主要用于获取 SSO 登录跳转地址。

---

## 七、密码相关流程（直连 Java）

以下接口**直连 Java SSO 服务**，`isJoinPrefix: false` 不经过 Node BFF。

### 7.1 忘记密码 - 发送验证码

**来源文件**: `fe/src/api/modules/auth.ts` → `forgotPasswordSendEmail()`

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/wb-sso/api/v1/sso/sendVerificationCode` |

**请求体**:
```json
{ "email": "user@example.com" }
```

**依赖**: 无鉴权要求，用户输入邮箱

### 7.2 忘记密码 - 重置密码

**来源文件**: `fe/src/api/modules/auth.ts` → `forgotPasswordUpdate()`

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/wb-sso/api/v1/sso/password/forgot/reset` |

**请求体**:
```json
{
  "email": "user@example.com",
  "verificationCode": "123456",
  "newPassword": "newPass123",
  "confirmPassword": "newPass123"
}
```

**依赖**: `verificationCode` ← 来自 **7.1** Java 发送到邮箱的验证码

### 7.3 修改密码（已登录用户）

**来源文件**: `fe/src/api/modules/auth.ts` → `changePassword()`

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| URL | `/wb-sso/api/v1/sso/password/reset` |
| Authorization | `Bearer {accessToken}`（请求拦截器自动附加） |
| WB-Access-Token | `Bearer {accessToken}`（请求拦截器自动附加） |

**请求体**:
```json
{
  "oldPassword": "oldPass123",
  "newPassword": "newPass456",
  "confirmPassword": "newPass456",
  "userId": "可选的用户ID"
}
```

**依赖**: `token` ← **登录步骤⑥**存储的 Token（Java 通过 Header 中的 Token 识别用户身份）

---

## 八、Node BFF 全局异常处理

### 8.1 全局异常过滤器

**来源文件**: `server/src/common/filters/global-exception.filter.ts`

**规则**: 所有未捕获异常统一返回 **HTTP 200** + 错误结构体：

```json
{ "code": 1, "msg": "错误信息" }
```

> Node BFF **不会返回 HTTP 4xx/5xx 状态码**，前端需要依靠响应体中的 `code` 字段判断是否出错

### 8.2 响应拦截器

**来源文件**: `server/src/common/interceptors/response.interceptor.ts`

```
Controller 返回值处理：
  ├── 返回的对象已有 code 字段 → 原样返回（不包装）
  └── 返回的对象没有 code 字段 → 包装为 { code: 0, data: body }
```

### 8.3 超时拦截器

**来源文件**: `server/src/common/interceptors/timeout.interceptor.ts`

- 默认超时: `10000ms`
- 超时响应: `{ code: 1, msg: 'Request timeout' }`

### 8.4 登录各步骤的错误返回汇总

| 步骤 | 错误场景 | Node BFF 返回给前端 | 前端处理 |
|------|---------|--------------------|---------|
| ② performLogin | 用户名/密码错误，Java 返回失败 | `{ code: 401, message: "SSO Login Failed", result: {Java原始data} }` | `transformRequestHook` 检测到 code 非 200/2000 → `MessagePlugin.error(message)` → 返回 `null` |
| ③ performAuthorizeCheck | 未获取到 code 也无 redirectUrl | `{ code: 401, message: "SSO Login Failed (No Code or Redirect)" }` | 同上 |
| ④ getToken | Java 返回的数据不含 `access_token` | `{ code: 501, message: "Invalid Token Response", success: false }` | 同上 |
| ④ getToken | 请求 Java 失败（网络等） | `{ code: 500, message: "Get Token Failed", data: { detail: errorDetail } }` | `responseInterceptors` 检测 code=500 → `Promise.reject(AxiosError)` |
| ssoLogin 外层 | 任意未捕获异常 | `{ code: 500, message: e.message }` | `responseInterceptors` 检测 code=500 → `Promise.reject(AxiosError)` |
| 全局 | 异常穿透到 Filter | HTTP 200 + `{ code: 1, msg: "错误信息" }` | `transformRequestHook` → code 非 200/2000 → 返回 `null` |

### 8.5 前端对 code 4001 的特殊处理（Session 过期强制登出）

当任何接口返回 `code: 4001` 时，前端 `responseInterceptors` 执行：
```
1. localStorage.clear()                           // 清除所有本地存储
2. MessagePlugin.error('Session expired...')       // 弹出提示
3. window.location.href = '/login'                 // 强制跳转登录页（硬跳转，非 router.push）
4. return Promise.reject(AxiosError)               // 中断后续处理链
```

> 这是 Session/Token 过期后的全局兜底机制。由于项目**未实现基于 refreshToken 的 Token 自动刷新**，过期后直接引导用户重新登录。

---

## 附录：所有 API 端点一览

### A. 前端 → Node BFF（经过 `/mf-shell/api` 前缀）

| 方法 | Controller 路径 | 完整 URL | 说明 | 需要 Token |
|------|----------------|----------|------|-----------|
| POST | `api/auth/sso/login` | `/mf-shell/api/auth/sso/login` | SSO 代理登录（核心） | ❌ |
| GET | `api/auth/sso/authorize` | `/mf-shell/api/auth/sso/authorize` | 获取 SSO 授权地址 | ❌ |
| GET | `api/auth/sso/check` | `/mf-shell/api/auth/sso/check` | SSO 状态检测 | ❌ |
| GET | `api/auth/sso/token` | `/mf-shell/api/auth/sso/token?code=xxx` | 授权码换 Token | ❌ |
| POST | `api/auth/login` | `/mf-shell/api/auth/login` | 登录（内部代理到 ssoLogin） | ❌ |
| POST | `api/auth/logout` | `/mf-shell/api/auth/logout` | 登出 | ✅ Header 中 |
| GET | `api/auth/me` | `/mf-shell/api/auth/me` | 获取当前用户信息 | ✅ Header 中 |

### B. 前端 → Java 服务（直连，不加 `/mf-shell/api` 前缀）

| 方法 | URL | 说明 | 需要 Token |
|------|-----|------|-----------|
| POST | `/wb-acs/api/userPermissions/loadUserPermission` | 查询用户权限 | ✅ `WB-Access-Token` |
| POST | `/wb-sso/api/v1/sso/sendVerificationCode` | 忘记密码-发送验证码 | ❌ |
| POST | `/wb-sso/api/v1/sso/password/forgot/reset` | 忘记密码-重置 | ❌ |
| POST | `/wb-sso/api/v1/sso/password/reset` | 修改密码 | ✅ `Authorization` |

### C. Node BFF → Java SSO Server（内部调用）

| 方法 | URL | 认证方式 | 调用时机 | 依赖 |
|------|-----|---------|---------|------|
| POST | `{SSO_BASE_URL}/api/v1/sso/login` | 无 | 登录步骤② | 步骤①的 username/password |
| GET | `{SSO_BASE_URL}/oauth2/authorize?...` | Cookie: SSO_SESSION_ID | 登录步骤③ | 步骤②的 sessionId + redirectUrl |
| POST | `{SSO_BASE_URL}/oauth2/token` | Basic Auth (clientId:clientSecret) | 登录步骤④ | 步骤③的 code |
| GET | `{SSO_BASE_URL}/oauth2/userinfo` | Bearer Token | AuthGuard Token 校验 | 前端传来的 accessToken |
| POST | `{SSO_BASE_URL}/api/v1/sso/logout` | Cookie + WB-Access-Token | 登出步骤② | 登出步骤①的 ssoSessionId + token |
