import { request } from '@/utils/request'

export function login(payload: {
  username: string
  password: string
  projectId?: string
}) {
  // 对接 Node 服务端的 SSO 代理登录接口
  // 注意：需要确保请求路径包含 VITE_API_URL_PREFIX (/mf-shell/api)
  // request 工具通常会自动拼接前缀，但取决于配置。
  // 根据 vite.config.ts 的 proxy 配置：/mf-shell/api -> http://localhost:4130/api
  // 后端 Controller 路径是 api/auth/sso/login
  // 所以前端请求应该是 /auth/sso/login (如果 request 工具自动加了 /mf-shell/api 前缀)
  // 或者 /mf-shell/api/auth/sso/login

  // 检查 request.ts 的 beforeRequestHook:
  // if (isJoinPrefix && urlPrefix) config.url = `${urlPrefix}${config.url}`;

  // 假设默认开启了 isJoinPrefix，且 urlPrefix 是 VITE_API_URL_PREFIX (/mf-shell/api)
  // 那么最终请求就是 /mf-shell/api/auth/sso/login -> proxy -> http://localhost:4130/api/auth/sso/login

  return request.post({ url: '/auth/login', data: payload })
}

export function loginByPermissionSession(projectId: string = 'P1') {
  return request.post({
    url: '/auth/login/by-permission-session',
    data: { projectId },
  })
}

export function getUserInfo() {
  return request.get({ url: '/auth/me' })
}

export function getAuthorizedSystems(projectId?: string) {
  return request.get({
    url: '/auth/systems',
    params: projectId ? { projectId } : undefined,
  })
}

export async function logout() {
  // 从 localStorage 获取 ssoSessionId
  const ssoSessionId = localStorage.getItem('sso_session_id') || ''

  try {
    const response = await request.post({
      url: '/auth/logout',
      data: { ssoSessionId },
    })

    // 无论后端返回什么结果，都清除localStorage
    // 后端会返回 clearStorage: true 标志
    if (response?.clearStorage) {
      localStorage.clear()
    }

    return response
  } catch (error) {
    // 即使登出接口失败，也要清除本地数据
    localStorage.clear()
    throw error
  }
}

/**
 * 获取用户权限（系统列表）
 * fatherUuid 为空时返回系统列表
 * 注意：userName 由后端从 WB-Access-Token 中解析，前端不需要传递
 */
export function getUserPermissions(fatherUuid: string = '') {
  return request.post(
    {
      url: '/wb-acs/api/userPermissions/loadUserPermission',
      data: {
        // sysUuid: '5a1c4589c43c138c1478fe99aa61dd66',
        sysUuid: '9b2de387cf7a519fed2c10d40a3cea1a',
        fatherUuid,
      },
    },
    { isJoinPrefix: false }
  )
}

/**
 * 获取用户子权限（菜单/按钮）
 * 与 getUserPermissions 使用同一接口，通过 fatherUuid 区分层级
 * 注意：userName 由后端从 WB-Access-Token 中解析，前端不需要传递
 */
export function getUserSubPermissions(fatherUuid: string) {
  return request.post(
    {
      url: '/wb-acs/api/userPermissions/loadUserPermission',
      data: {
        sysUuid: '5a1c4589c43c138c1478fe99aa61dd66',
        fatherUuid,
      },
    },
    { isJoinPrefix: false }
  )
}

/**
 * 发送验证码（忘记密码）
 * 直接调用 SSO 服务，不经过 Node 层
 */
export function forgotPasswordSendEmail(data: { email: string }) {
  return request.post(
    { url: '/wb-sso/api/v1/sso/sendVerificationCode', data },
    { isJoinPrefix: false }
  )
}

/**
 * 忘记密码 - 重置密码
 * 直接调用 SSO 服务，不经过 Node 层
 */
export function forgotPasswordUpdate(data: {
  email: string
  verificationCode: string
  newPassword: string
  confirmPassword: string
}) {
  return request.post(
    { url: '/wb-sso/api/v1/sso/password/forgot/reset', data },
    { isJoinPrefix: false }
  )
}

/**
 * 修改密码
 * 直接调用 SSO 服务，不经过 Node 层
 * 需要传递 Authorization header
 */
export function changePassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
  userId?: string
}) {
  return request.post(
    { url: '/wb-sso/api/v1/sso/password/reset', data },
    { isJoinPrefix: false }
  )
}
