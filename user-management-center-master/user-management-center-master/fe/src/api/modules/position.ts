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
  return await ucsApi.post({
    url: '/api/ucPosition/queryPageUcPositions',
    data: params,
  })
}

/**
 * Query all positions
 */
export async function queryAllPositions(
  params?: PositionQueryRequest
): Promise<ApiResponse<Position[]>> {
  return await ucsApi.post({
    url: '/api/ucPosition/queryAllUcPositions',
    data: params || {},
  })
}

/**
 * Query position by ID
 */
export async function queryPositionById(
  id: number
): Promise<ApiResponse<Position>> {
  return await ucsApi.get({
    url: '/api/ucPosition/queryUcPositionById',
    params: { id },
  })
}

/**
 * Add new position
 */
export async function addPosition(
  data: PositionFormRequest
): Promise<ApiResponse<number>> {
  return await ucsApi.post({ url: '/api/ucPosition/addUcPosition', data })
}

/**
 * Modify position by ID
 */
export async function modifyPositionById(
  data: PositionFormRequest
): Promise<ApiResponse<void>> {
  return await ucsApi.post({
    url: '/api/ucPosition/modifyUcPositionById',
    data,
  })
}

/**
 * Enable position by ID
 */
export async function enablePositionById(
  id: number
): Promise<ApiResponse<void>> {
  return await ucsApi.get({
    url: '/api/ucPosition/enableUcPositionById',
    params: { id },
  })
}

/**
 * Disable position by ID
 */
export async function disablePositionById(
  id: number
): Promise<ApiResponse<void>> {
  return await ucsApi.get({
    url: '/api/ucPosition/disableUcPositionById',
    params: { id },
  })
}

/**
 * Query organization tree by position ID
 */
export async function queryOrgTreeByPositionId(
  positionId: number
): Promise<ApiResponse<OrganizationTreeNode[]>> {
  return await ucsApi.get({
    url: '/api/ucOrgPosition/queryOrgTreeByPositionId',
    params: { positionId },
  })
}
