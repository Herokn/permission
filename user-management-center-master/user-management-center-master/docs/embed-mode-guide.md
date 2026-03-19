# 嵌入模式使用说明

## 概述

本系统支持被其他系统以 iframe 或独立窗口方式嵌入，通过 URL 传递 token 的方式实现单点登录。

## 实现方案

### 架构流程

```
1. 父系统 → 拼接 token 到 URL
   https://your-domain.com/token-bridge?token=xxx&redirect=/users/list

2. Token 桥接页 → 处理 token
   - 提取 token 并存入 localStorage
   - 标记为嵌入模式
   - 清除 URL 中的 token（防止泄露）
   - 跳转到目标路由

3. 业务页面 → 正常访问
   - axios 自动从 localStorage 读取 token
   - 接口请求自动携带 Authorization 头

4. Token 过期 (4001) → 智能跳转
   - 嵌入模式：跳转到 https://wbs.wanbridge.com/
   - 独立访问：跳转到 https://ones.wbm3.com/mf-shell/login
```

## 使用方式

### 1️⃣ 父系统嵌入本系统

```html
<!-- 方式一：iframe 嵌入 -->
<iframe
  src="https://your-domain.com/token-bridge?token=YOUR_TOKEN&redirect=/users/list"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>

<!-- 方式二：新窗口打开 -->
<a href="https://your-domain.com/token-bridge?token=YOUR_TOKEN&redirect=/users/list" target="_blank"> 打开用户中心 </a>
```

### 2️⃣ URL 参数说明

| 参数       | 必填 | 说明                       | 示例          |
| ---------- | ---- | -------------------------- | ------------- |
| `token`    | ✅   | 认证 token                 | `eyJhbGc...`  |
| `redirect` | ⚠️   | 目标路由（可选，默认 `/`） | `/users/list` |

**完整示例：**

```
https://your-domain.com/token-bridge?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&redirect=/users/list
```

### 3️⃣ Token 格式要求

- 必须是有效的 JWT token
- 需要包含必要的用户信息
- 后端接口需支持 `Authorization: Bearer {token}` 验证

## 核心文件说明

### 📁 项目结构

```
fe/src/
├── utils/
│   └── embed-mode.ts          # 嵌入模式管理工具
├── pages/
│   └── TokenBridge.vue        # Token 中间页组件
├── router/
│   └── modules/
│       └── token-bridge.ts    # 路由配置
└── utils/request/
    └── index.ts               # axios 拦截器（已修改）
```

### 📄 核心代码

#### 1. `embed-mode.ts` - 嵌入模式管理

```typescript
import { EmbedModeManager } from '@/utils/embed-mode'

// 检查是否为嵌入模式
EmbedModeManager.isEmbedMode() // true/false

// 获取 token
EmbedModeManager.getToken()

// 处理未授权错误（自动判断跳转）
EmbedModeManager.handleUnauthorized()
```

#### 2. `TokenBridge.vue` - 中间页

自动处理逻辑：

- ✅ 提取 URL 中的 token
- ✅ 保存到 localStorage
- ✅ 标记嵌入模式
- ✅ 清除 URL 参数
- ✅ 跳转到目标路由

#### 3. axios 拦截器

**请求拦截：** 自动添加 token

```typescript
headers.Authorization = `Bearer ${token}`
```

**响应拦截：** 处理 4001 错误

```typescript
if (response?.data?.code === 4001) {
  EmbedModeManager.handleUnauthorized()
}
```

## 安全性说明

### ✅ 已实现的安全措施

1. **URL 清理**：token 提取后立即从 URL 中移除
2. **历史记录保护**：使用 `replaceState` 避免 token 记录在浏览器历史
3. **localStorage 隔离**：不同域名的 localStorage 相互隔离
4. **智能跳转**：4001 错误自动区分场景跳转

### ⚠️ 注意事项

1. **HTTPS 部署**：生产环境必须使用 HTTPS，防止 token 被中间人攻击
2. **Token 有效期**：建议父系统生成短期 token（如 1 小时）
3. **跨域配置**：确保后端 CORS 配置正确
4. **同源策略**：如果是 iframe 嵌入且跨域，需配置 CSP

### 🔒 可选增强措施（参考）

如需更高安全性，可考虑：

- Referer 白名单验证
- Token 签名机制（HMAC）
- 请求频率限制
- IP 白名单

## 测试验证

### 本地测试

```bash
# 1. 启动项目
pnpm dev

# 2. 访问 Token 桥接页
http://localhost:5173/token-bridge?token=test_token_123&redirect=/users/list

# 3. 检查
# ✅ URL 中 token 参数已被清除
# ✅ localStorage 中存在 auth_token
# ✅ localStorage 中存在 is_embed_mode=true
# ✅ 成功跳转到目标路由
```

### 验证清单

- [ ] Token 正确保存到 localStorage
- [ ] URL 中的 token 参数被清除
- [ ] 成功跳转到目标路由
- [ ] 接口请求携带 Authorization 头
- [ ] 4001 错误正确跳转到父系统登录页
- [ ] 独立访问（无 token）跳转到独立登录页

## 常见问题

### Q1: Token 无法传递到接口？

**A:** 检查：

1. localStorage 中是否有 `auth_token`
2. 浏览器控制台 Network 查看请求头是否有 `Authorization`
3. 后端是否正确解析 `Bearer token`

### Q2: 一直跳转登录页？

**A:** 可能原因：

1. Token 无效或已过期
2. 后端接口返回 4001
3. 检查 localStorage 中的 `is_embed_mode` 标记

### Q3: 如何清除嵌入模式？

**A:**

```javascript
// 浏览器控制台执行
localStorage.removeItem('is_embed_mode')
localStorage.removeItem('auth_token')
```

## 后续优化建议

1. **Token 刷新机制**：添加 token 自动续期
2. **心跳检测**：定期验证 token 有效性
3. **错误日志**：上报异常情况到监控平台
4. **多语言支持**：提示信息国际化

---

**文档版本：** v1.0  
**更新时间：** 2026-01-12  
**维护人员：** GitHub Copilot
