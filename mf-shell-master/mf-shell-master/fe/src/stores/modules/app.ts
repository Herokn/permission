import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({ theme: 'light' as string, locale: 'zh-CN' as string }),
  actions: {
    setTheme(name: string) { this.theme = name },
    setLocale(v: string) { this.locale = v },
  },
})
