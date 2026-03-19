-- 初始化项目和权限数据
-- 创建两个项目：用户中心和权限中心

-- ============================================
-- 1. 创建项目
-- ============================================
INSERT INTO project (code, name, description, systems, status) VALUES
('USER_CENTER', '用户中心', '用户管理、组织管理、岗位管理模块', '[{"code":"org","name":"组织管理"},{"code":"user","name":"用户管理"},{"code":"position","name":"岗位管理"}]', 'ENABLED')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO project (code, name, description, systems, status) VALUES
('PERMISSION_CENTER', '权限中心', '项目管理、权限点管理模块', '[{"code":"project","name":"项目管理"},{"code":"permission","name":"权限点管理"}]', 'ENABLED')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- 2. 创建用户中心模块的权限
-- ============================================
-- 组织管理权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('USER_CENTER_ORG_VIEW', '查看组织', 'ACTION', 'USER_CENTER', 'ENABLED', '查看组织架构', 101),
('USER_CENTER_ORG_CREATE', '创建组织', 'ACTION', 'USER_CENTER', 'ENABLED', '创建新组织', 102),
('USER_CENTER_ORG_EDIT', '编辑组织', 'ACTION', 'USER_CENTER', 'ENABLED', '编辑组织信息', 103),
('USER_CENTER_ORG_DELETE', '删除组织', 'ACTION', 'USER_CENTER', 'ENABLED', '删除组织', 104),
('USER_CENTER_ORG_MANAGE', '管理组织', 'ACTION', 'USER_CENTER', 'ENABLED', '组织管理（包含增删改）', 105)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 用户管理权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('USER_CENTER_USER_VIEW', '查看用户', 'ACTION', 'USER_CENTER', 'ENABLED', '查看用户列表', 111),
('USER_CENTER_USER_CREATE', '创建用户', 'ACTION', 'USER_CENTER', 'ENABLED', '创建新用户', 112),
('USER_CENTER_USER_EDIT', '编辑用户', 'ACTION', 'USER_CENTER', 'ENABLED', '编辑用户信息', 113),
('USER_CENTER_USER_DELETE', '删除用户', 'ACTION', 'USER_CENTER', 'ENABLED', '删除用户', 114),
('USER_CENTER_USER_ENABLE', '启用/禁用用户', 'ACTION', 'USER_CENTER', 'ENABLED', '启用或禁用用户', 115),
('USER_CENTER_USER_MANAGE', '管理用户', 'ACTION', 'USER_CENTER', 'ENABLED', '用户管理（包含增删改）', 116)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 岗位管理权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('USER_CENTER_POSITION_VIEW', '查看岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '查看岗位列表', 121),
('USER_CENTER_POSITION_CREATE', '创建岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '创建新岗位', 122),
('USER_CENTER_POSITION_EDIT', '编辑岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '编辑岗位信息', 123),
('USER_CENTER_POSITION_DELETE', '删除岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '删除岗位', 124),
('USER_CENTER_POSITION_MANAGE', '管理岗位', 'ACTION', 'USER_CENTER', 'ENABLED', '岗位管理（包含增删改）', 125)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- 3. 创建权限中心模块的权限
-- ============================================
-- 项目管理权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('PERMISSION_CENTER_PROJECT_VIEW', '查看项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看项目列表', 201),
('PERMISSION_CENTER_PROJECT_CREATE', '创建项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新项目', 202),
('PERMISSION_CENTER_PROJECT_EDIT', '编辑项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑项目信息', 203),
('PERMISSION_CENTER_PROJECT_DELETE', '删除项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除项目', 204),
('PERMISSION_CENTER_PROJECT_MANAGE', '管理项目', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '项目管理（包含增删改）', 205)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 权限点管理权限
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('PERMISSION_CENTER_PERMISSION_VIEW', '查看权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看权限点列表', 211),
('PERMISSION_CENTER_PERMISSION_CREATE', '创建权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新权限点', 212),
('PERMISSION_CENTER_PERMISSION_EDIT', '编辑权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑权限点', 213),
('PERMISSION_CENTER_PERMISSION_DELETE', '删除权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除权限点', 214),
('PERMISSION_CENTER_PERMISSION_MANAGE', '管理权限点', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '权限点管理（包含增删改）', 215)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 角色管理权限（跨项目）
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('PERMISSION_CENTER_ROLE_VIEW', '查看角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '查看角色列表', 221),
('PERMISSION_CENTER_ROLE_CREATE', '创建角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '创建新角色', 222),
('PERMISSION_CENTER_ROLE_EDIT', '编辑角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '编辑角色权限', 223),
('PERMISSION_CENTER_ROLE_DELETE', '删除角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '删除角色', 224),
('PERMISSION_CENTER_ROLE_MANAGE', '管理角色', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '角色管理（包含增删改）', 225)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 用户授权权限（跨项目）
INSERT INTO permission (code, name, type, system_code, status, description, sort_order) VALUES
('PERMISSION_CENTER_USER_GRANT', '用户授权', 'ACTION', 'PERMISSION_CENTER', 'ENABLED', '给用户分配角色和权限', 231)
ON DUPLICATE KEY UPDATE name=VALUES(name);
