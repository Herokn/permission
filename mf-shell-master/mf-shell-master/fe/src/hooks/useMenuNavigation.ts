import { useRouter } from 'vue-router';
import { usePermissionStore } from '@/stores/modules/permission';

/**
 * 菜单导航 Hook
 * 提供统一的菜单导航方法，支持主子应用间跳转
 */
export function useMenuNavigation() {
  const router = useRouter();
  const permissionStore = usePermissionStore();
  
  /**
   * 导航到指定路径
   * @param path 路由路径
   * @param query 查询参数
   * @param systemCode 系统编码（可选，如果跨系统跳转需要传）
   */
  const navigateTo = async (
    path: string,
    query?: Record<string, any>,
    systemCode?: string
  ) => {
    try {
      // 如果指定了系统编码，先切换系统
      if (systemCode) {
        const targetSystem = permissionStore.systemList.find(
          s => s.mapCode === systemCode
        );
        
        if (targetSystem && targetSystem.mapUuid !== permissionStore.currentSystem?.mapUuid) {
          await permissionStore.switchSystem(targetSystem);
        }
      }
      
      // 路由跳转
      await router.push({ path, query });
    } catch (error) {
      console.error('[MenuNavigation] Navigate failed:', error);
    }
  };
  
  /**
   * 返回首页
   */
  const goHome = () => {
    router.push('/');
  };
  
  /**
   * 返回上一页
   */
  const goBack = () => {
    router.back();
  };
  
  /**
   * 跨系统导航
   * @param systemCode 目标系统编码
   * @param path 目标路径（相对于系统根路径）
   */
  const navigateToSystem = async (systemCode: string, path: string = '/') => {
    const targetSystem = permissionStore.systemList.find(
      s => s.mapCode === systemCode
    );
    
    if (!targetSystem) {
      console.error(`[MenuNavigation] System not found: ${systemCode}`);
      return;
    }
    
    // 切换系统
    await permissionStore.switchSystem(targetSystem);
    
    // 跳转路径
    const fullPath = `/${systemCode.toLowerCase()}${path}`;
    await router.push(fullPath);
  };
  
  /**
   * 判断菜单是否激活
   * @param menuPath 菜单路径
   */
  const isMenuActive = (menuPath: string): boolean => {
    return router.currentRoute.value.path === menuPath ||
           router.currentRoute.value.path.startsWith(menuPath + '/');
  };
  
  return {
    navigateTo,
    goHome,
    goBack,
    navigateToSystem,
    isMenuActive,
  };
}
