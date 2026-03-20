import { ucsApi } from './_preset'

/**
 * 查询组织树
 */
export async function getOrgTree_Api(status?: number): Promise<any[]> {
  const r = await ucsApi.get(
    {
      url: '/organizations/tree',
      params: status !== undefined ? { status } : {},
    },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return Array.isArray(body?.data) ? body.data : []
}

/**
 * 查询组织详情
 */
export async function getOrgDetail_Api(orgId: number): Promise<any> {
  const r = await ucsApi.get(
    { url: `/organizations/${orgId}` },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 创建组织
 */
export async function addOrg_Api(data: {
  orgCode: string
  orgName: string
  orgType: string
  parentId?: number
}): Promise<any> {
  const r = await ucsApi.post(
    { url: '/organizations', data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 修改组织
 */
export async function modifyOrgById_Api(
  orgId: number,
  data: {
    orgCode?: string
    orgName?: string
    orgType?: string
    status?: number
  }
): Promise<any> {
  const r = await ucsApi.put(
    { url: `/organizations/${orgId}`, data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 配置组织岗位
 */
export async function configOrgPositions_Api(params: {
  orgId: number
  positionIds: number[]
}): Promise<any> {
  const r = await ucsApi.post(
    { url: `/organizations/${params.orgId}/positions`, data: params.positionIds },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 查询岗位列表
 */
export async function queryPositions_Api(orgId?: number): Promise<any[]> {
  const r = await ucsApi.get(
    {
      url: '/positions',
      params: orgId ? { orgId } : {},
    },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return Array.isArray(body?.data) ? body.data : []
}

/**
 * 创建岗位
 */
export async function addPosition_Api(data: {
  positionCode: string
  positionName: string
  level?: number
  description?: string
}): Promise<any> {
  const r = await ucsApi.post(
    { url: '/positions', data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 修改岗位
 */
export async function modifyPositionById_Api(
  positionId: number,
  data: {
    positionCode?: string
    positionName?: string
    level?: number
    description?: string
  }
): Promise<any> {
  const r = await ucsApi.put(
    { url: `/positions/${positionId}`, data },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return body.data
}

/**
 * 删除岗位
 */
export async function deletePosition_Api(positionId: number): Promise<boolean> {
  const r = await ucsApi.delete(
    { url: `/positions/${positionId}` },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
  const body = (r as any)?.data || {}
  const ok = body && typeof body === 'object' && body.code === 200
  if (!ok) throw new Error(String(body.message || '请求失败'))
  return true
}

/**
 * 查询组织的岗位列表（兼容旧接口）
 */
export async function queryUcOrgPositionsByOrgId(orgId: number): Promise<any[]> {
  return queryPositions_Api(orgId)
}

/**
 * 查询所有组织（兼容旧接口）
 */
export async function queryAllUcOrgs_Api(): Promise<any[]> {
  return getOrgTree_Api()
}

/**
 * 修改组织（兼容旧接口）
 */
export async function modifyUcOrgById_Api(
  orgId: number,
  data: {
    orgCode?: string
    orgName?: string
    orgType?: string
    status?: number
  }
): Promise<any> {
  return modifyOrgById_Api(orgId, data)
}

/**
 * 批量更新组织岗位
 */
export async function batchUpdateOrgPositions_Api(params: {
  orgId: number
  positionIds: number[]
}): Promise<any> {
  return configOrgPositions_Api(params)
}

/**
 * 添加组织（兼容旧接口）
 */
export async function addUcOrg_Api(data: {
  orgCode: string
  orgName: string
  orgType: string
  parentId?: number
}): Promise<any> {
  return addOrg_Api(data)
}

/**
 * 列出带组织标志的岗位
 */
export async function listPositionsWithOrgFlag_Api(): Promise<any[]> {
  return queryPositions_Api()
}
