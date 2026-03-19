import { Injectable } from '@nestjs/common'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function getApiBase() {
  return process.env.SPRING_API_BASE || 'http://localhost:8080'
}

async function postJson(path: string, payload: any) {
  const res = await fetch(`${getApiBase()}${path}`, { method: 'POST', headers: JSON_HEADERS as any, body: JSON.stringify(payload || {}) })
  const data = await res.json()
  return data
}
async function getJson(path: string, params: Record<string, any>) {
  const qs = new URLSearchParams(Object.entries(params || {}).reduce((acc: Record<string, string>, [k, v]) => { acc[k] = String(v); return acc }, {})).toString()
  const url = `${getApiBase()}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { method: 'GET', headers: JSON_HEADERS as any })
  const data = await res.json()
  return data
}

@Injectable()
export class UcUserService {
  queryPage(payload: Record<string, any>) { return postJson('/api/ucUser/queryPageWithTenantAndOrgRel', payload) }
  queryDetail(payload: Record<string, any>) { return postJson('/api/ucUser/queryDetailWithTenantAndOrgRel', payload) }
  queryDetailByUserId(userId: number) { return getJson('/api/ucUser/queryDetailWithTenantAndOrgRel', { userId }) }
  add(payload: Record<string, any>) { return postJson('/api/ucUser/addWithTenantAndOrgRel', payload) }
  modifyById(payload: Record<string, any>) { return postJson('/api/ucUser/modifyWithTenantAndOrgRelById', payload) }
  enableById(payload: Record<string, any>) { return postJson('/api/ucUser/enableUcUserById', payload) }
  disableById(payload: Record<string, any>) { return postJson('/api/ucUser/disableUcUserById', payload) }
  enableByIdGet(id: number) { return getJson('/api/ucUser/enableUcUserById', { id }) }
  disableByIdGet(id: number) { return getJson('/api/ucUser/disableUcUserById', { id }) }
}
