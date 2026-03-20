/**
 * 预置 API 请求实例
 * 统一管理各服务的请求前缀，避免在各模块中重复硬编码
 */
import { createApiWithOptions } from '@/utils/request/utils'

/** 用户管理服务 - 直接使用 /api 前缀，后端会处理路由 */
export const ucsApi = createApiWithOptions({
  isJoinPrefix: false,
  urlPrefix: '',
})

/** 认证服务 - 直接使用 /api 前缀 */
export const ssoApi = createApiWithOptions({
  isJoinPrefix: false,
  urlPrefix: '',
})
