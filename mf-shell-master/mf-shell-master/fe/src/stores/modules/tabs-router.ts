import { defineStore } from 'pinia';
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { store } from '@/stores';

interface TRouter {
  path: string;
  routeIdx: number;
  title?: string;
  name?: string;
  isAlive?: boolean;
  isHome?: boolean;
  meta?: any;
  query?: any;
}

interface TTabRouterState {
  tabRouters: TRouter[];
  isRefreshing: boolean;
}

export const useTabsRouterStore = defineStore('tabsRouter', {
  state: (): TTabRouterState => ({
    tabRouters: [],
    isRefreshing: false,
  }),
  getters: {
    tabRoutersList: (state) => state.tabRouters,
  },
  actions: {
    toggleTabRouterAlive(routeIdx: number) {
      this.isRefreshing = !this.isRefreshing;
      this.tabRouters[routeIdx].isAlive = !this.tabRouters[routeIdx].isAlive;
    },
    appendTabRouterList(newRoute: TRouter) {
      const needAlive = !newRoute.meta?.noKeepAlive;
      if (!this.tabRouters.find((route) => route.path === newRoute.path)) {
        // eslint-disable-next-line no-param-reassign
        this.tabRouters.push({ ...newRoute, isAlive: needAlive });
      }
    },
    subtractCurrentTabRouter(newRoute: TRouter) {
      const { routeIdx } = newRoute;
      this.tabRouters = this.tabRouters.slice(0, routeIdx).concat(this.tabRouters.slice(routeIdx + 1));
    },
    subtractTabRouterBehind(newRoute: TRouter) {
      const { routeIdx } = newRoute;
      this.tabRouters = this.tabRouters.slice(0, routeIdx + 1);
    },
    subtractTabRouterAhead(newRoute: TRouter) {
      const { routeIdx } = newRoute;
      this.tabRouters = this.tabRouters.slice(routeIdx);
    },
    subtractTabRouterOther(newRoute: TRouter) {
      const { routeIdx } = newRoute;
      this.tabRouters = [this.tabRouters[routeIdx]];
    },
    removeTabRouterList() {
      this.tabRouters = [];
    },
    initTabRouterList(newRoutes: TRouter[]) {
      this.tabRouters = newRoutes;
    },
  },
  persist: {
    key: 'tabsRouter',
    paths: ['tabRouters'],
  },
});

export function getTabsRouterStore() {
  return useTabsRouterStore(store);
}
