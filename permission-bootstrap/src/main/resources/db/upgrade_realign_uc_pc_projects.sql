-- Realign project rows with UC/PC (ASCII-only comments for tooling compatibility)
-- For DBs initialized from older init_full (P1/P2 only or USER_MGMT on P1).

INSERT INTO project (code, name, description, systems, status)
SELECT 'UC',
       'User Center',
       'Maps to left nav User Center; USER_CENTER_* permissions control menus.',
       JSON_ARRAY(
         JSON_OBJECT('code', 'UC_USER', 'name', 'User management'),
         JSON_OBJECT('code', 'UC_ORG', 'name', 'Org and hierarchy'),
         JSON_OBJECT('code', 'UC_POSITION', 'name', 'Position management')
       ),
       'ENABLED'
WHERE NOT EXISTS (SELECT 1 FROM project WHERE code = 'UC' AND deleted = 0);

INSERT INTO project (code, name, description, systems, status)
SELECT 'PC',
       'Permission Center',
       'Maps to left nav Permission Center; PERMISSION_CENTER_* permissions control menus.',
       JSON_ARRAY(
         JSON_OBJECT('code', 'PC_PROJECT', 'name', 'Project management'),
         JSON_OBJECT('code', 'PC_PERMISSION', 'name', 'Permission management'),
         JSON_OBJECT('code', 'PC_ROLE', 'name', 'Role management'),
         JSON_OBJECT('code', 'PC_GRANT', 'name', 'User grants'),
         JSON_OBJECT('code', 'PC_AUDIT', 'name', 'Audit logs')
       ),
       'ENABLED'
WHERE NOT EXISTS (SELECT 1 FROM project WHERE code = 'PC' AND deleted = 0);

UPDATE project
SET name        = 'Demo business (orders/dashboard)',
    description = 'Demo project for project-scoped roles (PROJECT_MANAGER / MEMBER)',
    systems     = JSON_ARRAY(
        JSON_OBJECT('code', 'ORDER_CENTER', 'name', 'Order center'),
        JSON_OBJECT('code', 'DASHBOARD', 'name', 'Dashboard')
    )
WHERE code = 'P1' AND deleted = 0;

UPDATE project
SET name        = 'Demo business 2 (product)',
    description = 'Demo project for cross-project grants',
    systems     = JSON_ARRAY(
        JSON_OBJECT('code', 'PRODUCT_CENTER', 'name', 'Product center')
    )
WHERE code = 'P2' AND deleted = 0;

UPDATE permission
SET project_id  = 'UC',
    system_code   = 'UC_USER'
WHERE code IN ('USER_MGMT', 'USER_LIST', 'USER_VIEW', 'USER_EDIT')
  AND deleted = 0;
