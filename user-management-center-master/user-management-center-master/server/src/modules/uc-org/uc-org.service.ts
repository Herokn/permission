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

@Injectable()
export class UcOrgService {
  queryAll(payload: Record<string, any>) { return postJson('/api/ucOrg/queryAllUcOrgs', payload) }
}

