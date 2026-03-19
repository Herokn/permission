export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function toQueryString(obj: Record<string, any>): string {
  const params = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
  return params.length ? `?${params.join('&')}` : ''
}

export function safeJson<T = any>(value: any): T | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}
