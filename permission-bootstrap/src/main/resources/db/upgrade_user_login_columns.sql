-- Upgrade user table: add login columns (compatible MySQL 8.0.x)
SET NAMES utf8mb4;

SET @db := DATABASE();

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'user' AND COLUMN_NAME = 'login_account');
SET @sql := IF(@exist = 0, 'ALTER TABLE `user` ADD COLUMN `login_account` VARCHAR(64) NULL AFTER `user_id`', 'SELECT 1');
PREPARE s1 FROM @sql; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'user' AND COLUMN_NAME = 'password_hash');
SET @sql := IF(@exist = 0, 'ALTER TABLE `user` ADD COLUMN `password_hash` VARCHAR(128) NULL AFTER `login_account`', 'SELECT 1');
PREPARE s2 FROM @sql; EXECUTE s2; DEALLOCATE PREPARE s2;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'user' AND COLUMN_NAME = 'user_type');
SET @sql := IF(@exist = 0, 'ALTER TABLE `user` ADD COLUMN `user_type` TINYINT NOT NULL DEFAULT 0 AFTER `password_hash`', 'SELECT 1');
PREPARE s3 FROM @sql; EXECUTE s3; DEALLOCATE PREPARE s3;

UPDATE `user` SET `login_account` = `user_id` WHERE `login_account` IS NULL OR TRIM(`login_account`) = '';
UPDATE `user` SET `password_hash` = '$2b$10$ZXUZto5ds7XRwKfRuSwPJ.pz/SyuiBwxL.aVEMMmvtfl19GiXZVCu' WHERE `password_hash` IS NULL OR TRIM(`password_hash`) = '';

ALTER TABLE `user` MODIFY `login_account` VARCHAR(64) NOT NULL;
ALTER TABLE `user` MODIFY `password_hash` VARCHAR(128) NOT NULL;

SET @idx := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = @db AND table_name = 'user' AND index_name = 'uk_login_account');
SET @sql := IF(@idx = 0, 'ALTER TABLE `user` ADD UNIQUE KEY `uk_login_account` (`login_account`)', 'SELECT 1');
PREPARE s4 FROM @sql; EXECUTE s4; DEALLOCATE PREPARE s4;
