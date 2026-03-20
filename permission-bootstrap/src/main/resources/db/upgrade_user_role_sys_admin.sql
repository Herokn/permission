-- 将超级管理员授权从旧版 user_id=admin 迁移为 sys_admin（与 JWT 业务 ID 一致）
-- 若 user 表中仍有 user_id=admin 的业务用户，请再执行 upgrade_user_table_admin_to_sys_admin.sql
UPDATE user_role ur
INNER JOIN role r ON ur.role_id = r.id AND r.code = 'SUPER_ADMIN'
SET ur.user_id = 'sys_admin'
WHERE ur.user_id = 'admin';
