import cloneDeep from 'lodash/cloneDeep';
import { defineComponent, h, shallowRef } from 'vue';

import type { RouteItem } from '@/api/model/permissionModel';
import type { RouteMeta } from '@/types/interface';
import {
  BLANK_LAYOUT,
  EXCEPTION_COMPONENT,
  IFRAME,
  LAYOUT,
  PAGE_NOT_FOUND_ROUTE,
  PARENT_LAYOUT,
} from '@/utils/route/constant';
import { getENVDomainURLByPath } from '@/utils/utils';

// vite 3+ support dynamic import from node_modules
const iconsPath = import.meta.glob('../../../node_modules/tdesign-icons-vue-next/esm/components/*.js');
// 本地静态资源（SVG 与图片）动态导入为 URL（vite 会返回打包后的可访问地址）
const localSvgAssets = import.meta.glob('../../assets/**/*.svg', { as: 'url' });
const localImageAssets = import.meta.glob('../../assets/**/*.{png,jpg,jpeg,gif,webp}', { as: 'url' });

const LayoutMap = new Map<string, () => Promise<typeof import('*.vue')>>();

LayoutMap.set('LAYOUT', LAYOUT);
LayoutMap.set('BLANK', BLANK_LAYOUT);
LayoutMap.set('IFRAME', IFRAME);

let dynamicViewsModules: Record<string, () => Promise<Recordable>>;

