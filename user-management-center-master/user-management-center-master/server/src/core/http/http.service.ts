import { Injectable } from '@nestjs/common'
import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

type RequestInitEx = {
  method?: string
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any> | URLSearchParams
  timeout?: number
  responseType?: 'json' | 'text' | 'buffer'
  validateStatus?: (status: number) => boolean
}

@Injectable()
export class HttpService {
  async request<T = any>(url: string, init?: RequestInitEx): Promise<T> {
    const u = new URL(url)
    const params = init && init.params
    if (params) {
      if (params instanceof URLSearchParams) {
        for (const [k, v] of params.entries()) u.searchParams.append(k, v)
      } else if (typeof params === 'object') {
        for (const [k, v] of Object.entries(params)) {
          if (v === undefined || v === null) continue
          if (Array.isArray(v)) {
            for (const item of v) u.searchParams.append(k, String(item))
          } else {
            u.searchParams.set(k, String(v))
          }
        }
      }
    }
    const isHttps = u.protocol === 'https:'
    const client = isHttps ? https : http
    const method = (init && init.method) || 'GET'
    const headers = (init && init.headers) || {}
    const body = init && init.body
    const timeoutMs = init && init.timeout ? Number(init.timeout) : 0
    const responseType = (init && init.responseType) || 'json'
    const validateStatus = (init && init.validateStatus) || ((s: number) => s < 400)
    const options: any = { method, headers }
    return new Promise<T>((resolve, reject) => {
      const req = client.request(u, options, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          if (!validateStatus(res.statusCode || 0)) {
            const err: any = new Error('Request failed')
            err.status = res.statusCode
            err.headers = res.headers
            err.body = buf
            return reject(err)
          }
          if (responseType === 'buffer') return resolve(buf as unknown as T)
          const text = buf.toString('utf-8')
          const ct = (res.headers && (res.headers['content-type'] as string)) || ''
          if (responseType === 'json' || ct.includes('application/json')) {
            try {
              resolve(JSON.parse(text) as T)
            } catch {
              resolve(text as unknown as T)
            }
          } else {
            resolve(text as unknown as T)
          }
        })
      })
      req.on('error', (e) => reject(e))
      if (timeoutMs > 0)
        req.setTimeout(timeoutMs, () => {
          try {
            req.destroy(new Error('Request timeout'))
          } catch {}
        })
      if (body !== undefined && body !== null) {
        if (typeof body === 'string' || Buffer.isBuffer(body) || body instanceof Uint8Array) {
          req.write(body)
        } else if (body instanceof URLSearchParams) {
          const h = options.headers || {}
          if (!h['content-type']) h['content-type'] = 'application/x-www-form-urlencoded'
          req.write(body.toString())
        } else {
          const h = options.headers || {}
          if (!h['content-type']) h['content-type'] = 'application/json'
          req.write(JSON.stringify(body))
        }
      }
      req.end()
    })
  }
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request(url, { method: 'GET', headers })
  }
  async post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const h = Object.assign({ 'content-type': 'application/json' }, headers || {})
    return this.request(url, { method: 'POST', body, headers: h })
  }
  async put<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const h = Object.assign({ 'content-type': 'application/json' }, headers || {})
    return this.request(url, { method: 'PUT', body, headers: h })
  }
  async delete<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const h = Object.assign({ 'content-type': 'application/json' }, headers || {})
    return this.request(url, { method: 'DELETE', body, headers: h })
  }
}
