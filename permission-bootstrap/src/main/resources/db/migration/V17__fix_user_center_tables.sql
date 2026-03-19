-- 修复用户中心表结构
-- 创建岗位表和修复组织表字段映射

-- ============================================
-- 1. 创建岗位表
-- ============================================
CREATE TABLE IF NOT EXISTS position (
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
-- 2. 创建组织岗位关联表
-- ============================================
CREATE TABLE IF NOT EXISTS org_position (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  org_id BIGINT NOT NULL COMMENT '组织ID',
  position_id BIGINT NOT NULL COMMENT '岗位ID',
  gmt_create DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_position (org_id, position_id),
  INDEX idx_org_id (org_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组织岗位关联表';

-- ============================================
-- 3. 修改组织表，添加缺失的字段
-- ============================================
-- 添加组织类型字段（如果不存在则先添加列，否则忽略）
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'permission'
    AND table_name = 'organization'
    AND column_name = 'org_type'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE organization ADD COLUMN org_type VARCHAR(32) COMMENT ''组织类型：COMPANY/DEPARTMENT/TEAM''',
    'SELECT ''Column org_type already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加层级字段
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'permission'
    AND table_name = 'organization'
    AND column_name = 'level'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE organization ADD COLUMN level INT COMMENT ''层级''',
    'SELECT ''Column level already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加路径字段
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'permission'
    AND table_name = 'organization'
    AND column_name = 'path'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE organization ADD COLUMN path VARCHAR(512) COMMENT ''路径''',
    'SELECT ''Column path already exists''');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. 初始化岗位数据
-- ============================================
INSERT INTO position (position_code, position_name, level, description) VALUES
('CEO', '首席执行官', 1, '公司最高管理者'),
('CTO', '首席技术官', 2, '技术负责人'),
('CFO', '首席财务官', 2, '财务负责人'),
('COO', '首席运营官', 2, '运营负责人'),
('ENGINEER', '工程师', 3, '技术工程师'),
('SENIOR_ENGINEER', '高级工程师', 3, '高级技术工程师'),
('MANAGER', '经理', 3, '部门经理'),
('SALES', '销售', 4, '销售人员'),
('HR', '人事', 4, '人事专员'),
('ADMIN', '行政', 4, '行政专员')
ON DUPLICATE KEY UPDATE position_name=VALUES(position_name);

-- ============================================
-- 5. 更新现有组织的字段
-- ============================================
-- 更新根组织
UPDATE organization SET org_type='COMPANY', level=1, path='/ROOT' WHERE code='ROOT';

-- 更新其他组织
UPDATE organization SET org_type='DEPARTMENT', level=2, path=CONCAT('/ROOT/', code) WHERE code IN ('TECH', 'SALES') AND org_type IS NULL;
