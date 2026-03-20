/**
 * Position Management API
 */

import type {
  ApiResponse,
  OrganizationTreeNode,
  Position,
  PositionFormRequest,
  PositionListResponse,
  PositionQueryRequest,
} from '@/types/api/users/position'
import { ucsApi } from './_preset'

/**
 * Query positions with pagination
 */
export async function queryPagePositions(
  params: PositionQueryRequest
): Promise<ApiResponse<PositionListResponse>> {
  return await ucsApi.get({
    url: '/positions',
    params: { pageNum: params.pageNum, pageSize: params.pageSize, orgId: params.orgId },
  })
}

/**
 * Query all positions
 */
export async function queryAllPositions(
  params?: PositionQueryRequest
): Promise<ApiResponse<Position[]>> {
  return await ucsApi.get({
    url: '/positions',
    params: params ? { orgId: params.orgId } : {},
  })
}

/**
 * Query position by ID
 */
export async function queryPositionById(
  id: number
): Promise<ApiResponse<Position>> {
  return await ucsApi.get({
    url: `/positions/${id}`,
  })
}

/**
 * Add new position
 */
export async function addPosition(
  data: PositionFormRequest
): Promise<ApiResponse<number>> {
  return await ucsApi.post({
    url: '/positions',
    data: {
      positionCode: data.positionCode,
      positionName: data.positionName,
      level: data.level,
      description: data.description,
    },
  })
}

/**
 * Modify position by ID
 */
export async function modifyPositionById(
  data: PositionFormRequest
): Promise<ApiResponse<void>> {
  return await ucsApi.put({
    url: `/positions/${data.id}`,
    data: {
      positionCode: data.positionCode,
      positionName: data.positionName,
      level: data.level,
      description: data.description,
    },
  })
}

/**
 * Enable position by ID (Not implemented in backend yet)
 */
export async function enablePositionById(
  id: number
): Promise<ApiResponse<void>> {
  // Backend doesn't have this endpoint yet, return success
  return Promise.resolve({ code: 200, message: 'success', data: undefined })
}

/**
 * Disable position by ID (Not implemented in backend yet)
 */
export async function disablePositionById(
  id: number
): Promise<ApiResponse<void>> {
  // Backend doesn't have this endpoint yet, return success
  return Promise.resolve({ code: 200, message: 'success', data: undefined })
}

/**
 * Query organization tree by position ID
 */
export async function queryOrgTreeByPositionId(
  positionId: number
): Promise<ApiResponse<OrganizationTreeNode[]>> {
  // Use org tree endpoint
  return await ucsApi.get({
    url: '/organizations/tree',
  })
}
