import { ssoApi, ucsApi } from './_preset'

export async function queryUsersPage_Api($data: any, signal?: AbortSignal) {
  const r = await ucsApi.post(
    { url: '/api/ucUser/queryPageWithTenantAndOrgRel', data: $data, signal },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  const data = body?.data || {}
  return data
}

export async function getUserDetail_Api(userId: number): Promise<any> {
  const r = await ucsApi.get(
    { url: '/api/ucUser/queryDetailWithTenantAndOrgRel', params: { userId } },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return body?.data
}

export async function addUser_Api(payload: {
  user: Record<string, any>
  userTenant?: Record<string, any>
  userOrgRel?: Record<string, any>
}): Promise<any> {
  const r = await ucsApi.post(
    { url: '/api/ucUser/addWithTenantAndOrgRel', data: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return body?.data
}

export async function modifyUserById_Api(payload: {
  user: Record<string, any>
  userTenant?: Record<string, any>
  userOrgRel?: Record<string, any>
}): Promise<any> {
  const r = await ucsApi.post(
    { url: '/api/ucUser/modifyWithTenantAndOrgRelById', data: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return body?.data
}

export async function enableUserById_Api(payload: {
  id: number
}): Promise<boolean> {
  const r = await ucsApi.get(
    { url: '/api/ucUser/enableUcUserById', params: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return body?.data
}

export async function disableUserById_Api(payload: {
  id: number
}): Promise<boolean> {
  const r = await ucsApi.get(
    { url: '/api/ucUser/disableUcUserById', params: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return body?.data
}

// 重置密码 API
export async function resetPasswordByUserId_Api(payload: {
  userId: string | number
}): Promise<any> {
  const r = await ssoApi.post(
    {
      url: '/api/ssoUserCredential/modifySsoUserCredentialByUserId',
      data: payload,
    },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Reset password failed'))
  return body?.data
}
