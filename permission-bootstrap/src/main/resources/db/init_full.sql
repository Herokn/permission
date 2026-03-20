-- =============================================
-- 权限管理平台 - 完整初始化SQL
-- 适用于全新环境的一键初始化
-- 包含：表结构 + 基础数据 + 演示数据
-- =============================================
-- 使用方式：
-- 1. 创建数据库：CREATE DATABASE IF NOT EXISTS permission_center DEFAULT CHARSET utf8mb4;
-- 2. 使用数据库：USE permission_center;
-- 3. 执行本脚本：source init_full.sql;
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `flyway_schema_history`;
DROP TABLE IF EXISTS `user_role`;
DROP TABLE IF EXISTS `user_permission`;
DROP TABLE IF EXISTS `role_permission`;
DROP TABLE IF EXISTS `user_org`;
DROP TABLE IF EXISTS `org_role`;
DROP TABLE IF EXISTS `org_position`;
DROP TABLE IF EXISTS `user_org_rel`;
DROP TABLE IF EXISTS `login_session`;
DROP TABLE IF EXISTS `audit_log`;
DROP TABLE IF EXISTS `data_permission_rule`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `permission`;
DROP TABLE IF EXISTS `organization`;
DROP TABLE IF EXISTS `position`;
DROP TABLE IF EXISTS `project`;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 第一部分：表结构定义
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

-- 4. 用户-角色关系表
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

-- 5. 用户直接权限表
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

-- 8. 组织-角色关联表
CREATE TABLE IF NOT EXISTS `org_role` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `org_id`        BIGINT UNSIGNED NOT NULL COMMENT '组织ID',
    `role_id`       BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `project_id`    BIGINT          DEFAULT NULL COMMENT '项目ID（可选）',
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
    `resource_type` VARCHAR(64)     NOT NULL COMMENT '资源类型',
    `scope_type`    VARCHAR(32)     NOT NULL COMMENT '范围类型：ALL/DEPARTMENT/SELF/CUSTOM',
    `scope_value`   VARCHAR(512)    DEFAULT NULL COMMENT '范围值',
    `gmt_create`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `gmt_modified`  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted`       TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '是否删除：0-未删除，1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_resource_deleted` (`role_id`, `resource_type`, `deleted`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据权限规则表';

-- 13. 用户表（用户中心）
CREATE TABLE IF NOT EXISTS `user` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) UNIQUE NOT NULL COMMENT '业务用户ID（内部标识，非登录账号）',
  login_account VARCHAR(64) UNIQUE NOT NULL COMMENT '登录账号',
  password_hash VARCHAR(128) NOT NULL COMMENT 'BCrypt密码',
  user_type TINYINT DEFAULT 0 COMMENT '0=业务用户(列表展示) 1=系统内置(不展示)',
  display_name VARCHAR(128) NOT NULL COMMENT '显示名称',
  full_name VARCHAR(128) COMMENT '全名',
  mobile VARCHAR(32) COMMENT '手机号',
  email VARCHAR(128) COMMENT '邮箱',
  avatar_url VARCHAR(512) COMMENT '头像URL',
  status TINYINT DEFAULT 1 COMMENT '状态：1=启用, 0=禁用',
  primary_org_id BIGINT COMMENT '主组织ID',
  position_id BIGINT COMMENT '岗位ID',
  employee_no VARCHAR(64) COMMENT '工号',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  INDEX idx_mobile (mobile),
  INDEX idx_email (email),
  INDEX idx_user_id (user_id),
  INDEX idx_login_account (login_account)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 14. 用户组织关系表（用户中心）
