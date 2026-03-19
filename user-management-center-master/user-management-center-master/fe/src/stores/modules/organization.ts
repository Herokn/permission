import { defineStore } from 'pinia'
import { getOrgTree_Api } from '@/api/modules/org'

export const useOrgStore = defineStore('organization', {
  state: () => ({
    orgTreeList: [] as any[],
    isLoaded: false,
  }),
  getters: {
    getOrgTreeList: (state) => state.orgTreeList,
  },
  actions: {
    async setOrgTreeList(usecache: boolean = false) {
      if (this.isLoaded) return
      this.isLoaded = true
      try {
        if (usecache === false || this.orgTreeList.length === 0) {
          const res = await getOrgTree_Api()
          this.orgTreeList = res || []
        }
      } catch (err) {
        console.error('Failed to load org tree:', err)
      } finally {
        this.isLoaded = false
      }
    },
  },
})
