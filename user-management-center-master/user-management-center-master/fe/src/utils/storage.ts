export const storage = {
  get(key: string) {
    if (typeof localStorage === 'undefined') return ''
    return localStorage.getItem(key) || ''
  },
  set(key: string, value: string) {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, value)
  },
  remove(key: string) {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(key)
  },
}
