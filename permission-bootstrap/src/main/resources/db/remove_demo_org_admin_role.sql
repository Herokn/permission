-- 演示数据精简：去掉 ORG_ADMIN（与 USER_ORG_MANAGER 能力重叠）。init_full 已不含 ORG_ADMIN；本脚本用于已有库。
-- 执行前请备份。

DELETE ur FROM `user_role` ur
INNER JOIN `role` r ON ur.role_id = r.id AND r.code = 'ORG_ADMIN';

DELETE rp FROM `role_permission` rp
INNER JOIN `role` r ON rp.role_id = r.id AND r.code = 'ORG_ADMIN';

UPDATE `role` SET `deleted` = 1 WHERE `code` = 'ORG_ADMIN' AND `deleted` = 0;
