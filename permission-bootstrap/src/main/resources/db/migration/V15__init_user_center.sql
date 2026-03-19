-- 用户管理模块数据库迁移脚本
-- 创建用户、组织、岗位相关表，并初始化权限数据

-- ============================================
-- 1. 创建用户表
-- ============================================
CREATE TABLE `user` (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(64) UNIQUE NOT NULL COMMENT '用户唯一标识',
  display_name VARCHAR(128) NOT NULL COMMENT '显示名称',
  full_name VARCHAR(128) COMMENT '全名',
  mobile VARCHAR(32) COMMENT '手机号',
  email VARCHAR(128) COMMENT '邮箱',
  avatar_url VARCHAR(512) COMMENT '头像URL',
  status TINYINT DEFAULT 1 COMMENT '状态：1=启用, 0=禁用',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记',
  INDEX idx_mobile (mobile),
  INDEX idx_email (email),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 创建用户组织关系表
-- ============================================
CREATE TABLE user_org_rel (
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

-- ============================================
-- 3. 创建组织表
-- ============================================
CREATE TABLE organization (
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

-- ============================================
-- 4. 创建岗位表
-- ============================================
CREATE TABLE position (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  position_code VARCHAR(64) UNIQUE NOT NULL COMMENT '岗位编码',
  position_name VARCHAR(128) NOT NULL COMMENT '岗位名称',
  level INT COMMENT '岗位级别',
  description VARCHAR(512) COMMENT '描述',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  gmt_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted TINYINT DEFAULT 0 COMMENT '逻辑删除标记'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

-- ============================================
-- 5. 创建组织岗位关联表
-- ============================================
CREATE TABLE org_position (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  org_id BIGINT NOT NULL COMMENT '组织ID',
  position_id BIGINT NOT NULL COMMENT '岗位ID',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_position (org_id, position_id),
  INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织岗位关联表';

-- ============================================
-- 6. 初始化用户中心模块权限
-- ============================================
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
-- 模块级
('USER_CENTER', '用户中心', 'MODULE', 'USER_CENTER', 'ENABLED', '用户中心模块访问权限', 100),
-- 用户管理
('USER_CENTER_USER_VIEW', '查看用户', 'ACTION', 'USER_CENTER', 'ENABLED', '查看用户列表', 101),
('USER_CENTER_USER_SEARCH', '搜索用户', 'ACTION', 'USER_CENTER', 'ENABLED', '搜索用户', 102),
('USER_CENTER_USER_CREATE', '创建用户', 'ACTION', 'USER_CENTER', 'ENABLED', '创建新用户', 103),
('USER_CENTER_USER_EDIT', '编辑用户', 'ACTION', 'USER_CENTER', 'ENABLED', '编辑用户信息', 104),
('USER_CENTER_USER_DELETE', '删除用户', 'ACTION', 'USER_CENTER', 'ENABLED', '删除用户', 105),
('USER_CENTER_USER_ENABLE', '启用/禁用用户', 'ACTION', 'USER_CENTER', 'ENABLED', '启用或禁用用户', 106),
('USER_CENTER_USER_RESET_PWD', '重置密码', 'ACTION', 'USER_CENTER', 'ENABLED', '重置用户密码', 107),
-- 组织管理
('USER_CENTER_ORG_VIEW', '查看组织', 'ACTION', 'USER_CENTER', 'ENABLED', '查看组织架构', 108),
('USER_CENTER_ORG_MANAGE', '管理组织', 'ACTION', 'USER_CENTER', 'ENABLED', '管理组织架构', 109),
-- 岗位管理
('USER_CENTER_POSITION_VIEW', '查看岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '查看岗位', 110),
('USER_CENTER_POSITION_MANAGE', '管理岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '管理岗位', 111);

-- ============================================
-- 7. 初始化权限管理模块权限（细化）
-- ============================================
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
-- 模块级
('PERMISSION_MANAGE', '权限管理', 'MODULE', 'PERMISSION_CENTER', 'ENABLED', '权限管理模块访问权限', 200),
-- 权限点管理
('PERMISSION_MANAGE_PERM_VIEW', '查看权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看权限点列表', 201),
('PERMISSION_MANAGE_PERM_CREATE', '创建权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新权限点', 202),
('PERMISSION_MANAGE_PERM_EDIT', '编辑权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑权限点', 203),
('PERMISSION_MANAGE_PERM_DELETE', '删除权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除权限点', 204),
-- 角色管理
('PERMISSION_MANAGE_ROLE_VIEW', '查看角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看角色列表', 205),
('PERMISSION_MANAGE_ROLE_CREATE', '创建角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新角色', 206),
('PERMISSION_MANAGE_ROLE_EDIT', '编辑角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑角色', 207),
('PERMISSION_MANAGE_ROLE_DELETE', '删除角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除角色', 208),
-- 用户授权
('PERMISSION_MANAGE_USER_GRANT', '用户授权', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '给用户分配权限', 209),
-- 权限测试
('PERMISSION_MANAGE_AUTHZ_TEST', '权限测试', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '测试权限检查', 210);

-- ============================================
-- 8. 创建普通用户角色（可选）
-- ============================================
INSERT INTO role (code, name, role_scope, role_domain, status, description) VALUES
('NORMAL_USER', '普通用户', 'GLOBAL', 'APP', 'ENABLED', '普通用户，仅有基础访问权限');

-- ============================================
-- 9. 给普通用户角色分配基础权限
-- ============================================
INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, 'USER_CENTER' FROM role r WHERE r.code = 'NORMAL_USER';

-- ============================================
-- 10. 插入演示数据
-- ============================================
-- 插入演示组织
INSERT INTO organization (org_code, org_name, org_type, parent_id, level, path, status) VALUES
('ROOT', '总公司', 'COMPANY', NULL, 1, '/ROOT', 1),
('TECH', '技术部', 'DEPARTMENT', 1, 2, '/ROOT/TECH', 1),
('SALES', '销售部', 'DEPARTMENT', 1, 2, '/ROOT/SALES', 1);

-- 插入演示岗位
INSERT INTO position (position_code, position_name, level, description) VALUES
('CEO', '首席执行官', 1, '公司最高管理者'),
('CTO', '首席技术官', 2, '技术负责人'),
('CFO', '首席财务官', 2, '财务负责人'),
('ENGINEER', '工程师', 3, '技术工程师'),
('SALES', '销售', 4, '销售人员');

-- 配置组织岗位
INSERT INTO org_position (org_id, position_id) VALUES
(2, 2), -- 技术部配置CTO、工程师
(2, 4),
(3, 5); -- 销售部配置销售

-- 插入演示用户（如果不存在）
INSERT IGNORE INTO user (user_id, display_name, full_name, mobile, email, status) VALUES
('U001', '演示用户1', '张三', '13800138001', 'zhangsan@example.com', 1),
('U002', '演示用户2', '李四', '13800138002', 'lisi@example.com', 1);

-- 配置用户组织关系
INSERT INTO user_org_rel (user_id, org_id, is_primary, position_id, employee_no) VALUES
('U001', 2, 1, 4, 'E001'), -- U001 在技术部，工程师
('U002', 3, 1, 5, 'E002'); -- U002 在销售部，销售
