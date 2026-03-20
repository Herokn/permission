-- 将业务用户表中遗留的 user_id=admin 统一为 sys_admin（与配置登录 JWT 业务 ID 一致）
-- 执行前请备份。若已存在 user_id=sys_admin 的另一行，请先合并数据再执行。

START TRANSACTION;

UPDATE user_org_rel SET user_id = 'sys_admin' WHERE user_id = 'admin';
UPDATE user_permission SET user_id = 'sys_admin' WHERE user_id = 'admin';
UPDATE user_org SET user_id = 'sys_admin' WHERE user_id = 'admin';
UPDATE user_role SET user_id = 'sys_admin' WHERE user_id = 'admin';
UPDATE login_session SET user_id = 'sys_admin' WHERE user_id = 'admin';

UPDATE user SET user_id = 'sys_admin' WHERE user_id = 'admin';

COMMIT;
