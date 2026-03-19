import type { AxiosInstance } from 'axios'

export function useRequest(ins: AxiosInstance) {
  const get = (url: string, params?: any) => ins.get(url, { params })
  const post = (url: string, data?: any) => ins.post(url, data)
  return { get, post }
}
