# permission-common 模块分析

## 模块概述
公共基础模块，提供通用组件、工具类、枚举、异常定义等。被其他所有模块依赖。

---

## 目录结构

```
permission-common/
└── src/main/java/com/permission/common/
    ├── annotation/        # 自定义注解
    ├── config/            # 配置类
    ├── constant/          # 常量定义
    ├── context/           # 上下文持有者
    ├── enums/             # 枚举类型
    ├── exception/         # 异常定义
    ├── result/            # 统一响应
    └── util/              # 工具类
```

---

## 注解（Annotation）

### @RequirePermission
**用途**: 接口权限控制

```java
@RequirePermission("PERMISSION_CENTER_PERMISSION_CREATE")
@RequirePermission(value = "ROLE_VIEW", projectId = "PROJECT_001")
```

| 属性 | 类型 | 说明 |
|------|------|------|
| value | String | 权限编码 |
| projectId | String | 项目ID（可选） |

---

### @DataPermission
**用途**: 数据权限控制

| 属性 | 类型 | 说明 |
|------|------|------|
| enabled | boolean | 是否启用 |
| resourceType | String | 资源类型 |

---

### @AuditLog
**用途**: 审计日志标记

| 属性 | 类型 | 说明 |
|------|------|------|
| module | String | 模块名 |
| action | String | 操作类型 |
| targetType | String | 目标类型 |

---

## 上下文（Context）

### UserContextHolder
**用途**: 请求范围内传递用户信息

| 方法 | 说明 |
|------|------|
| setUser(UserInfoDTO) | 设置用户信息 |
| getUser() | 获取用户信息 |
| getUserId() | 获取用户ID（未登录抛异常） |
| clear() | 清除用户信息 |
| hasUser() | 判断是否有用户信息 |

### UserInfoDTO
| 字段 | 类型 | 说明 |
|------|------|------|
| userId | String | 用户ID |
| sessionId | String | 会话ID |

### DataPermissionContextHolder
**用途**: 数据权限上下文传递

| 方法 | 说明 |
|------|------|
| setContext(DataPermissionContext) | 设置上下文 |
| getContext() | 获取上下文 |
| clear() | 清除上下文 |

---

## 枚举（Enums）

### RoleScopeEnum - 角色范围
| 值 | 编码 | 说明 |
|----|------|------|
| GLOBAL | GLOBAL | 全局角色 |
| PROJECT | PROJECT | 项目角色 |

### RoleDomainEnum - 角色域
| 值 | 说明 |
|----|------|
| APP | 应用角色 |
| PERM_CENTER | 权限中心角色 |

### PermissionTypeEnum - 权限类型
| 值 | 编码 | 说明 |
|----|------|------|
| MENU | MENU | 菜单 |
| PAGE | PAGE | 页面 |
| ACTION | ACTION | 操作 |

### PermissionEffectEnum - 权限效果
| 值 | 编码 | 说明 |
|----|------|------|
| ALLOW | ALLOW | 授予 |
| DENY | DENY | 排除 |

### CommonStatusEnum - 通用状态
| 值 | 说明 |
|----|------|
| ENABLED | 启用 |
| DISABLED | 禁用 |

### DataScopeTypeEnum - 数据范围
| 值 | 说明 |
|----|------|
| ALL | 全部数据 |
| DEPARTMENT | 部门数据 |
| SELF | 仅自己 |

### LoginTypeEnum - 登录类型
| 值 | 说明 |
|----|------|
| PASSWORD | 密码登录 |
| SSO | SSO登录 |

### SessionStatusEnum - 会话状态
| 值 | 说明 |
|----|------|
| ACTIVE | 活跃 |
| REVOKED | 已撤销 |

---

## 异常（Exception）

### ErrorCode - 错误码枚举

#### 权限点相关 (142xxx)
| 错误码 | 说明 |
|--------|------|
| 142001 | 权限点不存在 |
| 142002 | 权限编码已存在 |
| 142003 | 父权限点不存在 |
| 142004 | 循环引用 |
| 142005 | 存在子权限 |
| 142006 | 已被角色引用 |
| 142007 | 已被用户授权 |
| 142008 | 权限点已禁用 |
| 141001 | 权限编码格式不正确 |

#### 角色相关 (1421xx)
| 错误码 | 说明 |
|--------|------|
| 142101 | 角色不存在 |
| 142102 | 角色编码已存在 |
| 142103 | 角色已禁用 |
| 142104 | 角色已被用户引用 |

