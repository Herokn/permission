import { Injectable } from '@nestjs/common'

function getApiBase() {
  return process.env.SPRING_API_BASE || 'http://localhost:8080'
}

async function fetchWithAuth(path: string, options: { method: string; body?: any; auth?: string }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.auth) {
    headers['Authorization'] = options.auth
  }
  const res = await fetch(`${getApiBase()}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await res.json()
  return data
}

async function getJson(path: string, params: Record<string, any>, auth?: string) {
  return fetchWithAuth(path, { method: 'POST', body: payload || {}, auth })
}
  queryPage(payload: Record<string, any>) { return postJson('/api/ucUser/queryPageWithTenantAndOrgRel', payload) }
  queryDetail(payload: Record<string, any>) { return postJson('/api/ucUser/queryDetailWithTenantAndOrgRel', payload) }
  queryDetailByUserId(userId: number) { return getJson('/api/ucUser/queryDetailWithTenantAndOrgRel', { userId }) }
  add(payload: Record<string, any>) { return postJson('/api/ucUser/addWithTenantAndOrgRel', payload) }
  modifyById(payload: Record<string, any>) { return postJson('/api/ucUser/modifyWithTenantAndOrgRelById', payload) }
  enableById(payload: Record<string, any>) { return postJson('/api/ucUser/enableUcUserById', payload) }
  disableById(payload: Record<string, any>) { return postJson('/api/ucUser/disableUcUserById', payload) }
  enableByIdGet(id: number) { return getJson('/api/ucUser/enableUcUserById', { id }) }
  disableByIdGet(id: number) { return getJson('/api/ucUser/disableUcUserById', { id }) }
  add(payload: Record<string, any>, auth?: string) { return postJson('/api/users', payload, auth) }
  modifyById(userId: string, payload: Record<string, any>, auth?: string) { return putJson(`/api/users/${userId}`, payload, auth) }
  enableById(payload: Record<string, any>, auth?: string) { return postJson(`/api/users/${payload.id}/enable`, {}, auth) }
  disableById(payload: Record<string, any>, auth?: string) { return postJson(`/api/users/${payload.id}/disable`, {}, auth) }
  enableByIdGet(userId: string, auth?: string) { return postJson(`/api/users/${userId}/enable`, {}, auth) }
  disableByIdGet(userId: string, auth?: string) { return postJson(`/api/users/${userId}/disable`, {}, auth) }
  resetPassword(payload: Record<string, any>, userId: string, auth?: string) { return postJson(`/api/users/${userId}/reset-password`, payload, auth) }
}
