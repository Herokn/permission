import { computed } from 'vue';
import { usePermissionStore } from '@/stores/modules/permission';

/**
 * 权限检查 Hook
 * 用于在组件中快速检查按钮权限
 */
export function usePermission() {
  const permissionStore = usePermissionStore();
  
  /**
   * 检查是否有指定权限
   * @param permissionCode 权限码
   * @returns 是否有权限
   */
  const hasPermission = (permissionCode: string | string[]): boolean => {
    if (!permissionCode) return true;
    
    const codes = Array.isArray(permissionCode) ? permissionCode : [permissionCode];
    const buttons = permissionStore.buttonPermissions;
    
    // 只要有一个权限码匹配即可
    return codes.some(code => buttons.includes(code));
  };
  
  /**
   * 检查是否有所有指定权限
   * @param permissionCodes 权限码数组
   * @returns 是否有所有权限
   */
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!permissionCodes || permissionCodes.length === 0) return true;
    
    const buttons = permissionStore.buttonPermissions;
    return permissionCodes.every(code => buttons.includes(code));
  };
  
  /**
   * 当前系统
   */
  const currentSystem = computed(() => permissionStore.currentSystem);
  
  /**
   * 当前系统的菜单列表
   */
  const menus = computed(() => permissionStore.menuTree);
  
  /**
   * 当前系统的按钮权限列表
   */
  const buttons = computed(() => permissionStore.buttonPermissions);
  
  return {
    hasPermission,
    hasAllPermissions,
    currentSystem,
    menus,
    buttons,
  };
}
