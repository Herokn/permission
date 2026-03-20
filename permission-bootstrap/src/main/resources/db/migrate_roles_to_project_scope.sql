-- 仅 SUPER_ADMIN 保持 GLOBAL；其余预置角色改为 PROJECT 并绑定 UC/PC（在已有库上执行，执行前请备份）

UPDATE role
SET role_scope = 'PROJECT', project_id = 'UC'
WHERE code IN ('USER_CENTER_ADMIN', 'USER_VIEWER', 'USER_ORG_MANAGER', 'NORMAL_USER')
  AND deleted = 0;

UPDATE role
SET role_scope = 'PROJECT', project_id = 'PC'
WHERE code = 'PERM_CENTER_ADMIN'
  AND deleted = 0;

-- 历史上若以「全局角色」绑定且无 project_id，可按角色补全 project_id（避免重复分配）
UPDATE user_role ur
INNER JOIN role r ON ur.role_id = r.id
SET ur.project_id = 'UC'
WHERE r.code IN ('USER_CENTER_ADMIN', 'USER_VIEWER', 'USER_ORG_MANAGER', 'NORMAL_USER')
  AND ur.project_id IS NULL
  AND r.deleted = 0;

UPDATE user_role ur
INNER JOIN role r ON ur.role_id = r.id
SET ur.project_id = 'PC'
WHERE r.code = 'PERM_CENTER_ADMIN'
  AND ur.project_id IS NULL
  AND r.deleted = 0;
