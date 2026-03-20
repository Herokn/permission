import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrentUser, getUserPermissions } from '@/api/modules/auth'

interface UserInfo {
  userId: string
  userName: string
  loginType?: string
  permissions?: string[]
  admin?: boolean
  modules?: string[]
}

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!userInfo.value)
    const permissions = computed(() => userInfo.value?.permissions || [])
    const isAdmin = computed(() => userInfo.value?.admin || false)

    // 检查是否有指定权限
    const hasPermission = (permissionCode: string) => {
      if (isAdmin.value) return true
      return permissions.value.includes(permissionCode)
    }

    // 检查是否有任一权限
    const hasAnyPermission = (permissionCodes: string[]) => {
      if (isAdmin.value) return true
      return permissionCodes.some((code) => permissions.value.includes(code))
    }

    // 设置 token（从 URL 参数获取）
    const setToken = (newToken: string) => {
      token.value = newToken
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const res = await getCurrentUser()
        if (res.code === 200 && res.data) {
          userInfo.value = res.data
          return res.data
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    }

    // 获取用户权限
    const fetchPermissions = async () => {
      try {
        const res = await getUserPermissions()
        if (res.code === 200 && res.data) {
          userInfo.value = res.data
          return res.data
        }
      } catch (error) {
        console.error('获取用户权限失败:', error)
        throw error
      }
    }

    // 清除登录状态
    const clearAuth = () => {
      token.value = ''
      userInfo.value = null
    }

    return {
      token,
      userInfo,
      isAuthenticated,
      permissions,
      isAdmin,
      hasPermission,
      hasAnyPermission,
      setToken,
      fetchUserInfo,
      fetchPermissions,
      clearAuth,
    }
  },
  {
    persist: {
      key: 'user',
      paths: ['token', 'userInfo'],
    },
  }
)

// 用户中心权限常量
export const USER_CENTER_PERMISSIONS = {
  // 用户查看
  USER_VIEW: 'USER_CENTER_USER_VIEW',
  // 用户创建
  USER_CREATE: 'USER_CENTER_USER_CREATE',
  // 用户编辑
  USER_EDIT: 'USER_CENTER_USER_EDIT',
  // 用户启用/禁用
  USER_ENABLE: 'USER_CENTER_USER_ENABLE',
  // 重置密码
  USER_RESET_PWD: 'USER_CENTER_USER_RESET_PWD',
  // 组织查看
  ORG_VIEW: 'USER_CENTER_ORG_VIEW',
  // 组织写操作（后端已拆分为 CREATE/EDIT/DELETE/MEMBER/ROLE 等；此处保留常用编辑码兼容旧按钮）
  ORG_MANAGE: 'USER_CENTER_ORG_EDIT',
  // 岗位查看
  POSITION_VIEW: 'USER_CENTER_POSITION_VIEW',
  // 岗位写操作（后端已拆分为 CREATE/EDIT/DELETE；此处保留编辑码兼容旧按钮）
  POSITION_MANAGE: 'USER_CENTER_POSITION_EDIT',
}
