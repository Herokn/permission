# 单元测试规范

## 1. 测试文件位置

**重要：所有单元测试文件必须放在 `test` 模块下，而不是各业务模块的 `src/test` 目录。**

### 1.1 测试文件目录结构

```
app/test/src/test/java/com/gzlab/chatbi/test/
├── base/                                    # 测试基类
│   ├── BaseTest.java
│   └── BaseIntegrationTest.java
├── core/                                    # Core层测试
│   └── service/
│       └── user/
│           └── impl/
│               ├── UserServiceImplTest.java
│               └── UserRoleServiceImplTest.java
├── biz/                                     # Biz层测试
│   └── service/
│       └── impl/
│           └── user/
│               └── UserManagerImplTest.java
└── web/                                     # Web层测试（集成测试）
    └── controller/
        └── user/
            └── UserControllerTest.java
```

### 1.2 测试文件包路径规范

- **Core层测试**：`com.gzlab.chatbi.test.core.service.{模块}.impl.{类名}Test`
  - 示例：`com.gzlab.chatbi.test.core.service.user.impl.UserServiceImplTest`
- **Biz层测试**：`com.gzlab.chatbi.test.biz.service.impl.{模块}.{类名}Test`
  - 示例：`com.gzlab.chatbi.test.biz.service.impl.user.UserManagerImplTest`
- **Web层测试**：`com.gzlab.chatbi.test.web.controller.{模块}.{类名}Test`
  - 示例：`com.gzlab.chatbi.test.web.controller.user.UserControllerTest`

### 1.3 测试模块依赖配置

`test` 模块的 `pom.xml` 需要添加对以下模块的依赖：
- `core-service`：测试Core层服务
- `biz-service-impl`：测试Biz层管理器
- `common-dal`：测试DAO层
- `common-util`：测试工具类

## 2. 测试覆盖率

- **覆盖率要求**：单元测试覆盖率≥80%，核心业务逻辑覆盖率≥95%
- **测试范围**：
  - Service层：必须编写单元测试
  - Manager层：必须编写单元测试
  - Controller层：建议编写集成测试
  - DAO层：建议编写集成测试

## 3. 测试命名规范

- **测试类命名**：`被测试类名 + Test`，如：`UserServiceImplTest`
- **测试方法命名**：`test + 被测试方法名 + 测试场景`，如：`testGetUserById_WhenUserExists_ReturnUserDTO`

## 4. 测试编写规范

- **测试结构**：遵循AAA模式（Arrange-Act-Assert）
- **Mock使用**：使用Mockito等框架Mock依赖
  - **重要：必须根据方法的返回类型选择正确的Mock方式**
    - 返回值为`void`的方法：使用`doNothing().when(mock).method()`
    - 返回值不为`void`的方法：使用`when(mock.method()).thenReturn(value)`
    - 例如：`deleteByUserId`返回`int`，应使用`when(userRoleDAO.deleteByUserId(userId)).thenReturn(0)`，不能使用`doNothing()`
- **测试数据**：使用测试数据构建器或工厂方法
- **断言**：使用明确的断言，提供清晰的错误信息
- **基类继承**：所有测试类应继承 `BaseTest` 基类
- **setUp方法**：**必须使用 `public` 修饰符**，因为父类 `BaseTest` 中的 `setUp` 方法是 `public`，子类重写时必须保持相同或更宽松的访问权限

示例：
```java
package com.gzlab.chatbi.test.core.service.user.impl;

import com.gzlab.chatbi.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("用户核心服务单元测试")
class UserServiceImplTest extends BaseTest {

    @Mock
    private UserDAO userDAO;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    public void setUp() {
        super.setUp();
        // 初始化测试数据
    }

    @Test
    @DisplayName("根据ID查询用户-成功场景")
    void testGetUserById_WhenUserExists_ReturnUserDTO() {
        // Arrange
        Long userId = 1L;
        UserDO userDO = new UserDO();
        userDO.setId(userId);
        userDO.setUsername("test");
        when(userDAO.selectById(userId)).thenReturn(userDO);

        // Act
        UserDTO result = userService.getUserById(userId);

        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("test", result.getUsername());
    }
}
```

## 5. 测试执行与验证

### 5.1 测试执行命令

执行指定测试类的命令：
```bash
cd app/test && mvn test -Dtest="*User*Test"
```

执行所有测试：
```bash
cd app/test && mvn test
```

### 5.2 测试成功率统计

**重要：代码生成完成后，必须执行单元测试并统计成功率，确保所有测试通过。**

#### 5.2.1 成功率要求

- **最低要求**：测试成功率必须达到 **100%**
- **统计指标**：
  - 总测试数（Tests run）
  - 通过数（Passed）
  - 失败数（Failures）
  - 错误数（Errors）
  - 跳过数（Skipped）

#### 5.2.2 成功率计算公式

```
成功率 = (总测试数 - 失败数 - 错误数) / 总测试数 × 100%
```

#### 5.2.3 测试结果示例

```
Tests run: 49, Failures: 0, Errors: 0, Skipped: 0
成功率: 100% (49/49)
```

### 5.3 测试问题修复流程

当测试执行失败时，必须按照以下流程修复：

#### 5.3.1 问题分类

1. **编译错误**：代码语法错误、依赖缺失等
2. **Mock配置错误**：Mock方法使用不当、返回值类型不匹配等
3. **断言错误**：测试断言与实际结果不符
4. **UnnecessaryStubbing错误**：存在不必要的Mock设置

#### 5.3.2 常见问题及修复方法

**问题1：Mock方法返回类型不匹配**

```java
// ❌ 错误：deleteByUserId返回int，不能使用doNothing()
doNothing().when(userRoleDAO).deleteByUserId(userId);

// ✅ 正确：使用when().thenReturn()
when(userRoleDAO.deleteByUserId(userId)).thenReturn(0);
```

**问题2：不必要的Mock设置**

```java
// ❌ 错误：当方法使用传入参数而不是调用getUserRoles时，不需要Mock selectByUserId
when(userRoleDAO.selectByUserId(userId)).thenReturn(Arrays.asList(userRoleDO));

// ✅ 正确：移除不必要的Mock
// createUser方法使用传入的roles参数，不会调用getUserRoles
```

**问题3：setUp方法访问权限错误**

```java
// ❌ 错误：setUp方法必须是public
void setUp() {
    super.setUp();
}

// ✅ 正确：使用public修饰符
public void setUp() {
    super.setUp();
}
```

#### 5.3.3 修复验证

修复问题后，必须重新执行测试，确保：
- 所有测试通过
- 成功率达到100%
- 没有编译错误
- 没有运行时错误

### 5.4 CI/CD集成

- **单元测试必须集成到CI/CD流程**
- **测试隔离**：每个测试方法应该独立，不依赖其他测试的执行顺序
- **测试数据清理**：测试后清理测试数据，避免影响其他测试
- **测试报告**：生成测试报告，记录测试结果和覆盖率