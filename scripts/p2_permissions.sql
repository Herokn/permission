INSERT INTO permission (code, name, system_code, project_id, type, parent_code, sort_order, status, description, gmt_create, gmt_modified) VALUES
('USER_CENTER_P2', '用户中心', 'USER_CENTER', 'P2', 'MENU', NULL, 1, 'ENABLED', '用户中心菜单', NOW(), NOW()),
('USER_LIST_P2', '用户列表', 'USER_CENTER', 'P2', 'PAGE', 'USER_CENTER_P2', 1, 'ENABLED', '用户列表页面', NOW(), NOW()),
('USER_VIEW_P2', '查看用户', 'USER_CENTER', 'P2', 'ACTION', 'USER_LIST_P2', 1, 'ENABLED', '查看用户详情', NOW(), NOW()),
('USER_CREATE_P2', '创建用户', 'USER_CENTER', 'P2', 'ACTION', 'USER_LIST_P2', 2, 'ENABLED', '创建新用户', NOW(), NOW()),
('PRODUCT_CENTER_P2', '商品中心', 'PRODUCT_CENTER', 'P2', 'MENU', NULL, 2, 'ENABLED', '商品中心菜单', NOW(), NOW()),
('PRODUCT_LIST_P2', '商品列表', 'PRODUCT_CENTER', 'P2', 'PAGE', 'PRODUCT_CENTER_P2', 1, 'ENABLED', '商品列表页面', NOW(), NOW()),
('PRODUCT_VIEW_P2', '查看商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2', 1, 'ENABLED', '查看商品详情', NOW(), NOW()),
('PRODUCT_CREATE_P2', '创建商品', 'PRODUCT_CENTER', 'P2', 'ACTION', 'PRODUCT_LIST_P2', 2, 'ENABLED', '创建新商品', NOW(), NOW());
