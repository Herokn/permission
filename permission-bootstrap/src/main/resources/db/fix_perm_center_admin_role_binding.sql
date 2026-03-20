-- 若「权限中心管理员」在用户中心列表中仍出现，多为该行被标成 GLOBAL、或 project_id 绑错。
-- 执行前备份；与 init_full 期望一致：PROJECT + PERM_CENTER + PC。

UPDATE `role`
SET `role_scope` = 'PROJECT',
    `role_domain` = 'PERM_CENTER',
    `project_id` = 'PC'
WHERE `code` = 'PERM_CENTER_ADMIN'
  AND `deleted` = 0;