CREATE TABLE IF NOT EXISTS user_org_rel (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) NOT NULL COMMENT '用户ID',
  org_id BIGINT NOT NULL COMMENT '组织ID',
  is_primary TINYINT DEFAULT 0 COMMENT '是否主组织：1=是, 0=否',
  position_id BIGINT COMMENT '岗位ID',
  employee_no VARCHAR(64) COMMENT '工号',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_org_id (org_id),
  UNIQUE KEY uk_user_org (user_id, org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户组织关系表';

-- 15. 组织表（用户中心 - 覆盖之前的简化版）
DROP TABLE IF EXISTS `organization`;
CREATE TABLE `organization` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  org_code VARCHAR(64) UNIQUE NOT NULL COMMENT '组织编码',
  org_name VARCHAR(128) NOT NULL COMMENT '组织名称',
  org_type VARCHAR(32) COMMENT '组织类型：COMPANY/DEPARTMENT/TEAM',
  parent_id BIGINT COMMENT '父组织ID',
  level INT COMMENT '层级',
  path VARCHAR(512) COMMENT '路径',
  status TINYINT DEFAULT 1 COMMENT '状态：1=启用, 0=禁用',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  INDEX idx_parent_id (parent_id),
  INDEX idx_code (org_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织表';

-- 16. 岗位表（用户中心）
CREATE TABLE IF NOT EXISTS `position` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  position_code VARCHAR(64) UNIQUE NOT NULL COMMENT '岗位编码',
  position_name VARCHAR(128) NOT NULL COMMENT '岗位名称',
  level INT COMMENT '岗位级别',
  description VARCHAR(512) COMMENT '描述',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- 17. 组织岗位关联表（用户中心）
CREATE TABLE IF NOT EXISTS `org_position` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  org_id BIGINT NOT NULL COMMENT '组织ID',
  position_id BIGINT NOT NULL COMMENT '岗位ID',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_position (org_id, position_id),
  INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织岗位关联表';

-- =============================================
-- 第二部分：权限点数据
-- =============================================

-- 1. 项目数据（仅用户中心 UC、权限中心 PC，与左侧主导航一致）
INSERT INTO `project` (`code`, `name`, `description`, `systems`, `status`) VALUES
('UC', '用户中心', '平台用户、组织、岗位等能力；左侧「用户中心」菜单由 USER_CENTER_* 权限控制。', JSON_ARRAY(
    JSON_OBJECT('code', 'UC_USER', 'name', '用户管理'),
    JSON_OBJECT('code', 'UC_ORG', 'name', '组织与层级管理'),
    JSON_OBJECT('code', 'UC_POSITION', 'name', '岗位管理')
), 'ENABLED'),
('PC', '权限中心', '项目/权限点/角色/用户授权/审计；左侧「权限中心」菜单由 PERMISSION_CENTER_* 权限控制。', JSON_ARRAY(
    JSON_OBJECT('code', 'PC_PROJECT', 'name', '项目管理'),
    JSON_OBJECT('code', 'PC_PERMISSION', 'name', '权限点管理'),
    JSON_OBJECT('code', 'PC_ROLE', 'name', '角色管理'),
    JSON_OBJECT('code', 'PC_GRANT', 'name', '用户授权'),
    JSON_OBJECT('code', 'PC_AUDIT', 'name', '审计日志')
), 'ENABLED');

-- 2. 权限点数据
-- 用户中心树：按项目 systems 中 UC_USER / UC_ORG / UC_POSITION 分三组展示（各组 MENU→PAGE→ACTION 与用户管理同级）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_MGMT',          '用户管理',         'UC_USER',     'UC', 'MENU', NULL,         1, 'ENABLED', '用户管理顶级菜单'),
('USER_LIST',          '用户列表',         'UC_USER',     'UC', 'PAGE', 'USER_MGMT',  1, 'ENABLED', '用户列表页面'),
('UC_ORG_LIST',        '组织列表',         'UC_ORG',      'UC', 'PAGE', NULL,         1, 'ENABLED', '组织与层级：列表/树页面'),
('UC_POSITION_LIST',   '岗位列表',         'UC_POSITION', 'UC', 'PAGE', NULL,         1, 'ENABLED', '岗位：列表页面');

-- 权限中心管理模块（树形权限，system_code=PERM）
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
('USER_AUTH_MANAGE_ACTION', '管理用户授权', 'PERM', 'OPERATION', 'USER_AUTH_MANAGE', 42, 'ENABLED', '为用户分配角色和权限'),
-- 组织管理
('ORG_MANAGE', '组织管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 50, 'ENABLED', '组织管理菜单'),
('ORG_VIEW', '查看组织', 'PERM', 'OPERATION', 'ORG_MANAGE', 51, 'ENABLED', '查看组织架构'),
('ORG_CREATE', '新增组织', 'PERM', 'OPERATION', 'ORG_VIEW', 52, 'ENABLED', '新增组织'),
('ORG_UPDATE', '编辑组织', 'PERM', 'OPERATION', 'ORG_VIEW', 53, 'ENABLED', '编辑组织'),
('ORG_DELETE', '删除组织', 'PERM', 'OPERATION', 'ORG_VIEW', 54, 'ENABLED', '删除组织'),
-- 项目管理
('PROJECT_MANAGE', '项目管理', 'PERM', 'MENU', 'PERM_CENTER_MANAGE', 60, 'ENABLED', '项目管理菜单'),
('PROJECT_VIEW', '查看项目', 'PERM', 'OPERATION', 'PROJECT_MANAGE', 61, 'ENABLED', '查看项目列表'),
('PROJECT_CREATE', '新增项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 62, 'ENABLED', '新增项目'),
('PROJECT_UPDATE', '编辑项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 63, 'ENABLED', '编辑项目'),
('PROJECT_DELETE', '删除项目', 'PERM', 'OPERATION', 'PROJECT_VIEW', 64, 'ENABLED', '删除项目'),
-- 权限测试
('AUTHZ_TEST', '权限测试', 'PERM', 'OPERATION', 'PERM_CENTER_MANAGE', 70, 'ENABLED', '权限测试功能');

-- 用户中心模块权限（project_id=UC + 父节点挂树，用户授权页按项目 UC 可展示完整操作点）
INSERT INTO `permission` (`code`, `name`, `system_code`, `project_id`, `type`, `parent_code`, `sort_order`, `status`, `description`) VALUES
('USER_CENTER', '用户中心', 'USER_CENTER', 'UC', 'MODULE', NULL, 100, 'ENABLED', '用户中心模块访问权限'),
('USER_CENTER_USER_VIEW', '查看用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 101, 'ENABLED', '查看用户列表'),
('USER_CENTER_USER_SEARCH', '搜索用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 102, 'ENABLED', '搜索用户'),
('USER_CENTER_USER_CREATE', '创建用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 103, 'ENABLED', '创建新用户'),
('USER_CENTER_USER_EDIT', '编辑用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 104, 'ENABLED', '编辑用户信息'),
('USER_CENTER_USER_DELETE', '删除用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 105, 'ENABLED', '删除用户'),
('USER_CENTER_USER_ENABLE', '启用/禁用用户', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 106, 'ENABLED', '启用或禁用用户'),
('USER_CENTER_USER_RESET_PWD', '重置密码', 'USER_CENTER', 'UC', 'ACTION', 'USER_LIST', 107, 'ENABLED', '重置用户密码'),
-- 组织与层级、岗位：与用户列表同级，每页仅四类操作（查看/新增/编辑/删除）；成员与组织角色等写操作归在「编辑组织」鉴权下
('USER_CENTER_ORG_VIEW', '查看组织', 'USER_CENTER', 'UC', 'ACTION', 'UC_ORG_LIST', 108, 'ENABLED', '查看组织树、详情、成员与角色列表'),
('USER_CENTER_ORG_CREATE', '新增组织', 'USER_CENTER', 'UC', 'ACTION', 'UC_ORG_LIST', 109, 'ENABLED', '创建组织'),
('USER_CENTER_ORG_EDIT', '编辑组织', 'USER_CENTER', 'UC', 'ACTION', 'UC_ORG_LIST', 110, 'ENABLED', '编辑组织及成员、组织角色等非删除写操作'),
('USER_CENTER_ORG_DELETE', '删除组织', 'USER_CENTER', 'UC', 'ACTION', 'UC_ORG_LIST', 111, 'ENABLED', '删除组织'),
('USER_CENTER_POSITION_VIEW', '查看岗位', 'USER_CENTER', 'UC', 'ACTION', 'UC_POSITION_LIST', 120, 'ENABLED', '查看岗位列表与详情'),
('USER_CENTER_POSITION_CREATE', '新增岗位', 'USER_CENTER', 'UC', 'ACTION', 'UC_POSITION_LIST', 121, 'ENABLED', '创建岗位'),
('USER_CENTER_POSITION_EDIT', '编辑岗位', 'USER_CENTER', 'UC', 'ACTION', 'UC_POSITION_LIST', 122, 'ENABLED', '编辑岗位'),
('USER_CENTER_POSITION_DELETE', '删除岗位', 'USER_CENTER', 'UC', 'ACTION', 'UC_POSITION_LIST', 123, 'ENABLED', '删除岗位');

-- 权限中心模块权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
-- 模块级
('PERMISSION_CENTER', '权限中心', 'MODULE', 'PERMISSION_CENTER', 'ENABLED', '权限中心模块访问权限', 200),
-- 权限点管理
('PERMISSION_CENTER_PERMISSION_VIEW', '查看权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看权限点列表', 201),
('PERMISSION_CENTER_PERMISSION_CREATE', '创建权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新权限点', 202),
('PERMISSION_CENTER_PERMISSION_EDIT', '编辑权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑权限点', 203),
('PERMISSION_CENTER_PERMISSION_DELETE', '删除权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除权限点', 204),
-- 项目管理
('PERMISSION_CENTER_PROJECT_VIEW', '查看项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看项目列表', 205),
('PERMISSION_CENTER_PROJECT_CREATE', '创建项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新项目', 206),
('PERMISSION_CENTER_PROJECT_EDIT', '编辑项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑项目', 207),
('PERMISSION_CENTER_PROJECT_DELETE', '删除项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除项目', 208),
('PERMISSION_CENTER_ROLE_VIEW', '查看角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看角色列表', 209),
('PERMISSION_CENTER_ROLE_CREATE', '创建角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建角色', 210),
('PERMISSION_CENTER_ROLE_EDIT', '编辑角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑角色', 211),
('PERMISSION_CENTER_ROLE_DELETE', '删除角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除角色', 212),
('PERMISSION_CENTER_ROLE_ASSIGN_PERM', '角色分配权限', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '为角色分配权限点', 213),
('PERMISSION_CENTER_USER_GRANT_VIEW', '查看用户授权', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看用户角色与权限', 214),
('PERMISSION_CENTER_USER_GRANT_MANAGE', '管理用户授权', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '分配或撤销用户角色/权限', 215),
('PERMISSION_CENTER_AUDIT_VIEW', '查看审计日志', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看操作审计记录', 216);

-- 用户管理系统访问权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('SYS_USER_MANAGEMENT_ACCESS', '用户管理系统访问', 'MODULE', 'SYS', 'ENABLED', '用户管理系统访问权限', 1);

-- =============================================
-- 第三部分：角色数据
-- =============================================

-- 超级管理员角色
-- 仅超级管理员为全局角色；其余角色均绑定项目（UC=用户中心，PC=权限中心）
INSERT INTO role (code, name, role_scope, role_domain, project_id, status, description) VALUES
('SUPER_ADMIN', '超级管理员', 'GLOBAL', 'APP', NULL, 'ENABLED', '拥有所有权限的超级管理员');

INSERT INTO role (code, name, role_scope, role_domain, project_id, status, description) VALUES
('USER_CENTER_ADMIN', '用户管理员', 'PROJECT', 'APP', 'UC', 'ENABLED', '用户中心内用户/组织/岗位的管理权限（一颗角色覆盖三类菜单）'),
('USER_VIEWER', '用户查看员', 'PROJECT', 'APP', 'UC', 'ENABLED', '仅查看用户信息，无编辑权限'),
('USER_ORG_MANAGER', '组织管理员', 'PROJECT', 'APP', 'UC', 'ENABLED', '可查看用户；可查看并管理组织'),
('ORG_ADMIN', '组织管理员', 'GLOBAL', 'APP', NULL, 'ENABLED', '可查看用户；可查看并管理组织'),
('PERM_CENTER_ADMIN', '权限管理员', 'PROJECT', 'PERM_CENTER', 'PC', 'ENABLED', '权限中心内角色、权限点、用户授权等管理能力'),
('NORMAL_USER', '普通用户', 'PROJECT', 'APP', 'UC', 'ENABLED', '普通用户，仅有基本查看权限');

-- =============================================
-- 第四部分：角色权限分配
-- =============================================

-- 超级管理员：拥有所有权限
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN permission p
WHERE r.code = 'SUPER_ADMIN';

-- 用户中心管理员：用户+组织+岗位的所有权限
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN (
    SELECT code FROM permission 
    WHERE code IN (
        'USER_CENTER_USER_VIEW', 'USER_CENTER_USER_SEARCH', 'USER_CENTER_USER_CREATE', 'USER_CENTER_USER_EDIT',
        'USER_CENTER_USER_DELETE', 'USER_CENTER_USER_ENABLE', 'USER_CENTER_USER_RESET_PWD',
        'USER_CENTER_ORG_VIEW', 'USER_CENTER_ORG_CREATE', 'USER_CENTER_ORG_EDIT', 'USER_CENTER_ORG_DELETE',
        'USER_CENTER_POSITION_VIEW', 'USER_CENTER_POSITION_CREATE', 'USER_CENTER_POSITION_EDIT', 'USER_CENTER_POSITION_DELETE',
        'SYS_USER_MANAGEMENT_ACCESS'
    )
) p
WHERE r.code = 'USER_CENTER_ADMIN';

-- 用户查看员：仅查看用户
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN (
    SELECT code FROM permission WHERE code = 'USER_CENTER_USER_VIEW'
) p
WHERE r.code = 'USER_VIEWER';

-- 用户组织管理员：查看用户 + 管理组织
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN (
    SELECT code FROM permission 
    WHERE code IN (
        'USER_CENTER_USER_VIEW',
        'USER_CENTER_ORG_VIEW', 'USER_CENTER_ORG_CREATE', 'USER_CENTER_ORG_EDIT', 'USER_CENTER_ORG_DELETE'
    )
) p
WHERE r.code = 'USER_ORG_MANAGER';

-- 权限中心管理员：权限中心相关权限
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN (
    SELECT code FROM permission 
    WHERE code IN (
        'PERMISSION_CENTER_PERMISSION_VIEW', 'PERMISSION_CENTER_PERMISSION_CREATE',
        'PERMISSION_CENTER_PERMISSION_EDIT', 'PERMISSION_CENTER_PERMISSION_DELETE',
        'PERMISSION_CENTER_ROLE_VIEW', 'PERMISSION_CENTER_ROLE_CREATE',
        'PERMISSION_CENTER_ROLE_EDIT', 'PERMISSION_CENTER_ROLE_DELETE', 'PERMISSION_CENTER_ROLE_ASSIGN_PERM',
        'PERMISSION_CENTER_USER_GRANT_VIEW', 'PERMISSION_CENTER_USER_GRANT_MANAGE',
        'PERMISSION_CENTER_AUDIT_VIEW',
        'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'ROLE_PERMISSION_ASSIGN',
        'USER_AUTH_VIEW', 'USER_AUTH_MANAGE_ACTION',
        'PERMISSION_CENTER_PROJECT_VIEW', 'PERMISSION_CENTER_PROJECT_CREATE',
        'PERMISSION_CENTER_PROJECT_EDIT', 'PERMISSION_CENTER_PROJECT_DELETE'
    )
) p
WHERE r.code = 'PERM_CENTER_ADMIN';

-- 普通用户：至少具备用户中心只读入口（否则绑定该角色后登录无任何权限点，与「基本查看」描述一致）
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code FROM role r
CROSS JOIN (
    SELECT code FROM permission
    WHERE code IN ('USER_CENTER_USER_VIEW', 'SYS_USER_MANAGEMENT_ACCESS')
) p
WHERE r.code = 'NORMAL_USER';

-- =============================================
-- 第五部分：组织架构数据
-- =============================================

-- 组织架构（三级：公司 -> 部门 -> 组）
INSERT INTO organization (id, org_code, org_name, org_type, parent_id, level, path, status) VALUES
-- 一级：公司
(1, 'HQ', '总公司', 'COMPANY', NULL, 1, '/HQ', 1),

-- 二级：部门
(2, 'TECH_DEPT', '技术部', 'DEPARTMENT', 1, 2, '/HQ/TECH_DEPT', 1),
(3, 'SALES_DEPT', '销售部', 'DEPARTMENT', 1, 2, '/HQ/SALES_DEPT', 1),
(4, 'HR_DEPT', '人力资源部', 'DEPARTMENT', 1, 2, '/HQ/HR_DEPT', 1),
(5, 'FINANCE_DEPT', '财务部', 'DEPARTMENT', 1, 2, '/HQ/FINANCE_DEPT', 1),
(6, 'PRODUCT_DEPT', '产品部', 'DEPARTMENT', 1, 2, '/HQ/PRODUCT_DEPT', 1),

-- 三级：组（技术部下属）
(7, 'BACKEND_TEAM', '后端组', 'TEAM', 2, 3, '/HQ/TECH_DEPT/BACKEND_TEAM', 1),
(8, 'FRONTEND_TEAM', '前端组', 'TEAM', 2, 3, '/HQ/TECH_DEPT/FRONTEND_TEAM', 1),
(9, 'QA_TEAM', '测试组', 'TEAM', 2, 3, '/HQ/TECH_DEPT/QA_TEAM', 1),
(10, 'OPS_TEAM', '运维组', 'TEAM', 2, 3, '/HQ/TECH_DEPT/OPS_TEAM', 1),

-- 三级：组（销售部下属）
(11, 'NORTH_SALES', '北方销售组', 'TEAM', 3, 3, '/HQ/SALES_DEPT/NORTH_SALES', 1),
(12, 'SOUTH_SALES', '南方销售组', 'TEAM', 3, 3, '/HQ/SALES_DEPT/SOUTH_SALES', 1),

-- 三级：组（产品部下属）
(13, 'PM_TEAM', '产品经理组', 'TEAM', 6, 3, '/HQ/PRODUCT_DEPT/PM_TEAM', 1),
(14, 'DESIGN_TEAM', '设计组', 'TEAM', 6, 3, '/HQ/PRODUCT_DEPT/DESIGN_TEAM', 1);

-- =============================================
-- 第六部分：岗位数据
-- =============================================

-- 岗位体系（按级别分类）
INSERT INTO position (id, position_code, position_name, level, description) VALUES
-- 高管层（L1）
(1, 'CEO', '首席执行官', 1, '公司最高管理者'),
(2, 'CTO', '首席技术官', 1, '技术负责人'),
(3, 'CFO', '首席财务官', 1, '财务负责人'),
(4, 'COO', '首席运营官', 1, '运营负责人'),

-- 部门管理层（L2）
(5, 'DIRECTOR', '部门总监', 2, '部门负责人'),
(6, 'TECH_DIRECTOR', '技术总监', 2, '技术部负责人'),
(7, 'SALES_DIRECTOR', '销售总监', 2, '销售部负责人'),
(8, 'HR_DIRECTOR', '人力总监', 2, '人力资源部负责人'),

-- 组管理层（L3）
(9, 'MANAGER', '组长', 3, '小组负责人'),
(10, 'TECH_LEAD', '技术组长', 3, '技术组负责人'),
(11, 'SALES_MANAGER', '销售经理', 3, '销售组负责人'),

-- 专业层（L4）
(12, 'SENIOR_ENGINEER', '高级工程师', 4, '高级技术人员'),
(13, 'ENGINEER', '工程师', 4, '技术人员'),
(14, 'JUNIOR_ENGINEER', '初级工程师', 4, '初级技术人员'),
(15, 'SENIOR_PM', '高级产品经理', 4, '高级产品人员'),
(16, 'PM', '产品经理', 4, '产品人员'),
(17, 'DESIGNER', '设计师', 4, '设计人员'),
(18, 'QA', '测试工程师', 4, '测试人员'),
(19, 'DEVOPS', '运维工程师', 4, '运维人员'),
(20, 'SALES', '销售专员', 4, '销售人员'),
(21, 'HR', '人事专员', 4, '人事人员'),
(22, 'FINANCE', '财务专员', 4, '财务人员');

-- =============================================
-- 第七部分：组织岗位关系
-- =============================================

-- 技术部岗位配置
INSERT INTO org_position (org_id, position_id) VALUES
(2, 6), -- 技术总监
(7, 10), (7, 12), (7, 13), (7, 14), -- 后端组：技术组长、高/中/初级工程师
(8, 10), (8, 12), (8, 13), (8, 14), -- 前端组：技术组长、高/中/初级工程师
(9, 9), (9, 18), -- 测试组：组长、测试工程师
(10, 9), (10, 19); -- 运维组：组长、运维工程师

-- 销售部岗位配置
INSERT INTO org_position (org_id, position_id) VALUES
(3, 7), -- 销售总监
(11, 11), (11, 20), -- 北方销售：经理、专员
(12, 11), (12, 20); -- 南方销售：经理、专员

-- 人力资源部岗位配置
INSERT INTO org_position (org_id, position_id) VALUES
(4, 8), (4, 21); -- 人力总监、人事专员

-- 财务部岗位配置
INSERT INTO org_position (org_id, position_id) VALUES
(5, 3), (5, 22); -- CFO、财务专员

-- 产品部岗位配置
INSERT INTO org_position (org_id, position_id) VALUES
(6, 5), -- 总监
(13, 15), (13, 16), -- 产品经理组：高/中级产品经理
(14, 17); -- 设计组：设计师

-- =============================================
-- 第八部分：用户数据
-- =============================================
-- 系统管理员仅通过 application 配置账号登录（auth.users），不在业务用户表中展示。
-- 以下为演示业务用户（密码均为 BCrypt: demo123），登录账号 demo_user / 密码 demo123，默认无角色（登录后无业务权限）。
INSERT INTO user (user_id, login_account, password_hash, user_type, display_name, full_name, mobile, email, status, primary_org_id, position_id, employee_no) VALUES
('u_demo001', 'demo_user', '$2b$10$ZXUZto5ds7XRwKfRuSwPJ.pz/SyuiBwxL.aVEMMmvtfl19GiXZVCu', 0, '演示用户', '演示用户', '13900000001', 'demo@example.com', 1, 1, 1, 'D001'),
('u_59c4e0d9abc1', 'user', '$2a$10$5Vislpvc4em4TrRZxfYsNut/rJNhCH0uIXw/CrxNTQS/um0m15/XW', 0, '测试用户', '测试用户', '13247097050', '925073484@sfsu.edu', 1, 1, 13, NULL);

-- =============================================
-- 第九部分：用户组织关系
-- =============================================

INSERT INTO user_org_rel (user_id, org_id, is_primary, position_id, employee_no) VALUES
('u_demo001', 1, 1, 1, 'D001');

-- =============================================
-- 第十部分：用户角色分配
-- =============================================
-- 配置登录超级管理员：JWT 业务 userId=sys_admin（无 user 表记录；见 application 中 auth.users）
INSERT INTO user_role (user_id, role_id, project_id)
SELECT 'sys_admin', id, NULL FROM role WHERE code = 'SUPER_ADMIN';

-- 配置测试用户角色：组织管理员 + 普通用户
INSERT INTO user_role (user_id, role_id, project_id)
SELECT 'u_59c4e0d9abc1', id, NULL FROM role WHERE code = 'USER_ORG_MANAGER';
INSERT INTO user_role (user_id, role_id, project_id)
SELECT 'u_59c4e0d9abc1', id, NULL FROM role WHERE code = 'NORMAL_USER';

-- =============================================
-- 第十一部分：用户直接权限（测试用户）
-- =============================================

-- 配置测试用户的直接权限（用于测试用户管理功能）
INSERT INTO user_permission (user_id, permission_code, effect, project_id) VALUES
('u_59c4e0d9abc1', 'USER_LIST', 'ALLOW', 'UC'),
('u_59c4e0d9abc1', 'USER_VIEW', 'ALLOW', 'UC'),
('u_59c4e0d9abc1', 'USER_EDIT', 'ALLOW', 'UC');

-- =============================================
-- 附：若旧库曾写入已废弃的 UC 细粒度码，可手工执行（空库/全新 init 勿执行）
-- UPDATE permission SET deleted = 1, gmt_modified = NOW()
--   WHERE deleted = 0 AND code IN (
--     'USER_CENTER_ORG_LIST','USER_CENTER_ORG_MEMBER_MANAGE','USER_CENTER_ORG_ROLE_ASSIGN',
--     'USER_CENTER_POSITION_LIST','USER_CENTER_POSITION_SEARCH');
-- DELETE FROM role_permission WHERE permission_code IN (
--     'USER_CENTER_ORG_LIST','USER_CENTER_ORG_MEMBER_MANAGE','USER_CENTER_ORG_ROLE_ASSIGN',
--     'USER_CENTER_POSITION_LIST','USER_CENTER_POSITION_SEARCH');
-- =============================================
-- 初始化完成
-- =============================================
