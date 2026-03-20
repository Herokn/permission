-- Remove demo projects P1/P2 and related roles/permissions (keep UC/PC only). Backup first.

DELETE ur FROM user_role ur
  INNER JOIN role r ON ur.role_id = r.id
  WHERE r.project_id IN ('P1', 'P2');

DELETE rp FROM role_permission rp
  INNER JOIN role r ON rp.role_id = r.id
  WHERE r.project_id IN ('P1', 'P2');

DELETE FROM role WHERE project_id IN ('P1', 'P2');

DELETE FROM permission WHERE project_id IN ('P1', 'P2');

DELETE FROM project WHERE code IN ('P1', 'P2');
