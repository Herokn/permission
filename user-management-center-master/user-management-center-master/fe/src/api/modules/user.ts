import { ucsApi } from './_preset'

/**
 * 分页查询用户
 */
export async function queryUsersPage_Api($data: any, signal?: AbortSignal) {
  const r = await ucsApi.get(
    {
      url: '/users',
      params: $data,
      signal,
    },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 获取用户详情
 */
export async function getUserDetail_Api(userId: string): Promise<any> {
  const r = await ucsApi.get(
    { url: `/users/${userId}` },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 创建用户
 */
export async function addUser_Api(payload: {
  userId: string
  displayName: string
  fullName?: string
  mobile?: string
  email?: string
  avatarUrl?: string
}): Promise<any> {
  const r = await ucsApi.post(
    { url: '/users', data: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 更新用户
 */
export async function modifyUserById_Api(
  userId: string,
  payload: {
    displayName?: string
    fullName?: string
    mobile?: string
    email?: string
    avatarUrl?: string
  }
): Promise<any> {
  const r = await ucsApi.put(
    { url: `/users/${userId}`, data: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 启用用户
 */
export async function enableUserById_Api(userId: string): Promise<boolean> {
  const r = await ucsApi.post(
    { url: `/users/${userId}/enable` },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data === true
}

/**
 * 禁用用户
 */
export async function disableUserById_Api(userId: string): Promise<boolean> {
  const r = await ucsApi.post(
    { url: `/users/${userId}/disable` },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data === true
}

/**
 * 重置密码
 */
export async function resetPasswordByUserId_Api(payload: {
  userId: string
  newPassword?: string
}): Promise<any> {
  const r = await ucsApi.post(
    { url: `/users/${payload.userId}/reset-password`, data: { newPassword: payload.newPassword } },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '重置密码失败'))
  return body.data
}
