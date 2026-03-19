# 后端系分文档到代码生成器

根据后端系统分析文档生成符合规范的Java代码，确保代码结构完整、遵循开发规范。

## 快速开始

### 1. 确定生成范围

| 类型 | 适用场景 | 生成内容 |
|------|----------|----------|
| **完整模块** | 新模块开发 | Controller/Manager/Service/DAO/DTO/VO等全套代码 |
| **部分组件** | 功能扩展 | 指定层级的代码（如仅生成DTO/VO） |
| **增量更新** | 功能修改 | 基于现有代码的增量修改 |

### 2. 信息收集清单

生成代码前，向用户收集以下信息：

**必需信息：**
- [ ] 后端系分文档（完整或部分）
- [ ] 模块名称
- [ ] 包路径前缀（如 com.gzlab.chatbi）
- [ ] 生成代码的目标模块（web-home/biz-shared/core-service/common-dal）

**可选信息：**
- [ ] 现有代码结构（用于增量更新）
- [ ] 特殊业务逻辑说明
- [ ] 第三方依赖要求

## 代码生成规范

### 1. 分层架构规范

严格按照后端系分文档中的四层架构生成代码：

```
web层（展现层）         → web-home模块
  ↓
biz层（业务应用层）     → biz-shared模块
  ↓
core层（核心领域层）    → core-service模块
  ↓
common层（基础结构层）  → common-dal模块
```

### 2. 包结构规范

```java
// ✅ 推荐：按业务模块划分包结构
package com.gzlab.chatbi.web.controller.user;

// ❌ 不推荐：按技术分层划分包结构
// package com.gzlab.chatbi.web.controller;
```

### 3. 类命名规范

| 层级 | 类型 | 命名规范 | 示例 |
|------|------|----------|------|
| web层 | Controller | [Module]Controller | UserController |
| web层 | DTO | [Verb][Module]DTO | CreateUserDTO |
| web层 | VO | [Module]VO | UserVO |
| web层 | Converter | [Module]Converter | UserConverter |
| biz层 | Manager | [Module]Manager | UserManager |
| biz层 | Facade | [Module]Facade | UserFacade |
| core层 | Service | [Module]Service | UserService |
| core层 | Model | [Module] | User |
| common层 | DAO | [Module]DAO | UserDAO |
| common层 | DO | [Module]DO | UserDO |

### 4. 方法命名规范

```java
// ✅ 推荐：动词+名词组合
public UserVO getUserById(Long userId) {}

// ✅ 推荐：布尔值方法以is/has/check开头
public boolean isValidUser(UserDTO user) {}

// ✅ 推荐：创建方法以create/add/save开头
public UserVO createUser(CreateUserDTO request) {}

// ✅ 推荐：更新方法以update/modify/edit开头
public UserVO updateUser(UpdateUserDTO request) {}

// ✅ 推荐：删除方法以delete/remove开头
public void deleteUser(Long userId) {}

// ✅ 推荐：查询方法以get/find/query/list开头
public List<UserVO> listUsers(QueryUserDTO request) {}
```

## 生成流程

```
生成任务进度：
- [ ] 步骤1：解析系分文档结构
- [ ] 步骤2：提取数据库表结构
- [ ] 步骤3：提取接口设计
- [ ] 步骤4：生成DO类
- [ ] 步骤5：生成DAO类
- [ ] 步骤6：生成Model类
- [ ] 步骤7：生成Service类
- [ ] 步骤8：生成Manager类
- [ ] 步骤9：生成DTO类
- [ ] 步骤10：生成VO类
- [ ] 步骤11：生成Converter类
- [ ] 步骤12：生成Controller类
- [ ] 步骤13：生成Mapper XML（如需要）
- [ ] 步骤14：代码规范检查
```

### 模板文件引用

代码生成过程中使用以下模板文件：

