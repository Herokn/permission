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
}

  queryAll(payload: Record<string, any>) { return postJson('/api/ucOrg/queryAllUcOrgs', payload) }
  queryAll(payload: Record<string, any>, auth?: string) { return getJson('/organizations/tree', {}, auth) }
  queryTree(status?: number, auth?: string) { return getJson('/organizations/tree', status !== undefined ? { status } : {}, auth) }
  queryDetail(orgId: number, auth?: string) { return getJson(`/organizations/${orgId}`, {}, auth) }
  add(payload: Record<string, any>, auth?: string) { return postJson('/organizations', payload, auth) }
  modify(orgId: number, payload: Record<string, any>, auth?: string) { return putJson(`/organizations/${orgId}`, payload, auth) }
  configPositions(orgId: number, positionIds: number[], auth?: string) { return postJson(`/organizations/${orgId}/positions`, positionIds, auth) }
}
