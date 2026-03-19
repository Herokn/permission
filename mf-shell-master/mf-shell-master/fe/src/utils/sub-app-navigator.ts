/**
 * 子应用菜单导航适配器
 * 用于老系统迁移时的过渡方案
 */

/**
 * 子应用调用主应用导航的工具类
 */
export class SubAppNavigator {
  /**
   * 跳转到主应用路由
   * @param path 路由路径
   * @param query 查询参数
   */
  static navigateTo(path: string, query?: Record<string, any>) {
    // 方式1: 通过 Garfish Props（推荐）
    const mainApp = (window as any).__MAIN_APP__;
    if (mainApp?.navigation) {
      mainApp.navigation.goto(path, query);
      return;
    }
    
    // 方式2: 通过 postMessage（兼容老系统）
    window.parent.postMessage({
      type: 'NAVIGATE_TO',
      data: { path, query },
    }, '*');
  }
  
  /**
   * 切换系统
   * @param systemCode 系统编码
   */
  static switchSystem(systemCode: string) {
    const mainApp = (window as any).__MAIN_APP__;
    if (mainApp?.navigation) {
      mainApp.navigation.switchSystem(systemCode);
      return;
    }
    
    window.parent.postMessage({
      type: 'SWITCH_SYSTEM',
      data: { systemCode },
    }, '*');
  }
  
  /**
   * 返回主应用首页
   */
  static goHome() {
    const mainApp = (window as any).__MAIN_APP__;
    if (mainApp?.navigation) {
      mainApp.navigation.goHome();
      return;
    }
    
    window.parent.postMessage({
      type: 'GO_HOME',
    }, '*');
  }
}

/**
 * 主应用监听子应用消息的处理器
 */
export function setupSubAppMessageHandler(router: any, permissionStore: any) {
  window.addEventListener('message', async (event) => {
    // 安全检查：验证消息来源
    // 生产环境需要验证 event.origin
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'NAVIGATE_TO':
        // 子应用请求导航
        await router.push({
          path: data.path,
          query: data.query,
        });
        break;
        
      case 'SWITCH_SYSTEM':
        // 子应用请求切换系统
        const system = permissionStore.systemList.find(
          (s: any) => s.mapCode === data.systemCode
        );
        if (system) {
          await permissionStore.switchSystem(system);
        }
        break;
        
      case 'GO_HOME':
        // 返回首页
        await router.push('/');
        break;
        
      default:
        break;
    }
  });
}