- DO类模板：templates/do-template.java
- DAO类模板：templates/dao-template.java
- Service类模板：templates/service-template.java
- Manager类模板：templates/manager-template.java
- Controller类模板：templates/controller-template.java
- DTO类模板：templates/dto-template.java
- VO类模板：templates/vo-template.java
- Converter类模板：templates/converter-template.java
- Mapper XML模板：templates/mapper-template.xml

### 步骤1：解析系分文档结构

从后端系分文档中提取以下信息：
- 模块基本信息（模块名称、编码等）
- 数据库表结构设计
- 接口设计
- 业务逻辑设计

### 步骤2：提取数据库表结构

从文档的"2. 数据库设计"章节提取：
- 表名和表说明
- 字段名、类型、长度、是否必填、默认值、说明
- 索引设计
- 表关系设计

### 步骤3：提取接口设计

从文档的"3. 接口设计"章节提取：
- 接口路径、HTTP方法、功能描述
- 请求参数（Query参数、Path参数、请求体）
- 响应结果（成功响应、错误响应）
- 业务校验规则

### 步骤4-13：按层级生成代码

严格按照系分文档中的代码结构设计章节生成各层代码：

#### DO类生成规范

```java
/**
 * [实体说明]数据对象
 *
 * @author [作者]
 * @since [版本]
 */
@Data
@TableName("table_name")
public class EntityNameDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 字段说明
     */
    private String fieldName;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 逻辑删除标记：0=未删除，1=已删除
     */
    @TableLogic
    private Integer deleted;
}
```

#### DAO类生成规范

```java
/**
 * [实体说明]数据访问接口
 *
 * @author [作者]
 * @since [版本]
 */
@Mapper
@Repository
public interface EntityNameDAO extends BaseMapper<EntityNameDO> {

    /**
     * 根据条件查询实体说明
     *
     * @param condition 条件说明
     * @return 实体说明信息
     */
    EntityNameDO selectByCondition(@Param("condition") String condition);
}
```

#### Service类生成规范

```java
/**
 * [实体说明]核心服务类
 *
 * @author [作者]
 * @since [版本]
 */
@Service
public class EntityNameService {

    @Autowired
    private EntityNameDAO entityNameDAO;

    /**
     * 根据ID获取实体说明信息
     *
     * @param id 主键ID
     * @return 实体说明信息
     */
    public EntityName getEntityNameById(Long id) {
        return entityNameDAO.selectById(id);
    }
}
```

#### Manager类生成规范

```java
/**
 * [实体说明]业务管理层
 *
 * @author [作者]
 * @since [版本]
 */
@Service
public class EntityNameManager {

    @Autowired
    private EntityNameService entityNameService;

    @Autowired
    private EntityNameDAO entityNameDAO;

    /**
     * 创建实体说明
     *
     * @param request 创建请求参数
     * @return 实体说明信息
     */
    @Transactional(rollbackFor = Exception.class)
    public EntityNameVO createEntityName(CreateEntityNameDTO request) {
        // 参数校验
        validateCreateRequest(request);

        // 业务逻辑处理
        EntityNameDO entityNameDO = new EntityNameDO();
        BeanUtils.copyProperties(entityNameDO, request);
        entityNameDO.setCreatedAt(LocalDateTime.now());
        entityNameDO.setUpdatedAt(LocalDateTime.now());
        entityNameDAO.insert(entityNameDO);

        // 返回结果
        return convertToVO(entityNameDO);
    }
}
```

#### Controller类生成规范

```java
/**
 * [实体说明]控制器
 *
 * @author [作者]
 * @since [版本]
 */
@RestController
@RequestMapping("/api/v1/module")
@Tag(name = "模块名称", description = "模块描述")
public class EntityNameController {

    @Autowired
    private EntityNameManager entityNameManager;

    /**
     * 创建实体说明
     *
     * @param request 创建请求参数
     * @return 实体说明信息
     */
    @PostMapping
    @Operation(summary = "创建实体说明", description = "创建实体说明")
    public Result<EntityNameVO> createEntityName(@RequestBody @Valid CreateEntityNameDTO request) {
        EntityNameVO result = entityNameManager.createEntityName(request);
        return Result.success(result);
    }
}
```

