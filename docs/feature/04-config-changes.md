# 04 - 配置变更

## `application.yml`

**文件**：`permission-bootstrap/src/main/resources/application.yml`

### 变更内容

为开发环境增加默认值，避免必须通过环境变量设置。

| 配置项 | 原值 | 新值 |
|--------|------|------|
| `spring.datasource.password` | `${DB_PASSWORD:}` | `${DB_PASSWORD:root123}` |
| `auth.jwt.secret` | `${JWT_SECRET:}` | `${JWT_SECRET:permission-center-default-jwt-secret-key-2024}` |
| `auth.users.admin` | `${AUTH_ADMIN_PASS:}` | `${AUTH_ADMIN_PASS:admin123}` |
| `auth.users.user1` | `${AUTH_USER1_PASS:}` | `${AUTH_USER1_PASS:user123}` |

### diff

```yaml
# spring.datasource.password
- password: ${DB_PASSWORD:}
+ password: ${DB_PASSWORD:root123}

# auth.jwt.secret
- secret: ${JWT_SECRET:}
+ secret: ${JWT_SECRET:permission-center-default-jwt-secret-key-2024}

# auth.users
- admin: ${AUTH_ADMIN_PASS:}
- user1: ${AUTH_USER1_PASS:}
+ admin: ${AUTH_ADMIN_PASS:admin123}
+ user1: ${AUTH_USER1_PASS:user123}
```

### 说明

- 这些默认值仅用于本地开发环境
- 生产环境应通过环境变量覆盖
- 有了默认值后，本地启动不再需要设置 `DB_PASSWORD`、`JWT_SECRET`、`AUTH_ADMIN_PASS`、`AUTH_USER1_PASS` 环境变量