// 动态从多来源解析菜单图标
async function getMenuIcon(iconName: string | { type?: string; value?: string }) {
  if (!iconName) return shallowRef(null);

  // 统一解析入参，支持 'svg:xxx.svg' / 'img:xxx.png' / 'iconfont:icon-xxx'
  const iconSpec = typeof iconName === 'string' ? parseIconSpec(iconName) : iconName;
  const value = (iconSpec?.value || '').trim();
  const type = (iconSpec?.type || '').trim();

  // 1) 优先使用 tdesign-icons-vue-next
  if (value) {
    const tdKey = `../../../node_modules/tdesign-icons-vue-next/esm/components/${value}.js`;
    const tdImporter = iconsPath[tdKey];
    if (tdImporter) {
      const mod: any = await tdImporter();
      return shallowRef(mod.default);
    }
  }

  // 2) iconfont（阿里云字体图标），形如 'iconfont:icon-camera' 或直接传 'icon-camera'
  if (type === 'iconfont' || /^icon-[a-z0-9_-]+$/i.test(value)) {
    const cls = value.startsWith('icon-') ? value : `icon-${value}`;
    const comp = defineComponent({
      name: 'RouteIconfont',
      setup() {
        return () =>
          h('i', {
            class: `iconfont-wbsmart  ${cls}`,
            style: { fontSize: '18px', lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' },
          });
      },
    });
    return shallowRef(comp);
  }

  // 3) 本地 SVG（优先匹配 basename），或 4) 图片（本地/远程）
  if (type === 'svg' || value.endsWith('.svg')) {
    const url = await resolveAssetUrl(localSvgAssets, value);
    if (url) return shallowRef(makeImgComponent(url, value));
    // 如果是绝对路径或远程地址，直接使用
    if (isPathOrUrl(value)) return shallowRef(makeImgComponent(value, value));
  }

  if (type === 'img' || /\.(png|jpg|jpeg|gif|webp)$/i.test(value)) {
    const url = await resolveAssetUrl(localImageAssets, value);
    if (url) return shallowRef(makeImgComponent(url, value));
    if (isPathOrUrl(value)) return shallowRef(makeImgComponent(value, value));
  }

  console.warn(`Icon not found or unsupported: ${JSON.stringify(iconName)}`);
  return shallowRef(null);
}

function parseIconSpec(raw: string): { type?: string; value: string } {
  const s = raw.trim();
  const m = s.match(/^([a-z]+):(.*)$/i);
  if (!m) return { value: s };
  return { type: m[1].toLowerCase(), value: m[2].trim() };
}

function isPathOrUrl(s: string): boolean {
  return /^(https?:)?\/\//i.test(s) || s.startsWith('/') || s.startsWith('./') || s.startsWith('../');
}

async function resolveAssetUrl(
  glob: Record<string, () => Promise<string>>,
  nameOrPath: string,
): Promise<string | null> {
  // 优先按完整 key 查找
  if (glob[nameOrPath]) return glob[nameOrPath]();
  // 退化：仅用 basename 匹配（避免用户只传文件名）
  const base = basename(nameOrPath);
  const entry = Object.keys(glob).find((k) => k.endsWith(`/${base}`));
  if (entry) return glob[entry]();
  return null;
}

function basename(p: string): string {
  const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
  return i >= 0 ? p.slice(i + 1) : p;
}

function makeImgComponent(src: string, alt: string) {
  return defineComponent({
    name: 'RouteIconImage',
    setup() {
      return () => h('img', { src, alt, style: { width: '1em', height: '1em', objectFit: 'contain' } });
    },
  });
}

// 动态引入路由组件
function asyncImportRoute(routes: RouteItem[] | undefined) {
  dynamicViewsModules = dynamicViewsModules || import.meta.glob('../../pages/**/*.vue');
  if (!routes) return;

  routes.forEach(async (item) => {
    const { component, name } = item;
    const { children } = item;

    if (component) {
      const layoutFound = LayoutMap.get(component.toUpperCase());
      if (layoutFound) {
        item.component = layoutFound;
      } else if (item.meta?.frameSrc) {
        item.component = LayoutMap.get(item.component.toUpperCase());
        const p = item.meta.frameSrc || '';
        const hasProto = /^https?:\/\//i.test(p);
        item.meta.frameSrc = hasProto ? p : getENVDomainURLByPath(p);
        item.meta.framePreload = false;
      } else {
        item.component = dynamicImport(dynamicViewsModules, component);
      }
    } else if (name) {
      item.component = PARENT_LAYOUT();
    }
    if (item.meta.icon) {
      (item.meta as any).icon = await getMenuIcon(item.meta.icon as any);
    } else {
      (item.meta as any).icon = null;
    }
    // console.log(item, 'item');

    // eslint-disable-next-line no-unused-expressions
    children && asyncImportRoute(children);
  });
}

function dynamicImport(dynamicViewsModules: Record<string, () => Promise<Recordable>>, component: string) {
  const keys = Object.keys(dynamicViewsModules);
  const matchKeys = keys.filter((key) => {
    const k = key.replace('../../pages', '');
    const startFlag = component.startsWith('/');
    const endFlag = component.endsWith('.vue') || component.endsWith('.tsx');
    const startIndex = startFlag ? 0 : 1;
    const lastIndex = endFlag ? k.length : k.lastIndexOf('.');
    return k.substring(startIndex, lastIndex) === component;
  });
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0];
    return dynamicViewsModules[matchKey];
  }
  if (matchKeys?.length > 1) {
    throw new Error(
      'Please do not create `.vue` and `.TSX` files with the same file name in the same hierarchical directory under the views folder. This will cause dynamic introduction failure',
    );
  } else {
    console.warn(`Can't find ${component} in pages folder`);
  }
  return EXCEPTION_COMPONENT;
}

// 将背景对象变成路由对象
export function transformObjectToRoute<T = RouteItem>(routeList: RouteItem[]): T[] {
  routeList.forEach(async (route) => {
    const component = route.component as string;

    if (component) {
      if (component.toUpperCase() === 'LAYOUT') {
        route.component = LayoutMap.get(component.toUpperCase());
      } else {
        route.children = [cloneDeep(route)];
        // route.component = LAYOUT;

        // route.path = '';

        route.meta = (route.meta || {}) as RouteMeta;
      }
      // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
      route.path = route.path.replace('//', '/');
    } else {
      throw new Error('component is undefined');
    }
    if (route.children && route.children.length > 0) {
      // 如果未定义 redirect 默认第一个子路由为 redirect
      !route.redirect && (route.redirect = route.children[0].path);
      route.children && asyncImportRoute(route.children);
    }
    // eslint-disable-next-line no-unused-expressions
    if (route.meta.icon) (route.meta as any).icon = await getMenuIcon(route.meta.icon as any);
  });

  return [PAGE_NOT_FOUND_ROUTE, ...routeList] as unknown as T[];
}