## CRUD 代码生成规范

所有CRUD操作必须遵循以下规范：

### 1. 查询操作

```java
// 分页查询
@GetMapping("/list")
@Operation(summary = "分页查询实体说明列表", description = "分页查询实体说明列表")
public Result<PageResult<EntityNameVO>> listEntityName(@Valid QueryEntityNameDTO request) {
    PageResult<EntityNameVO> result = entityNameManager.listEntityName(request);
    return Result.success(result);
}

// 根据ID查询
@GetMapping("/{id}")
@Operation(summary = "根据ID获取实体说明信息", description = "根据ID获取实体说明信息")
public Result<EntityNameVO> getEntityNameById(@PathVariable Long id) {
    EntityNameVO result = entityNameManager.getEntityNameById(id);
    return Result.success(result);
}
```

### 2. 创建操作

```java
@PostMapping
@Operation(summary = "创建实体说明", description = "创建实体说明")
public Result<EntityNameVO> createEntityName(@RequestBody @Valid CreateEntityNameDTO request) {
    EntityNameVO result = entityNameManager.createEntityName(request);
    return Result.success(result);
}
```

### 3. 更新操作

```java
@PutMapping("/{id}")
@Operation(summary = "更新实体说明", description = "更新实体说明")
public Result<EntityNameVO> updateEntityName(@PathVariable Long id,
                                            @RequestBody @Valid UpdateEntityNameDTO request) {
    EntityNameVO result = entityNameManager.updateEntityName(id, request);
    return Result.success(result);
}
```

### 4. 删除操作

```java
@DeleteMapping("/{id}")
@Operation(summary = "删除实体说明", description = "删除实体说明")
public Result<Void> deleteEntityName(@PathVariable Long id) {
    entityNameManager.deleteEntityName(id);
    return Result.success();
}
```

## 异常处理规范

生成的代码必须包含完善的异常处理机制：

```java
/**
 * 业务异常处理器
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        log.warn("参数校验异常: ", e);
        StringBuilder errorMsg = new StringBuilder();
        e.getBindingResult().getFieldErrors().forEach(error ->
            errorMsg.append(error.getField()).append(": ").append(error.getDefaultMessage()).append("; "));
        return Result.error(ErrorCode.PARAM_ERROR.getCode(), errorMsg.toString());
    }

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusinessException(BusinessException e) {
        log.warn("业务异常: ", e);
        return Result.error(e.getCode(), e.getMessage());
    }
}
```

## 代码质量要求

### 1. 注释规范

```java
/**
 * 类说明
 *
 * @author 作者
 * @since 1.0.0
 */
public class ClassName {

    /**
     * 方法说明
     *
     * @param parameter 参数说明
     * @return 返回值说明
     */
    public ReturnType methodName(ParameterType parameter) {
        // 行内注释
        return result;
    }
}
```

### 2. 代码格式规范

- 缩进：使用4个空格
- 行宽：不超过120个字符
- 空行：方法之间保留一个空行
- 导入：按标准顺序导入（java.* → javax.* → org.* → com.*）

### 3. 事务处理规范

```java
/**
 * 涉及多表操作的方法必须添加事务注解
 */
@Transactional(rollbackFor = Exception.class)
public ReturnType methodName(ParameterType parameter) {
    // 业务逻辑
}
```

## 注意事项

1. **严格遵循系分文档** - 生成的代码必须与系分文档保持一致
2. **包路径准确性** - 确保包路径与项目实际结构一致
3. **类名规范性** - 严格按照命名规范生成类名
4. **注释完整性** - 所有类和方法必须包含完整注释
5. **异常处理** - 必须包含适当的异常处理机制
6. **事务控制** - 多表操作必须添加事务注解

## 参考资源

- 后端系分文档模板：docs/BE-DESIGN/后端系分.md
- 后端代码开发规范：docs/rules/后端代码开发规范.md