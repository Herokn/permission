-- =============================================
-- V1: 权限管理平台 - 数据库初始化（合并版）
-- 包含：表结构 + 演示数据
-- =============================================

-- =============================================
-- 一、表结构定义
-- =============================================

-- 1. 权限点表
CREATE TABLE IF NOT EXISTS `permission` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `code`          VARCHAR(64)     NOT NULL COMMENT '权限编码，全局唯一',
    `name`          VARCHAR(128)    NOT NULL COMMENT '权限名称',
    `system_code`   VARCHAR(64)     DEFAULT NULL COMMENT '所属系统编码',
    `project_id`    VARCHAR(64)     DEFAULT NULL COMMENT '项目ID，NULL表示全局权限',
    `type`          VARCHAR(32)     NOT NULL COMMENT '权限类型：MENU/PAGE/ACTION/OPERATION',
    `parent_code`   VARCHAR(64)     DEFAULT NULL COMMENT '父权限编码，NULL表示顶级',
    `sort_order`    INT             DEFAULT 0 COMMENT '同级排序号',
    `status`        VARCHAR(16)     NOT NULL DEFAULT 'ENABLED' COMMENT '状态：ENABLED/DISABLED',
    `description`   VARCHAR(256)    DEFAULT NULL COMMENT '描述',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`, `deleted`),
    KEY `idx_parent_code` (`parent_code`),
    KEY `idx_system_code` (`system_code`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限点表';

-- 2. 角色表
CREATE TABLE IF NOT EXISTS `role` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `code`          VARCHAR(64)     NOT NULL COMMENT '角色编码，全局唯一',
    `name`          VARCHAR(128)    NOT NULL COMMENT '角色名称',
    `role_scope`    VARCHAR(16)     NOT NULL COMMENT '角色范围：GLOBAL/PROJECT',
    `role_domain`   VARCHAR(16)     NOT NULL COMMENT '角色域：APP/PERM_CENTER',
    `project_id`    VARCHAR(64)     DEFAULT NULL COMMENT '项目ID，NULL表示全局角色',
    `status`        VARCHAR(16)     NOT NULL DEFAULT 'ENABLED' COMMENT '状态：ENABLED/DISABLED',
    `description`   VARCHAR(256)    DEFAULT NULL COMMENT '描述',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`, `deleted`),
    KEY `idx_role_scope` (`role_scope`),
    KEY `idx_project_id` (`project_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 3. 角色-权限关系表
CREATE TABLE IF NOT EXISTS `role_permission` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `role_id`           BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `permission_code`   VARCHAR(64)     NOT NULL COMMENT '权限编码',
    `gmt_create`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`           TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_code`, `deleted`),
    KEY `idx_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关系表';

-- 4. 用户-角色关系表（支持项目隔离和审计链路）
CREATE TABLE IF NOT EXISTS `user_role` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`           VARCHAR(64)     NOT NULL COMMENT '用户ID',
    `role_id`           BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `project_id`        VARCHAR(64)     DEFAULT NULL COMMENT '项目ID，NULL表示全局',
    `project_id_key`    VARCHAR(64) GENERATED ALWAYS AS (COALESCE(`project_id`, '__GLOBAL__')) STORED COMMENT '虚拟列，用于唯一索引',
    `gmt_create`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`           TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    `deleted_time`      DATETIME(3)     NULL COMMENT '删除时间，NULL表示未删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role_project_deleted` (`user_id`, `role_id`, `project_id_key`, `deleted_time`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关系表';

-- 5. 用户直接权限表（支持项目隔离和审计链路）
CREATE TABLE IF NOT EXISTS `user_permission` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`           VARCHAR(64)     NOT NULL COMMENT '用户ID',
    `permission_code`   VARCHAR(64)     NOT NULL COMMENT '权限编码',
    `effect`            VARCHAR(8)      NOT NULL COMMENT '效果：ALLOW/DENY',
    `project_id`        VARCHAR(64)     DEFAULT NULL COMMENT '项目ID，NULL表示全局',
    `project_id_key`    VARCHAR(64) GENERATED ALWAYS AS (COALESCE(`project_id`, '__GLOBAL__')) STORED COMMENT '虚拟列，用于唯一索引',
    `gmt_create`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`           TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    `deleted_time`      DATETIME(3)     NULL COMMENT '删除时间，NULL表示未删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_perm_effect_project_deleted` (`user_id`, `permission_code`, `effect`, `project_id_key`, `deleted_time`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_permission_code` (`permission_code`),
    KEY `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户直接权限表';

-- 6. 操作审计日志表
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `operator`      VARCHAR(64)     NOT NULL COMMENT '操作人',
    `module`        VARCHAR(32)     NOT NULL COMMENT '模块',
    `action`        VARCHAR(32)     NOT NULL COMMENT '操作',
    `target_type`   VARCHAR(32)     NOT NULL COMMENT '目标类型',
    `target_id`     VARCHAR(128)    NOT NULL COMMENT '目标ID',
    `detail`        TEXT            DEFAULT NULL COMMENT '操作详情(JSON)',
    `ip_address`    VARCHAR(45)     DEFAULT NULL COMMENT '操作人IP',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_operator` (`operator`),
    KEY `idx_module` (`module`),
    KEY `idx_gmt_create` (`gmt_create`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作审计日志';

-- 7. 组织表
CREATE TABLE IF NOT EXISTS `organization` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `code`          VARCHAR(64)     NOT NULL COMMENT '组织编码，全局唯一',
    `name`          VARCHAR(128)    NOT NULL COMMENT '组织名称',
    `parent_id`     BIGINT UNSIGNED DEFAULT NULL COMMENT '父组织ID，NULL表示顶级',
    `sort_order`    INT             DEFAULT 0 COMMENT '同级排序号',
    `status`        VARCHAR(16)     NOT NULL DEFAULT 'ENABLED' COMMENT '状态：ENABLED/DISABLED',
    `description`   VARCHAR(256)    DEFAULT NULL COMMENT '描述',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`, `deleted`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织表';

-- 8. 组织-角色关联表（支持项目隔离）
CREATE TABLE IF NOT EXISTS `org_role` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `org_id`        BIGINT UNSIGNED NOT NULL COMMENT '组织ID',
    `role_id`       BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `project_id`    BIGINT          DEFAULT NULL COMMENT '项目ID（可选，用于项目级隔离）',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_org_role` (`org_id`, `role_id`, `deleted`),
    KEY `idx_org_id` (`org_id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_org_role_project_id` (`project_id`),
    KEY `idx_org_role_org_project` (`org_id`, `project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织-角色关联表';

-- 9. 用户-组织关联表
CREATE TABLE IF NOT EXISTS `user_org` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`       VARCHAR(64)     NOT NULL COMMENT '用户ID',
    `org_id`        BIGINT UNSIGNED NOT NULL COMMENT '组织ID',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_org` (`user_id`, `org_id`, `deleted`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_org_id` (`org_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-组织关联表';

-- 10. 登录会话表
CREATE TABLE IF NOT EXISTS `login_session` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `session_id`        VARCHAR(64)     NOT NULL COMMENT '会话ID（UUID）',
    `user_id`           VARCHAR(64)     NOT NULL COMMENT '用户ID',
    `user_name`         VARCHAR(128)    NOT NULL COMMENT '用户名',
    `login_type`        VARCHAR(16)     NOT NULL COMMENT '登录类型：PASSWORD/SSO',
    `access_token`      VARCHAR(512)    NOT NULL COMMENT 'Access Token',
    `refresh_token`     VARCHAR(512)    NOT NULL COMMENT 'Refresh Token',
    `expires_at`        DATETIME        NOT NULL COMMENT 'Access Token 过期时间',
    `refresh_expires_at` DATETIME       NOT NULL COMMENT 'Refresh Token 过期时间',
    `login_ip`          VARCHAR(64)     DEFAULT NULL COMMENT '登录IP',
    `user_agent`        VARCHAR(512)    DEFAULT NULL COMMENT '浏览器UA',
    `status`            VARCHAR(16)     NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE/EXPIRED/REVOKED',
    `gmt_create`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`           TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_session_id` (`session_id`, `deleted`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_access_token` (`access_token`(100)),
    KEY `idx_refresh_token` (`refresh_token`(100)),
    KEY `idx_status` (`status`),
    KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='登录会话表';

-- 11. 项目表
CREATE TABLE IF NOT EXISTS `project` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `code`          VARCHAR(64)     NOT NULL COMMENT '项目编码，全局唯一',
    `name`          VARCHAR(128)    NOT NULL COMMENT '项目名称',
    `description`   VARCHAR(256)    DEFAULT NULL COMMENT '描述',
    `systems`       JSON            DEFAULT NULL COMMENT '系统模块列表，JSON格式',
    `status`        VARCHAR(16)     NOT NULL DEFAULT 'ENABLED' COMMENT '状态：ENABLED/DISABLED',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0=未删除，1=已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`, `deleted`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 12. 数据权限规则表
CREATE TABLE IF NOT EXISTS `data_permission_rule` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
    `role_id`       BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `resource_type` VARCHAR(64)     NOT NULL COMMENT '资源类型（如 ORDER, PROJECT 等）',
    `scope_type`    VARCHAR(32)     NOT NULL COMMENT '范围类型：ALL/DEPARTMENT/SELF/CUSTOM',
    `scope_value`   VARCHAR(512)    DEFAULT NULL COMMENT '范围值（如部门ID列表，JSON格式）',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_resource_deleted` (`role_id`, `resource_type`, `deleted`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限规则表';


-- =============================================
-- 二、演示数据
-- =============================================

-- 1. 项目数据
INSERT INTO `project` (`code`, `name`, `description`, `systems`, `status`) VALUES
('P1', '项目一', '演示项目一', JSON_ARRAY(
    JSON_OBJECT('code', 'USER_CENTER', 'name', '用户中心'),
    JSON_OBJECT('code', 'ORDER_CENTER', 'name', '订单中心'),
    JSON_OBJECT('code', 'DASHBOARD', 'name', '仪表盘')
), 'ENABLED'),
('P2', '项目二', '演示项目二', JSON_ARRAY(
    JSON_OBJECT('code', 'USER_CENTER', 'name', '用户中心'),
    JSON_OBJECT('code', 'PRODUCT_CENTER', 'name', '商品中心')
), 'ENABLED');

-- 2. 权限点数据（系统模块编码已修正）
-- 订单管理模块（项目P1）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('ORDER_MGMT',     '订单管理',   'ORDER_CENTER', 'P1', 'MENU',   NULL,           1, 'ENABLED', '订单管理菜单'),
('ORDER_LIST',     '订单列表',   'ORDER_CENTER', 'P1', 'PAGE',   'ORDER_MGMT',   1, 'ENABLED', '订单列表页面'),
('ORDER_VIEW',     '查看订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   1, 'ENABLED', '查看订单详情'),
('ORDER_CREATE',   '创建订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   2, 'ENABLED', '创建新订单'),
('ORDER_APPROVE',  '审批订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   3, 'ENABLED', '审批订单'),
('ORDER_DELETE',   '删除订单',   'ORDER_CENTER', 'P1', 'ACTION', 'ORDER_LIST',   4, 'ENABLED', '删除订单');

-- 用户管理模块（项目P1）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_MGMT',      '用户管理',   'USER_CENTER', 'P1', 'MENU',   NULL,           2, 'ENABLED', '用户管理菜单'),
('USER_LIST',      '用户列表',   'USER_CENTER', 'P1', 'PAGE',   'USER_MGMT',    1, 'ENABLED', '用户列表页面'),
('USER_VIEW',      '查看用户',   'USER_CENTER', 'P1', 'ACTION', 'USER_LIST',    1, 'ENABLED', '查看用户详情'),
('USER_EDIT',      '编辑用户',   'USER_CENTER', 'P1', 'ACTION', 'USER_LIST',    2, 'ENABLED', '编辑用户信息');

-- 仪表盘模块（项目P1）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('DASHBOARD_MGMT', '仪表盘',     'DASHBOARD',   'P1', 'MENU',   NULL,           3, 'ENABLED', '仪表盘菜单'),
('DASHBOARD_VIEW', '查看仪表盘', 'DASHBOARD',   'P1', 'PAGE',   'DASHBOARD_MGMT', 1, 'ENABLED', '查看仪表盘页面');

-- 用户中心模块（项目P2）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_CENTER_P2',  '用户中心',   'USER_CENTER',    'P2', 'MENU',   NULL,              1, 'ENABLED', '用户中心菜单'),
('USER_LIST_P2',    '用户列表',   'USER_CENTER',    'P2', 'PAGE',   'USER_CENTER_P2',  1, 'ENABLED', '用户列表页面'),
('USER_VIEW_P2',    '查看用户',   'USER_CENTER',    'P2', 'ACTION', 'USER_LIST_P2',    1, 'ENABLED', '查看用户详情'),
('USER_CREATE_P2',  '创建用户',   'USER_CENTER',    'P2', 'ACTION', 'USER_LIST_P2',    2, 'ENABLED', '创建新用户');

-- 商品中心模块（项目P2）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('PRODUCT_CENTER_P2', '商品中心', 'PRODUCT_CENTER', 'P2', 'MENU',   NULL,                1, 'ENABLED', '商品中心菜单'),
('PRODUCT_LIST_P2',   '商品列表', 'PRODUCT_CENTER', 'P2', 'PAGE',   'PRODUCT_CENTER_P2', 1, 'ENABLED', '商品列表页面'),
('PRODUCT_VIEW_P2',   '查看商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2',   1, 'ENABLED', '查看商品详情'),
('PRODUCT_CREATE_P2', '创建商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2',   2, 'ENABLED', '创建新商品');

-- 权限中心管理模块
INSERT INTO `permission` (`code`, `name`, `system_code`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
-- 顶级菜单
('PERM_CENTER_MANAGE', '权限中心', 'PERM', 'MENU', NULL, 10, 'ENABLED', '权限中心管理菜单'),
-- 角色管理
('ROLE_MANAGE', '角色管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 20, 'ENABLED', '角色管理菜单'),
('ROLE_VIEW', '查看角色', 'PERM', 'OPERATION', 'ROLE_MANAGE', 21, 'ENABLED', '查看角色列表和详情'),
('ROLE_CREATE', '新增角色', 'PERM', 'OPERATION', 'ROLE_VIEW', 22, 'ENABLED', '新增角色'),
('ROLE_UPDATE', '编辑角色', 'PERM', 'OPERATION', 'ROLE_VIEW', 23, 'ENABLED', '编辑角色'),
('ROLE_DELETE', '删除角色', 'PERM', 'OPERATION', 'ROLE_VIEW', 24, 'ENABLED', '删除角色'),
('ROLE_PERMISSION_ASSIGN', '角色权限分配', 'PERM', 'OPERATION', 'ROLE_VIEW', 25, 'ENABLED', '为角色分配权限'),
-- 权限点管理
('PERMISSION_MANAGE', '权限点管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 30, 'ENABLED', '权限点管理菜单'),
('PERMISSION_VIEW', '查看权限点', 'PERM', 'OPERATION', 'PERMISSION_MANAGE', 31, 'ENABLED', '查看权限点列表和详情'),
('PERMISSION_CREATE', '新增权限点', 'PERM', 'OPERATION', 'PERMISSION_VIEW', 32, 'ENABLED', '新增权限点'),
('PERMISSION_UPDATE', '编辑权限点', 'PERM', 'OPERATION', 'PERMISSION_VIEW', 33, 'ENABLED', '编辑权限点'),
('PERMISSION_DELETE', '删除权限点', 'PERM', 'OPERATION', 'PERMISSION_VIEW', 34, 'ENABLED', '删除权限点'),
-- 用户授权管理
('USER_AUTH_MANAGE', '用户授权管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 40, 'ENABLED', '管理用户角色和权限'),
('USER_AUTH_VIEW', '查看用户授权', 'PERM', 'OPERATION', 'USER_AUTH_MANAGE', 41, 'ENABLED', '查看用户授权详情'),
-- 组织管理
('ORG_MANAGE', '组织管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 50, 'ENABLED', '组织管理菜单'),
('ORG_VIEW', '查看组织', 'PERM', 'OPERATION', 'ORG_MANAGE', 51, 'ENABLED', '查看组织树和详情'),
('ORG_CREATE', '新增组织', 'PERM', 'OPERATION', 'ORG_VIEW', 52, 'ENABLED', '新增组织'),
('ORG_UPDATE', '编辑组织', 'PERM', 'OPERATION', 'ORG_VIEW', 53, 'ENABLED', '编辑组织'),
('ORG_DELETE', '删除组织', 'PERM', 'OPERATION', 'ORG_VIEW', 54, 'ENABLED', '删除组织'),
('ORG_ROLE_ASSIGN', '组织角色分配', 'PERM', 'OPERATION', 'ORG_VIEW', 55, 'ENABLED', '为组织分配角色'),
('ORG_MEMBER_MANAGE', '组织成员管理', 'PERM', 'OPERATION', 'ORG_VIEW', 56, 'ENABLED', '管理组织成员'),
-- 项目管理
('PROJECT_MANAGE', '项目管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 60, 'ENABLED', '项目管理菜单'),
('PROJECT_VIEW', '查看项目', 'PERM', 'OPERATION', 'PROJECT_MANAGE', 61, 'ENABLED', '查看项目列表'),
('PROJECT_CREATE', '新增项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 62, 'ENABLED', '新增项目'),
('PROJECT_UPDATE', '编辑项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 63, 'ENABLED', '编辑项目'),
('PROJECT_DELETE', '删除项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 64, 'ENABLED', '删除项目');

-- 游离权限（用于测试）
INSERT INTO `permission` (`code`, `name`, `system_code`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('DISABLED_PERM', '已禁用权限', 'PERM', 'ACTION', NULL, 99, 'DISABLED', '用于测试禁用场景');

-- 3. 角色数据
INSERT INTO `role` (`code`, `name`, `role_scope`, `role_domain`, `status`, `description`) VALUES
('ADMIN',            '系统管理员',     'GLOBAL',  'PERM_CENTER', 'ENABLED', '拥有所有权限'),
('PROJECT_MANAGER',  '项目经理',       'PROJECT', 'APP',         'ENABLED', '项目管理权限，包含审批'),
('PROJECT_MEMBER',   '项目成员',       'PROJECT', 'APP',         'ENABLED', '项目普通成员，仅查看和创建'),
('ORDER_MANAGER',    '订单经理',       'PROJECT', 'APP',         'ENABLED', '订单模块管理权限'),
('ORDER_VIEWER',     '订单查看员',     'PROJECT', 'APP',         'ENABLED', '仅查看订单'),
('USER_ADMIN',       '用户管理员',     'GLOBAL',  'APP',         'ENABLED', '用户模块管理权限');

-- 4. 角色-权限分配
-- ADMIN 拥有所有权限
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(1, 'ORDER_MGMT'), (1, 'ORDER_LIST'), (1, 'ORDER_VIEW'), (1, 'ORDER_CREATE'),
(1, 'ORDER_APPROVE'), (1, 'ORDER_DELETE'),
(1, 'USER_MGMT'), (1, 'USER_LIST'), (1, 'USER_VIEW'), (1, 'USER_EDIT'),
(1, 'DASHBOARD_MGMT'), (1, 'DASHBOARD_VIEW'),
(1, 'PERM_CENTER_MANAGE'), (1, 'ROLE_MANAGE'), (1, 'ROLE_VIEW'), (1, 'ROLE_CREATE'),
(1, 'ROLE_UPDATE'), (1, 'ROLE_DELETE'), (1, 'ROLE_PERMISSION_ASSIGN'),
(1, 'PERMISSION_MANAGE'), (1, 'PERMISSION_VIEW'), (1, 'PERMISSION_CREATE'),
(1, 'PERMISSION_UPDATE'), (1, 'PERMISSION_DELETE'),
(1, 'USER_AUTH_MANAGE'), (1, 'USER_AUTH_VIEW'),
(1, 'ORG_MANAGE'), (1, 'ORG_VIEW'), (1, 'ORG_CREATE'), (1, 'ORG_UPDATE'),
(1, 'ORG_DELETE'), (1, 'ORG_ROLE_ASSIGN'), (1, 'ORG_MEMBER_MANAGE'),
(1, 'PROJECT_MANAGE'), (1, 'PROJECT_VIEW'), (1, 'PROJECT_CREATE'),
(1, 'PROJECT_UPDATE'), (1, 'PROJECT_DELETE');

-- PROJECT_MANAGER 拥有订单所有权限（含审批）
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(2, 'ORDER_MGMT'), (2, 'ORDER_LIST'), (2, 'ORDER_VIEW'), (2, 'ORDER_CREATE'), 
(2, 'ORDER_APPROVE'), (2, 'ORDER_DELETE');

-- PROJECT_MEMBER 拥有查看和创建权限
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(3, 'ORDER_MGMT'), (3, 'ORDER_LIST'), (3, 'ORDER_VIEW'), (3, 'ORDER_CREATE');

-- ORDER_MANAGER 拥有订单相关权限
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(4, 'ORDER_MGMT'), (4, 'ORDER_LIST'), (4, 'ORDER_VIEW'), (4, 'ORDER_CREATE'), (4, 'ORDER_APPROVE');

-- ORDER_VIEWER 仅查看
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(5, 'ORDER_MGMT'), (5, 'ORDER_LIST'), (5, 'ORDER_VIEW');

-- USER_ADMIN 拥有用户管理权限
INSERT INTO `role_permission` (`role_id`, `permission_code`) VALUES
(6, 'USER_MGMT'), (6, 'USER_LIST'), (6, 'USER_VIEW'), (6, 'USER_EDIT');

-- 5. 用户-角色分配
-- admin: 系统管理员，拥有 ADMIN 角色（全局）+ 项目经理（P1）+ 用户管理员
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('admin', 1, NULL),
('admin', 2, 'P1'),
('admin', 6, NULL);

-- U1: 在项目 P1 下是 PROJECT_MANAGER（有 ORDER_APPROVE）
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('U1', 2, 'P1'),
('U1', 5, NULL);

-- U2: 在项目 P1 下是 PROJECT_MEMBER（无 ORDER_APPROVE）
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('U2', 3, 'P1');

-- user1: 订单经理 + 订单查看员
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('user1', 4, 'P1'),
('user1', 5, NULL);

-- user2: 项目成员 + 订单查看员
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('user2', 3, 'P1'),
('user2', 5, 'P1');

-- user3: 订单经理（P1）
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('user3', 4, 'P1');

-- user4: 订单经理（P1）
INSERT INTO `user_role` (`user_id`, `role_id`, `project_id`) VALUES
('user4', 4, 'P1');

-- 6. 用户直接权限（演示 DENY 覆盖场景）
-- user3: 直接 DENY ORDER_CREATE（项目 P1）
INSERT INTO `user_permission` (`user_id`, `permission_code`, `effect`, `project_id`) VALUES
('user3', 'ORDER_CREATE', 'DENY', 'P1');

-- user4: 直接 DENY USER_EDIT（项目 P1）
INSERT INTO `user_permission` (`user_id`, `permission_code`, `effect`, `project_id`) VALUES
('user4', 'USER_EDIT', 'DENY', 'P1');

-- user2: 直接 ALLOW ORDER_APPROVE（项目 P1）
INSERT INTO `user_permission` (`user_id`, `permission_code`, `effect`, `project_id`) VALUES
('user2', 'ORDER_APPROVE', 'ALLOW', 'P1');

-- 7. 组织演示数据
INSERT INTO `organization` (`code`, `name`, `parent_id`, `sort_order`, `status`, `description`) VALUES
('ROOT',       '总公司',     NULL, 1, 'ENABLED', '集团总公司'),
('TECH_DEPT',  '技术部',     1,    1, 'ENABLED', '技术研发部门'),
('BIZ_DEPT',   '业务部',     1,    2, 'ENABLED', '业务运营部门'),
('FE_TEAM',    '前端组',     2,    1, 'ENABLED', '前端开发团队'),
('BE_TEAM',    '后端组',     2,    2, 'ENABLED', '后端开发团队');

-- 组织角色分配
INSERT INTO `org_role` (`org_id`, `role_id`) VALUES (2, 1);

-- 用户组织分配
INSERT INTO `user_org` (`user_id`, `org_id`) VALUES
('user001', 2),
('user002', 4),
('user003', 5);
