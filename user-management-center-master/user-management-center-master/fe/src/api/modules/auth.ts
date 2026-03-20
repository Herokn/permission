import { request } from '@/utils/request'

export function login(payload: { userName: string; password: string }) {
  return request.post(
    { url: '/auth/login', data: payload },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
}

export function getCurrentUser() {
  return request.get(
    { url: '/auth/current-user' },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
}

export function getUserPermissions() {
  return request.get(
    { url: '/auth/permissions' },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
}

export function logout() {
  return request.post(
    { url: '/auth/logout' },
    { isReturnNativeResponse: true, isTransformResponse: false }
  )
}
