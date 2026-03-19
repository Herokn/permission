import uniq from 'lodash/uniq';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// import Layout from '@/layouts/index.vue';

const env = import.meta.env.MODE || 'development';

// 导入homepage相关固定路由
// const homepageModules = import.meta.glob('./modules/**/homepage.ts', { eager: true });

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob('./modules/**/!(homepage).ts', { eager: true });
// 其他固定路由
// const defaultModules = import.meta.glob('./default-modules/index.ts', { eager: true });
// export const defaultRouterList: Array<RouteRecordRaw> = mapModuleRouterList(defaultModules);
// 存放固定路由
// export const homepageRouterList: Array<RouteRecordRaw> = mapModuleRouterList(homepageModules);
export const fixedRouterList: Array<RouteRecordRaw> = mapModuleRouterList(fixedModules);

export const allRoutes = [ ...fixedRouterList];

// 根据 meta.fixed 递归 过滤固定路由 跳过权限校验（ 按照原结构返回 ）
export function filterFixedRoutes(routes: Array<RouteRecordRaw>): Array<RouteRecordRaw> {
  const fixedRoutes: Array<RouteRecordRaw> = [];
  routes.forEach((item) => {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const filteredChildren = hasChildren ? filterFixedRoutes(item.children!) : [];

    // 只要自身是固定路由，或其子路由中存在固定项，就收录该路由
    const isFixed = Boolean(item.meta && (item.meta as any).fixed);
    if (isFixed || filteredChildren.length > 0) {
      // 使用浅拷贝并替换children为过滤后的结果，避免重复push和未过滤子路由泄漏
      const route: RouteRecordRaw = { ...item, children: filteredChildren };
      fixedRoutes.push(route);
    }
  });
  return fixedRoutes;
}
export const fixedRoutesList = filterFixedRoutes(allRoutes);

// 合并相同 路径的路由
export function mergeSamePathRoutes(
  routes: Array<RouteRecordRaw>,
  fixedRoutes: Array<RouteRecordRaw>,
): Array<RouteRecordRaw> {
  const mergedRoutes: Array<RouteRecordRaw> = [];
  const fixedRoutesKeys = fixedRoutes.map((item) => item.path);
  routes.forEach((item) => {
    const index = fixedRoutesKeys.findIndex((path) => path === item.path);
    if (index > -1) {
      item.children = [...(item.children || []), ...(fixedRoutes[index].children || [])];
    }
    mergedRoutes.push(item);
  });
  return mergedRoutes;
}

// 固定路由模块转换为路由
export function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-ignore
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

export const getRoutesExpanded = () => {
  const expandedRoutes: Array<string> = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3): string => {
  const route = router.currentRoute.value;
  if (!route?.path) {
    return '';
  }
  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('');
};

const createRouterInstance = (base: string) => createRouter({
  history: createWebHistory(base),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export let router = createRouterInstance(env === 'site' ? '/starter/vue-next/' : import.meta.env.VITE_BASE_URL);

export function initRouter(base: string) {
  router = createRouterInstance(base);
  return router;
}

export default router;
