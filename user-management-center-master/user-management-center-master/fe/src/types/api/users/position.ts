/**
 * Position API Type Definitions
 */

/**
 * Common API response
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

/**
 * Page request parameters
 */
export interface PageRequest {
  pageSize?: number
  currentPage?: number
}

/**
 * Page response data
 */
export interface PageResponse<T = any> {
  currentPage: number
  pageSize: number
  total: number
  totalPage: number
  isMore: number
  startIndex: number
  list: T[]
}

/**
 * Position status enum
 */
export enum PositionStatus {
  ACTIVE = 1,
  DISABLED = 0,
}

/**
 * Position entity
 */
export interface Position {
  id?: number
  tenantId?: number
  positionCode: string
  positionName: string
  positionLevel?: string
  description?: string
  status: number // 1=ACTIVE, 0=DISABLED
  orgCount?: number // 使用该职位的组织数量
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  extJson?: string
}

/**
 * Position query request
 */
export interface PositionQueryRequest extends PageRequest {
  id?: number
  tenantId?: number
  positionCode?: string
  positionName?: string
  positionLevel?: string
  description?: string
  status?: number | '' // 1=ACTIVE, 0=DISABLED
  search?: string
}

/**
 * Position list response
 */
export interface PositionListResponse extends PageResponse<Position> {}

/**
 * Position add/edit request
 */
export interface PositionFormRequest {
  id?: number
  tenantId?: number
  positionCode: string
  positionName: string
  positionLevel?: string
  description?: string
  status?: number // 1=ACTIVE, 0=DISABLED
}

/**
 * Organization tree node
 */
export interface OrganizationTreeNode {
  id: number
  tenantId: number
  orgCode: string
  orgName: string
  parentId: number
  orgType: string
  region?: string
  status: string
  orderNum?: number
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  extJson?: string
  belongsToPosition?: boolean
  level?: number
  children?: OrganizationTreeNode[]
}

/**
 * Organization tree query request
 */
export interface OrganizationTreeQueryRequest {
  positionId: number
}

/**
 * Organization tree response
 */
export interface OrganizationTreeResponse {
  code: number
  message: string
  data: OrganizationTreeNode[]
  success: boolean
}
