import Garfish from '@garfish/core'
import { usePermissionStore } from '@/stores/modules/permission'
import { useUserStore } from '@/stores/modules/user'

/**
 * 主应用提供给子应用的全局数据和方法
 * @param router Vue Router 实例
 */
export function getGlobalProps(router?: any) {
  const permissionStore = usePermissionStore()
  const userStore = useUserStore()
  
  return {
    // 用户信息
    user: {
      get userInfo() {
        return userStore.userInfo
      },
      get token() {
        return userStore.token
      },
    },
    
    // 权限信息
    permission: {
      // 当前系统信息
      get currentSystem() {
        return permissionStore.currentSystem
      },
      
      // 菜单权限
      get menus() {
        return permissionStore.menuTree
      },
      
      // 按钮权限
      get buttons() {
        return permissionStore.buttonPermissions
      },
      
      // 检查按钮权限
      hasPermission(code: string | string[]): boolean {
        const codes = Array.isArray(code) ? code : [code]
        const buttons = permissionStore.buttonPermissions
        return codes.some(c => buttons.includes(c))
      },
      
      // 检查所有权限
      hasAllPermissions(codes: string[]): boolean {
        const buttons = permissionStore.buttonPermissions
        return codes.every(c => buttons.includes(c))
      },
      
      // 刷新权限（子应用可主动调用）
      async refreshPermissions() {
        const currentSystem = permissionStore.currentSystem
        if (currentSystem) {
          permissionStore.clearCache()
          await permissionStore.loadSystemPermissions(currentSystem.mapUuid)
        }
      },
    },
    
    // 导航方法
    navigation: {
      /**
       * 跳转到指定路径（主应用路由）
       * @param path 路由路径
       * @param query 查询参数
       */
      goto(path: string, query?: Record<string, any>) {
        if (router) {
          router.push({ path, query })
        } else {
          console.warn('[Garfish] Router not available')
        }
      },
      
      /**
       * 返回主应用首页
       */
      goHome() {
        if (router) {
          router.push('/')
        }
      },
      
      /**
       * 返回上一页
       */
      goBack() {
        if (router) {
          router.back()
        }
      },
      
      /**
       * 切换系统
       * @param systemCode 系统编码
       */
      async switchSystem(systemCode: string) {
        const targetSystem = permissionStore.systemList.find(
          s => s.mapCode === systemCode
        )
        if (targetSystem) {
          await permissionStore.switchSystem(targetSystem)
        } else {
          console.error(`[Garfish] System not found: ${systemCode}`)
        }
      },
      
      /**
       * 跨系统导航
       * @param systemCode 系统编码
       * @param path 系统内路径
       */
      async navigateToSystem(systemCode: string, path: string = '/') {
        await this.switchSystem(systemCode)
        const fullPath = `/${systemCode.toLowerCase()}${path}`
        this.goto(fullPath)
      },
    },
    
    // 工具方法
    utils: {
      // 消息通知（建议替换为实际的 UI 组件）
      message: {
        success(msg: string) {
          console.log('[Success]', msg)
          // 可以替换为 TDesign 的 MessagePlugin
        },
        error(msg: string) {
          console.error('[Error]', msg)
        },
        warning(msg: string) {
          console.warn('[Warning]', msg)
        },
      },
    },
  }
}

const garfish = new Garfish({
  plugins: [],
})

export default garfish

