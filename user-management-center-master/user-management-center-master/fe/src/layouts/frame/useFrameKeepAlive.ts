import uniqBy from 'lodash/uniqBy';
import { computed, toRaw, unref } from 'vue';
import { useRouter } from 'vue-router';

import { useSettingStore, useTabsRouterStore } from '@/stores';
import type { MenuRoute } from '@/types/interface';

export function useFrameKeepAlive() {
  const router = useRouter();
  const { currentRoute } = router;
  const { isUseTabsRouter } = useSettingStore();
  const tabStore = useTabsRouterStore();
  const getFramePages = computed(() => {
    const ret = getAllFramePages(toRaw(router.getRoutes()) as unknown as MenuRoute[]) || [];
    return ret;
  });
  console.log('getFramePages', getFramePages.value);

  const getOpenTabList = computed((): string[] => {
    // console.log(tabStore.tabRouters, 'tabStore.tabRouters');
    return tabStore.tabRouters.reduce((prev: string[], next) => {
      if (next.meta && Reflect.has(next.meta, 'frameSrc')) {
        prev.push(next.name as string);
      }
      return prev;
    }, []);
  });

  function getAllFramePages(routes: MenuRoute[]): MenuRoute[] {
    let res: MenuRoute[] = [];
    for (const route of routes) {
      const { meta: { frameSrc, frameBlank } = {}, children } = route;
      if (frameSrc && !frameBlank) {
        res.push(route);
      }
      if (children && children.length) {
        res.push(...getAllFramePages(children));
      }
    }
    res = uniqBy(res, 'name');
    return res;
  }

  function showIframe(item: MenuRoute) {
    return item.name === unref(currentRoute).name;
  }

  function hasRenderFrame(name: string) {
    if (!unref(isUseTabsRouter)) {
      return router.currentRoute.value.name === name;
    }
    // console.log(
    //   unref(getOpenTabList),
    //   unref(getOpenTabList).includes(name),
    //   name,
    //   'unref(getOpenTabList).includes(name)',
    // );
    return unref(getOpenTabList).includes(name);
  }

  return { hasRenderFrame, getFramePages, showIframe, getAllFramePages };
}
