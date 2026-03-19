import { ucsApi } from './_preset'

export async function queryAllUcOrgs_Api(params: {
  tenantId: number
  parentId: number
}): Promise<any[]> {
  const r = await ucsApi.post(
    { url: '/api/ucOrg/queryAllUcOrgs', data: params },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok) throw new Error(String(body.message || body.msg || '请求失败'))
  return Array.isArray(body?.data) ? body.data : []
}

export async function queryAllUcOrgPositions(params: {
  tenantId: number
  orgId: number
}): Promise<any[]> {
  const r = await ucsApi.post(
    { url: '/api/ucOrgPosition/queryAllUcOrgPositions', data: params },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return Array.isArray(body?.data) ? body.data : []
}

export async function listPositionsWithOrgFlag_Api(params: {
  orgId: number
}): Promise<any[]> {
  const r = await ucsApi.get(
    { url: '/api/ucOrgPosition/listPositionsWithOrgFlag', params },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return Array.isArray(body?.data) ? body.data : []
}

export async function queryUcOrgPositionsByOrgId(
  orgId: number,
  signal?: AbortSignal
): Promise<any[]> {
  const r = await ucsApi.get(
    { url: '/api/ucOrgPosition/queryByOrgId', params: { orgId }, signal },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return Array.isArray(body?.data) ? body.data : []
}
interface IAddUcOrg_Api {
  id?: number
  orgCode?: string
  orgName?: string
  orgType?: string
  status?: string
  parentId: number
}
//修改组织结构
export async function modifyUcOrgById_Api(data: IAddUcOrg_Api): Promise<any> {
  const r = await ucsApi.post(
    { url: '/api/ucOrg/modifyUcOrgById', data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return body?.data
}

//新增组织机构
export async function addUcOrg_Api(data: IAddUcOrg_Api): Promise<any> {
  const r = await ucsApi.post(
    { url: '/api/ucOrg/addUcOrg', data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return body?.data
}

//组织结构树
export async function getOrgTree_Api(): Promise<any> {
  const r = await ucsApi.get(
    { url: '/api/ucOrg/queryOrgTree' },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return body?.data
}

//批量更新组织与岗位的关系
export async function batchUpdateOrgPositions_Api(params: {
  orgId: number
  positionIds: number[]
}): Promise<any[]> {
  const r = await ucsApi.post(
    { url: '/api/ucOrgPosition/batchUpdateOrgPositions', data: params },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok =
    body &&
    typeof body === 'object' &&
    (body.success === true || body.code === 2000 || body.code === 0)
  if (!ok)
    throw new Error(String(body.message || body.msg || 'Server request failed'))
  return Array.isArray(body?.data) ? body.data : []
}
