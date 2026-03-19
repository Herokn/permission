/**
 * 预置 API 请求实例
 * 统一管理各服务的请求前缀，避免在各模块中重复硬编码
 */
import { createApiWithOptions } from '@/utils/request/utils'

/** 用户中心服务 */
export const ucsApi = createApiWithOptions({
  isJoinPrefix: true,
  urlPrefix: '/wb-ucs',
})

/** 单点登录服务 */
export const ssoApi = createApiWithOptions({
  isJoinPrefix: true,
  urlPrefix: '/wb-sso',
})
