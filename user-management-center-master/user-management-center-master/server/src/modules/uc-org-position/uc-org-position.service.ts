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
  const qs = new URLSearchParams(Object.entries(params || {}).reduce((acc: Record<string, string>, [k, v]) => {
    acc[k] = String(v)
    return acc
  }, {})).toString()
  const url = `${getApiBase()}${path}${qs ? `?${qs}` : ''}`
  const res = await fetch(url, { method: 'GET', headers: JSON_HEADERS as any })
  const data = await res.json()
  return data
}

@Injectable()
export class UcOrgPositionService {
  queryAll(payload: Record<string, any>) { return postJson('/api/ucOrgPosition/queryAllUcOrgPositions', payload) }
  queryByOrgId(payload: Record<string, any>) { return getJson('/api/ucOrgPosition/queryByOrgId', payload) }
}
