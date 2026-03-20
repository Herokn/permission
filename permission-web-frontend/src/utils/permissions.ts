import type { UserInfo } from '@/types';

export function canAccessPermission(user: UserInfo | null | undefined, code: string): boolean {
  if (!user) return false;
  if (user.admin) return true;
  return !!user.permissions?.includes(code);
}

export function canAccessPermissionPrefix(
  user: UserInfo | null | undefined,
  prefix: string
): boolean {
  if (!user) return false;
  if (user.admin) return true;
  return !!user.permissions?.some((p) => p.startsWith(prefix));
}

/**
 * 登录后默认落地路径：按模块与首个可访问子页
 */
function inferModulesFromPermissions(user: UserInfo): string[] {
  const mods: string[] = [];
  const perms = user.permissions ?? [];
  if (perms.some((p) => p.startsWith('USER_CENTER') || p === 'SYS_USER_MANAGEMENT_ACCESS')) {
    mods.push('user-center');
  }
  if (
    perms.some(
      (p) =>
        p.startsWith('PERMISSION_CENTER') ||
        p.startsWith('ROLE_') ||
        p.startsWith('USER_AUTH_') ||
        p.startsWith('PERMISSION_MANAGE') ||
        p.startsWith('PERM_CENTER') ||
        p === 'PERMISSION_MANAGE'
    )
  ) {
    mods.push('permission-center');
  }
  return mods;
}

export function getFirstAccessiblePath(user: UserInfo | null | undefined): string {
  if (!user) return '/login';
  if (user.admin) return '/user-center/users';

  const modsRaw = user.modules ?? [];
  const mods =
    modsRaw.length > 0 ? [...modsRaw] : inferModulesFromPermissions(user);
  if (mods.length === 0) return '/no-access';

  const has = (c: string) => canAccessPermission(user, c);
  const hasP = (prefix: string) => canAccessPermissionPrefix(user, prefix);

  if (mods.includes('user-center')) {
    if (hasP('USER_CENTER_USER_')) return '/user-center/users';
    if (hasP('USER_CENTER_ORG_')) return '/user-center/organizations';
    if (hasP('USER_CENTER_POSITION_')) return '/user-center/positions';
  }
  if (mods.includes('permission-center')) {
    if (has('PERMISSION_CENTER_PROJECT_VIEW')) return '/permission-center/projects';
    if (has('PERMISSION_CENTER_PERMISSION_VIEW')) return '/permission-center/permissions';
    if (has('PERMISSION_CENTER_ROLE_VIEW')) return '/permission-center/roles';
    if (has('PERMISSION_CENTER_USER_GRANT_VIEW')) return '/permission-center/user-grants';
    if (has('PERMISSION_CENTER_AUDIT_VIEW')) return '/permission-center/audit-logs';
  }

  return '/no-access';
}
