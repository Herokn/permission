# 权限验证测试用例

## 测试数据准备

### 用户
| 用户ID | 说明 |
|--------|------|
| U1 | P1 项目管理员 |
| U2 | P1 项目普通成员 |

### 项目
| 项目ID | 说明 |
|--------|------|
| P1 | 项目1 |
| P2 | 项目2 |

### 权限点
| 权限编码 | 名称 | 类型 |
|----------|------|------|
| ORDER_VIEW | 查看订单 | ACTION |
| ORDER_CREATE | 创建订单 | ACTION |
| ORDER_APPROVE | 审批订单 | ACTION |

### 角色
| 角色编码 | 名称 | 权限 |
|----------|------|------|
| PROJECT_MANAGER | 项目经理 | ORDER_VIEW, ORDER_CREATE, ORDER_APPROVE |
| PROJECT_MEMBER | 项目成员 | ORDER_VIEW, ORDER_CREATE |

### 用户角色分配
| 用户 | 角色 | 项目 |
|------|------|------|
| U1 | PROJECT_MANAGER | P1 |
| U2 | PROJECT_MEMBER | P1 |

---

## 验证场景

### 场景 1：基础角色权限验证

```
测试：U1 在 P1 有 PROJECT_MANAGER
期望：check(U1, ORDER_APPROVE, P1) = true
```

**验证方式：**
1. 访问前端「权限测试」页面
2. 输入：userId=U1, permissionCode=ORDER_APPROVE, projectId=P1
3. 点击「检查权限」
4. 预期结果：✅ 允许 - 来自角色 PROJECT_MANAGER 授权（项目 P1）

---

### 场景 2：跨项目权限隔离验证

```
测试：U1 在 P2 没有该角色
期望：check(U1, ORDER_APPROVE, P2) = false
```

**验证方式：**
1. 输入：userId=U1, permissionCode=ORDER_APPROVE, projectId=P2
2. 预期结果：❌ 拒绝 - 默认拒绝：无匹配授权

---

### 场景 3：不同角色权限差异验证

```
测试：U2 在 P1 是 PROJECT_MEMBER（无审批权限）
期望：check(U2, ORDER_APPROVE, P1) = false
```

**验证方式：**
1. 输入：userId=U2, permissionCode=ORDER_APPROVE, projectId=P1
2. 预期结果：❌ 拒绝 - 默认拒绝：无匹配授权

---

### 场景 4：DENY 覆盖验证

```
前置条件：为 U1 在 P1 配置 ORDER_APPROVE + DENY
期望：check(U1, ORDER_APPROVE, P1) = false
```

**验证步骤：**

1. 访问「用户授权」页面
2. 输入用户ID：U1，点击搜索
3. 在「直接权限」Tab 下点击「添加权限」
4. 选择：
   - 权限点：ORDER_APPROVE
   - 效果：DENY
   - 项目ID：P1
5. 点击确定

**验证结果：**
1. 回到「权限测试」页面
2. 输入：userId=U1, permissionCode=ORDER_APPROVE, projectId=P1
3. 预期结果：❌ 拒绝 - 被直接 DENY 覆盖（项目 P1）

---

## API 验证方式

### 使用 curl 测试

```bash
# 场景 1: U1 在 P1 审批订单
curl -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P1"}'

# 响应: {"code":200,"data":{"allowed":true,"reason":"来自角色 PROJECT_MANAGER 授权（项目 P1）"}}

# 场景 2: U1 在 P2 审批订单（无权限）
curl -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"U1","permissionCode":"ORDER_APPROVE","projectId":"P2"}'

# 响应: {"code":200,"data":{"allowed":false,"reason":"默认拒绝：无匹配授权"}}

# 场景 3: U2 在 P1 审批订单（无权限）
curl -X POST http://localhost:8080/api/authz/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"U2","permissionCode":"ORDER_APPROVE","projectId":"P1"}'

# 响应: {"code":200,"data":{"allowed":false,"reason":"默认拒绝：无匹配授权"}}
```

### 使用 Swagger 测试

访问 http://localhost:8080/doc.html，找到 `/api/authz/check` 接口进行测试。

---

## 验证清单

| 序号 | 场景 | 输入 | 预期结果 | 验证方式 |
|------|------|------|----------|----------|
| 1 | 角色权限生效 | U1 + ORDER_APPROVE + P1 | ✅ 允许 | 前端/API |
| 2 | 跨项目隔离 | U1 + ORDER_APPROVE + P2 | ❌ 拒绝 | 前端/API |
| 3 | 角色权限差异 | U2 + ORDER_APPROVE + P1 | ❌ 拒绝 | 前端/API |
| 4 | DENY 覆盖 ALLOW | U1 + ORDER_APPROVE + P1 (DENY) | ❌ 拒绝 | 前端配置后测试 |
| 5 | 全局权限继承 | U1 + ORDER_VIEW + P2 | ✅ 允许（全局角色） | 前端/API |
| 6 | 普通权限验证 | U2 + ORDER_VIEW + P1 | ✅ 允许 | 前端/API |
| 7 | 普通权限验证 | U2 + ORDER_CREATE + P1 | ✅ 允许 | 前端/API |
