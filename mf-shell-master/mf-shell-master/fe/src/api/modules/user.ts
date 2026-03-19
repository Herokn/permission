import type { User } from '@wb/shared'
import { request } from '@/utils/request'

export async function listUsers(): Promise<User[]> {
  const r = await request.get({ url: '/user/list' }, { isReturnNativeResponse: true, isTransformResponse: false })
  return (r.data as any)?.data as User[]
}

export async function getUser(id: number): Promise<User | null> {
  const r = await request.get({ url: `/user/${id}` }, { isReturnNativeResponse: true, isTransformResponse: false })
  return ((r.data as any)?.data as User) || null
}

export async function createUser(payload: Partial<User>): Promise<User> {
  const r = await request.post({ url: '/user', data: payload }, { isReturnNativeResponse: true, isTransformResponse: false })
  return (r.data as any)?.data as User
}

export async function updateUser(id: number, payload: Partial<User>): Promise<User | null> {
  const r = await request.put({ url: `/user/${id}`, data: payload }, { isReturnNativeResponse: true, isTransformResponse: false })
  return ((r.data as any)?.data as User) || null
}

export async function removeUser(id: number): Promise<boolean> {
  const r = await request.delete({ url: `/user/${id}` }, { isReturnNativeResponse: true, isTransformResponse: false })
  return Boolean((r.data as any)?.data)
}
