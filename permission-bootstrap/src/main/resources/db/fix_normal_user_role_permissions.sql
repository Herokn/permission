-- 已有库修复：NORMAL_USER 角色未绑定任何权限点时，业务用户仅有该角色会导致登录后 permissions 为空。
-- 执行：mysql -uroot -p permission < fix_normal_user_role_permissions.sql

INSERT INTO role_permission (role_id, permission_code)
SELECT r.id, p.code
FROM role r
CROSS JOIN (
    SELECT code FROM permission
    WHERE deleted = 0
      AND code IN ('USER_CENTER_USER_VIEW', 'SYS_USER_MANAGEMENT_ACCESS')
) p
WHERE r.deleted = 0
  AND r.code = 'NORMAL_USER'
  AND NOT EXISTS (
    SELECT 1 FROM role_permission rp
    WHERE rp.role_id = r.id
      AND rp.permission_code = p.code
      AND rp.deleted = 0
  );