#### 用户授权相关 (1422xx)
| 错误码 | 说明 |
|--------|------|
| 142201 | 用户角色已存在 |
| 142202 | 用户角色不存在 |
| 142203 | 授权记录已存在 |
| 142204 | 用户权限记录不存在 |
| 142205 | 全局角色不支持指定项目 |

#### 项目相关 (14221x)
| 错误码 | 说明 |
|--------|------|
| 142211 | 项目不存在 |
| 142212 | 项目编码已存在 |
| 142213 | 项目已被用户角色引用 |
| 142214 | 项目已被用户权限引用 |

#### 组织相关 (1423xx)
| 错误码 | 说明 |
|--------|------|
| 142301 | 组织编码已存在 |
| 142302 | 父组织不存在 |
| 142303 | 组织不存在 |
| 142304 | 循环引用 |
| 142305 | 存在子组织 |
| 142306 | 已关联角色 |
| 142307 | 存在成员 |

#### 鉴权相关 (144xxx)
| 错误码 | 说明 |
|--------|------|
| 144001 | 鉴权参数无效 |
| 144002 | 用户未登录 |
| 144003 | 无权访问 |

#### 登录认证相关 (143xxx)
| 错误码 | 说明 |
|--------|------|
| 143001 | 用户名或密码错误 |
| 143002 | 用户已禁用 |
| 143003 | 登录失败 |
| 143004 | Refresh Token无效 |
| 143005 | 会话已失效 |
| 143006 | SSO认证失败 |
| 143007 | Token已过期 |
| 143008 | Token无效 |
| 143009 | 未登录或登录已过期 |
| 143010 | 请求过于频繁 |

#### 用户管理相关 (1424xx)
| 错误码 | 说明 |
|--------|------|
| 142401 | 用户不存在 |
| 142402 | 用户ID已存在 |
| 142403 | 手机号已被使用 |
| 142404 | 邮箱已被使用 |

### BusinessException
业务异常，携带 ErrorCode

### SystemException
系统异常

---

## 配置类（Config）

### AuthInterceptor
**用途**: 认证拦截器

**处理流程**:
1. 从 Header 或 Cookie 提取 Token
2. 解析 JWT Claims
3. 验证 Token 类型为 access
4. 验证 Session 有效性
5. 设置 UserContextHolder

**常量**:
| 常量 | 值 |
|------|------|
| AUTHORIZATION_HEADER | Authorization |
| BEARER_PREFIX | Bearer |
| ACCESS_TOKEN_COOKIE | access_token |

### SessionValidator
**用途**: Session 有效性验证

### JwtConfig
**用途**: JWT 配置

### PermissionConfig
**用途**: 权限配置（含超级管理员判断）

### AsyncConfig
**用途**: 异步任务配置

---

## 工具类（Util）

### JwtUtil
**用途**: JWT Token 生成与解析

| 方法 | 说明 |
|------|------|
| generateToken(...) | 生成 Token |
| parseToken(token) | 解析 Token |
| validateToken(token) | 验证 Token |

---

## 统一响应（Result）

### ApiResponse
```java
{
  "code": 200,
  "message": "success",
  "data": T
}
```

| 方法 | 说明 |
|------|------|
| success(data) | 成功响应 |
| success() | 成功响应（无数据） |
| fail(code, message) | 失败响应 |
| systemError() | 系统错误 |

### PageResult
```java
{
  "total": 100,
  "pageNum": 1,
  "pageSize": 10,
  "list": List<T>
}
```

---

## 常量（Constant）

### PermissionCode
权限编码常量定义

### PermissionConstant
权限相关常量

---

## 模块依赖关系

```
┌─────────────────────────────────────────────────────────────┐
│                    permission-web                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    permission-biz                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   permission-service                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    permission-dal                            │
└─────────────────────────────────────────────────────────────┘

         ▲              ▲              ▲              ▲
         │              │              │              │
         └──────────────┴──────────────┴──────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   permission-common                          │
│  (annotation, config, constant, context, enums, exception,  │
│   result, util)                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 技术特点

1. **ThreadLocal 上下文**: 使用 ThreadLocal 实现请求范围的用户信息传递
2. **统一错误码**: 按模块划分错误码区间，便于定位问题
3. **注解驱动**: 通过自定义注解实现权限控制和审计日志
4. **Token 双模式**: 支持 Header 和 Cookie 两种 Token 传递方式
