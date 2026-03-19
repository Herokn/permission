export const Status = { Ok: 0, Error: 1, Unauth: 401, Forbidden: 403, NotFound: 404 } as const
export type ApiResult<T = any> = { code: number; msg?: string; data?: T }
export type Item = { id: number; name: string }
export type User = { id: number; name: string; email: string; role: string }
