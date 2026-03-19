import { defineStore } from 'pinia'
import {
  getUserInfo as queryUserInfo,
  login as Login,
  logout as Logout,
  getUserPermissions,
} from '@/api/modules/auth'
import { usePermissionStore } from '@/stores'
import { LoginParams } from '@/types/api/auth'
import type { UserInfo } from '@/types/interface'

const InitUserInfo: UserInfo = {
  nickName: '', // 用户名，用于展示在页面右上角头像处
  roles: [], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用

  userId: '', // 用户ID
  email: '', // 邮箱地址
  mobile: '', // 手机号
  tenantCode: '', // 租户编码
  tenantName: '', // 租户名称
  username: '', // 用户名
  avatar: '', // 头像URL
  enabled: true, // 是否启用
  description: '', // 描述
  birthday: '', // 生日
  orgId: '', // 组织ID
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    authenticationScheme: '', // 'Bearer', // 认证方案，默认Bearer
    userInfo: { ...InitUserInfo },
    systemList: [] as any[], // 系统权限列表
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles
    },
  },
  actions: {
    async login(loginParams: LoginParams) {
      console.log('Login::userInfo', loginParams)
      const response = await Login(loginParams)
      console.log('Login::res', response)
      const data = response?.data || {}
      // 现在 response 结构为 { code: 2000, message: 'Login Success', success: true, data: {...} }

      const tokenType = data?.tokenType || 'Bearer'
      const accessToken = data?.accessToken || ''

      // 直接存储拼接后的完整 token (tokenType + accessToken)
      this.token = accessToken ? `${tokenType} ${accessToken}` : ''
      this.authenticationScheme = tokenType

      // 如果登录返回了 username，更新到 userInfo
      if (data.username) {
        this.userInfo.username = data?.username
        this.userInfo.nickName = data?.username // 暂时用 username 作为 nickName
      }

      // 存储 SSO Session ID (用于登出)
      if (data?.ssoSessionId) {
        localStorage.setItem('sso_session_id', data?.ssoSessionId)
      }

      // 登录成功后，立即获取权限
      await this.fetchSystemPermissions()

      return response
    },
    async getUserInfo() {
      const userInfo = await queryUserInfo()
      this.userInfo = userInfo as UserInfo
    },
    /**
     * 获取系统权限列表（第一层权限）
     * 登录后调用，获取用户有权限的所有系统
     */
    async fetchSystemPermissions() {
      if (!this.token) return

      // Mock 系统列表（开发环境或接口不可用时使用）
      const mockSystems = [
        {
          mapUuid: 'user-management',
          mapShowname: '用户管理中心',
          mapCode: 'user-management',
          mapUrl: import.meta.env.VITE_USER_MANAGEMENT_URL || 'http://localhost:3032/',
          mapExternal: 'Y',
        },
        {
          mapUuid: 'permission-center',
          mapShowname: '权限控制中心',
          mapCode: 'permission-center',
          mapUrl: import.meta.env.VITE_PERMISSION_CENTER_URL || 'http://localhost:3000/',
          mapExternal: 'Y',
        },
      ]

      // 开发环境直接使用 mock 数据，避免等待接口超时
      if (import.meta.env.DEV) {
        console.log('[fetchSystemPermissions] DEV mode, using mock systems')
        this.systemList = mockSystems
        const permissionStore = usePermissionStore()
        permissionStore.setSystemList(mockSystems)
        return
      }

      try {
        const res = await getUserPermissions('')
        console.log('[fetchSystemPermissions] 接口返回数据:', res)

        if (res?.data && Array.isArray(res.data)) {
          this.systemList = res.data
          const permissionStore = usePermissionStore()
          permissionStore.setSystemList(res.data)
        }
      } catch (e) {
        console.error('Fetch system permissions failed, using mock data', e)
        this.systemList = mockSystems
        const permissionStore = usePermissionStore()
        permissionStore.setSystemList(mockSystems)
      }
    },
    async logout(isLogoutApi = false) {
      // 先调用退出接口（此时 token 还存在，request 拦截器可以正常添加到 header）
      if (isLogoutApi) {
        try {
          await Logout()
        } catch (e) {
          console.error('Logout API failed:', e)
          // 即使接口失败，也继续清除本地数据
        }
      }

      // 再清除本地数据
      this.token = ''
      this.userInfo = { ...InitUserInfo }
      this.systemList = []
      localStorage.clear()
    },
  },
  persist: {
    afterRestore: (ctx) => {
      const permissionStore = usePermissionStore()
      permissionStore.initRoutes([])
      // 恢复后把 systemList 同步到 permission store
      const userState = ctx.store.$state
      if (userState.systemList && userState.systemList.length > 0) {
        permissionStore.setSystemList(userState.systemList)
      }
    },
    key: 'user',
    paths: ['token', 'authenticationScheme', 'userInfo', 'systemList'],
  },
})
