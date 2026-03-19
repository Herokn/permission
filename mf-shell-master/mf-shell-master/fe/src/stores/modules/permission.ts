import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import { allRoutes } from '@/router'
import { store } from '@/stores'
import { getUserSubPermissions } from '@/api/modules/auth'

/** 系统权限信息 */
export interface SystemPermission {
  mapUuid: string // 系统唯一标识
  mapShowname: string // 系统显示名称
  mapCode: string // 系统编码
  mapIcon?: string // 系统图标
  [key: string]: any
}

/** 菜单权限信息 */
export interface MenuPermission {
  menuId: string
  menuName: string
  menuCode: string
  parentId?: string
  path?: string
  icon?: string
  children?: MenuPermission[]
  buttons?: ButtonPermission[]
  [key: string]: any
}

/** 按钮权限信息 */
export interface ButtonPermission {
  buttonId: string
  buttonName: string
  buttonCode: string
  [key: string]: any
}

/** 完整权限数据 */
export interface PermissionData {
  menus: MenuPermission[]
  buttons: string[] // 所有按钮权限码数组
  rawData: any // 原始数据
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: allRoutes,

    // 系统列表（第一层权限）
    systemList: [] as SystemPermission[],

    // 当前选中的系统
    currentSystem: null as SystemPermission | null,

    // 当前系统的菜单和按钮权限（第二层权限）
    currentPermissions: null as PermissionData | null,

    // 权限缓存：key 为 sysUuid，value 为权限数据
    permissionCache: new Map<string, PermissionData>(),

    // 是否正在加载权限
    loading: false,

    // 当前 iframe 的 src 地址
    currentIframeSrc:
      import.meta.env.VITE_DEFAULT_IFRAME_SRC ||
      'https://ones.wbm3.com/users/list',
  }),

  getters: {
    /** 当前系统的所有按钮权限码 */
    buttonPermissions: (state): string[] => {
      return state.currentPermissions?.buttons || []
    },

    /** 当前系统的菜单树 */
    menuTree: (state): MenuPermission[] => {
      return state.currentPermissions?.menus || []
    },

    /** 检查是否有指定按钮权限 */
    hasPermission: (state) => {
      return (permissionCode: string): boolean => {
        return (
          state.currentPermissions?.buttons.includes(permissionCode) || false
        )
      }
    },
  },

  actions: {
    initRoutes(roles: Array<string>) {
      // 可以在这里根据权限过滤路由
      // 目前返回所有路由
      this.routers = allRoutes
    },

    /**
     * 设置系统列表（第一层权限）
     * 通常在登录后调用
     */
    setSystemList(systems: SystemPermission[]) {
      this.systemList = systems

      // 如果之前没有选中系统，自动选中第一个
      if (!this.currentSystem && systems.length > 0) {
        this.currentSystem = systems[0]
        // 同时设置 iframe src 为第一个系统的 URL
        if (systems[0].mapUrl) {
          this.currentIframeSrc = systems[0].mapUrl
        }
      }
    },

    /**
     * 切换系统并加载对应权限
     * @param system 要切换到的系统
     * @returns 权限数据
     */
    async switchSystem(
      system: SystemPermission
    ): Promise<PermissionData | null> {
      this.currentSystem = system

      // 先从缓存获取
      const cached = this.permissionCache.get(system.mapUuid)
      if (cached) {
        this.currentPermissions = cached
        return cached
      }

      // 缓存未命中，调用接口加载
      return await this.loadSystemPermissions(system)
    },

    // 辅助方法：获取当前用户名
    getCurrentUsername() {
      const userStore = store.state.value.user
      return userStore.userInfo?.username || ''
    },

    /**
     * 设置当前 iframe 的 src 地址
     */
    setIframeSrc(src: string) {
      this.currentIframeSrc = src
    },

    async loadSystemPermissions(system: SystemPermission) {
      if (!system || !system.mapUuid) return null

      // 如果已有缓存，直接使用
      if (this.permissionCache.has(system.mapUuid)) {
        this.currentSystem = system
        this.currentPermissions = this.permissionCache.get(system.mapUuid)!
        return this.currentPermissions
      }

      this.loading = true
      try {
        // fatherUuid 传入系统的 mapUuid，获取该系统下的菜单权限
        const res = await getUserSubPermissions(system.mapUuid)

        if (res?.data) {
          const data = res.data
          const permissionData = this.transformPermissionData(data)

          this.currentSystem = system
          this.currentPermissions = permissionData
          this.permissionCache.set(system.mapUuid, permissionData)
          return permissionData
        }
        return null
      } catch (e) {
        console.error('Load system permissions failed:', e)
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * 转换权限数据为统一格式
     */
    transformPermissionData(rawData: any): PermissionData {
      const menus: MenuPermission[] = []
      const buttons: string[] = []

      // 根据实际返回数据结构转换
      // 这里需要根据您的实际数据格式调整
      if (Array.isArray(rawData)) {
        rawData.forEach((item: any) => {
          // 假设返回的是菜单列表
          if (item.mapType === 'menu' || item.mapOpenMode === 'blank') {
            menus.push({
              menuId: item.mapUuid || item.mapIndex,
              menuName: item.mapShowname || item.mapRemarks,
              menuCode: item.mapCode,
              path: item.mapUrl,
              icon: item.mapIcon,
              parentId: item.mapFatherUuid,
            })
          }

          if (item.mapType === 'button') {
            buttons.push(item.mapCode)
          }
        })
      }

      return {
        menus,
        buttons,
        rawData,
      }
    },

    // 辅助方法：获取父级UUID（从缓存或当前系统列表查找）
    // getFatherUuid(sysUuid: string): string { ... }
  },
})

export function getPermissionStore() {
  return usePermissionStore(store)
}
