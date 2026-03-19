import type { ApiResult } from '../types/index.d.ts'
import type { Item } from '../types/index.d.ts'

export const API_PREFIX = '/api'
export const API = {
  ping: `${API_PREFIX}/ping`,
  health: `${API_PREFIX}/health`,
  mockItems: `${API_PREFIX}/mock/items`,
} as const

export type PingRes = ApiResult<{ ts: number }>
export type HealthRes = ApiResult<{ status: string; ts: number }>
export type ItemsRes = ApiResult<Item[]>
