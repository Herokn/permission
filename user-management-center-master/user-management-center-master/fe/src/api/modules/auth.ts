import { request } from '@/utils/request'

export function login(payload: { username: string; password: string }) {
  return request.post({ url: '/auth/login', data: payload }, { isReturnNativeResponse: true, isTransformResponse: false })
}
