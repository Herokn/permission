/**
 * 权限系统调试工具
 * 在浏览器控制台使用: window.$permission
 */

import { usePermissionStore } from '@/stores/modules/permission';
import { useUserStore } from '@/stores/modules/user';

export function setupPermissionDebugger() {
  const permissionStore = usePermissionStore();
  const userStore = useUserStore();
  
  (window as any).$permission = {
    /**
     * 查看当前权限状态
     */
    status() {
      console.log('=== 权限系统状态 ===');
      console.log('当前用户:', userStore.userInfo.username);
      console.log('系统列表:', permissionStore.systemList);
      console.log('当前系统:', permissionStore.currentSystem);
      console.log('菜单权限:', permissionStore.menuTree);
      console.log('按钮权限:', permissionStore.buttonPermissions);
      console.log('缓存状态:', {
        size: permissionStore.permissionCache.size,
        keys: Array.from(permissionStore.permissionCache.keys()),
      });
    },
    
    /**
     * 测试权限检查
     */
    test(code: string) {
      const result = permissionStore.hasPermission(code);
      console.log(`权限检查 [${code}]:`, result ? '✅ 有权限' : '❌ 无权限');
      return result;
    },
    
    /**
     * 切换系统
     */
    async switch(index: number) {
      const system = permissionStore.systemList[index];
      if (!system) {
        console.error('系统不存在，索引:', index);
        return;
      }
      
      console.log('正在切换到:', system.mapShowname);
      const permissions = await permissionStore.switchSystem(system);
      console.log('切换成功:', permissions);
      return permissions;
    },
    
    /**
     * 清除缓存
     */
    clearCache() {
      permissionStore.clearCache();
      console.log('✅ 缓存已清除');
    },
    
    /**
     * 刷新当前系统权限
     */
    async refresh() {
      const system = permissionStore.currentSystem;
      if (!system) {
        console.error('未选择系统');
        return;
      }
      
      permissionStore.clearCache();
      const permissions = await permissionStore.loadSystemPermissions(system.mapUuid);
      console.log('✅ 权限已刷新:', permissions);
      return permissions;
    },
    
    /**
     * 模拟权限数据（开发调试用）
     */
    mock() {
      const mockPermissions = {
        menus: [
          {
            menuId: 'menu-1',
            menuName: '用户管理',
            menuCode: 'user:view',
            path: '/user/list',
          },
          {
            menuId: 'menu-2',
            menuName: '角色管理',
            menuCode: 'role:view',
            path: '/role/list',
          },
        ],
        buttons: [
          'user:add',
          'user:edit',
          'user:delete',
          'role:add',
          'role:edit',
        ],
        rawData: {},
      };
      
      const currentSystem = permissionStore.currentSystem;
      if (currentSystem) {
        permissionStore.permissionCache.set(currentSystem.mapUuid, mockPermissions);
        permissionStore.currentPermissions = mockPermissions;
        console.log('✅ Mock 数据已设置');
      } else {
        console.error('未选择系统');
      }
    },
    
    /**
     * 导出权限数据
     */
    export() {
      const data = {
        systemList: permissionStore.systemList,
        currentSystem: permissionStore.currentSystem,
        currentPermissions: permissionStore.currentPermissions,
        cache: Array.from(permissionStore.permissionCache.entries()).map(([key, value]) => ({
          sysUuid: key,
          permissions: value,
        })),
      };
      
      console.log('=== 权限数据导出 ===');
      console.log(JSON.stringify(data, null, 2));
      
      // 复制到剪贴板
      const json = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        console.log('✅ 已复制到剪贴板');
      });
      
      return data;
    },
    
    /**
     * 帮助信息
     */
    help() {
      console.log(`
=== 权限调试工具使用指南 ===

$permission.status()           - 查看当前权限状态
$permission.test('user:add')   - 测试权限检查
$permission.switch(0)          - 切换到指定索引的系统
$permission.clearCache()       - 清除权限缓存
$permission.refresh()          - 刷新当前系统权限
$permission.mock()             - 设置 Mock 数据（开发调试）
$permission.export()           - 导出权限数据到剪贴板
$permission.help()             - 显示帮助信息

示例：
  // 查看状态
  $permission.status()
  
  // 测试权限
  $permission.test('user:add')
  
  // 切换到第二个系统
  $permission.switch(1)
  
  // 刷新权限
  $permission.refresh()
      `);
    },
  };
  
  // 自动显示帮助
  console.log('💡 权限调试工具已加载，输入 $permission.help() 查看使用帮助');
}
