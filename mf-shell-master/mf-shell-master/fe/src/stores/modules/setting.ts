import { defineStore } from 'pinia';
import STYLE_CONFIG from '@/config/style';
import { store } from '@/stores';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    ...STYLE_CONFIG,
    showSettingPanel: false,
    colorList: {
      '#2962F6': '#2962F6',
    },
    chartColors: {
      '#2962F6': ['#2962F6'],
    },
    menuAutoCollapsed: false,
  }),
  getters: {
    showSidebar: (state) => state.layout !== 'top',
    showSidebarLogo: (state) => state.layout === 'side',
    showHeaderLogo: (state) => state.layout !== 'side',
    displayMode: (state) => {
      if (state.mode === 'auto') {
        const media = window.matchMedia('(prefers-color-scheme:dark)');
        if (media.matches) {
          return 'dark';
        }
        return 'light';
      }
      return state.mode;
    },
  },
  actions: {
    updateConfig(payload: Partial<typeof STYLE_CONFIG>) {
      for (const key in payload) {
        if (payload[key as keyof typeof STYLE_CONFIG] !== undefined) {
          // @ts-ignore
          this[key] = payload[key as keyof typeof STYLE_CONFIG];
        }
      }
    },
    changeMode(mode: 'dark' | 'light' | 'auto') {
      this.mode = mode;
    },
  },
  persist: {
    key: 'setting',
    paths: ['mode', 'layout', 'isSidebarCompact', 'splitMenu', 'isSidebarFixed', 'isHeaderFixed', 'showHeader', 'showFooter', 'isUseTabsRouter', 'brandTheme', 'menuAutoCollapsed'],
  },
});

export function getSettingStore() {
  return useSettingStore(store);
}
