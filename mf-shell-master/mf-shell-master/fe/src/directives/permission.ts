import type { App, DirectiveBinding } from 'vue';
import { usePermissionStore } from '@/stores/modules/permission';
import { getButtonPermissionStore } from '@/stores/modules/button-permission';

/**
 * 新的权限指令实现 - 基于统一的权限管理
 */
function checkPermissionFromStore(codes: string[], needAll = false): boolean {
  if (codes.length === 0) return false;
  
  const permissionStore = usePermissionStore();
  const buttons = permissionStore.buttonPermissions;
  
  if (needAll) {
    return codes.every(code => buttons.includes(code.toLowerCase()));
  }
  return codes.some(code => buttons.includes(code.toLowerCase()));
}

function normalizeCodes(binding: DirectiveBinding): string[] {
  const list: string[] = [];
  const { value, arg, modifiers } = binding;
  // 从值中提取（字符串或数组）
  if (value != null && value !== '') {
    if (Array.isArray(value)) list.push(...value.map((v) => String(v).toLowerCase()));
    else list.push(String(value).toLowerCase());
  }
  // 从静态参数中提取：v-permission:code
  if (typeof arg === 'string' && arg) list.push(arg.toLowerCase());
  // 从修饰符中提取：v-permission.code1.code2（排除 all）
  for (const key of Object.keys(modifiers)) {
    if (key === 'all') continue;
    list.push(key.toLowerCase());
  }
  // 去重
  return Array.from(new Set(list));
}

function applyEffect(el: HTMLElement, allowed: boolean) {
  if (allowed) {
    el.style.display = '';
    return;
  }
  // 未授权：隐藏按钮，不做禁用处理
  el.style.display = 'none';
}

function computeAllowed(
  codes: string[],
  binding: DirectiveBinding,
): boolean {
  const needAll = !!binding.modifiers.all;
  // 默认无权限：未提供任何权限码则视为不允许
  if (codes.length === 0) return false;
  
  // 使用新的统一权限检查
  return checkPermissionFromStore(codes, needAll);
}

async function processPermission(
  el: HTMLElement,
  binding: DirectiveBinding,
  store: ReturnType<typeof getButtonPermissionStore>,
) {
  // 加载期间先隐藏，避免闪烁
  if (!store.loaded) applyEffect(el, false);

  // 每次进入菜单页面时刷新一次最新权限（并且并发复用，避免重复请求）
  await store.refreshOnRouteChange();

  await store.ensureLoaded();
  const codes = normalizeCodes(binding);
  const allowed = computeAllowed(codes, binding);
  applyEffect(el, allowed);
}

export function setupPermissionDirective(app: App) {
  // 缓存 store 引用，避免在每个指令钩子中重复获取
  const store = getButtonPermissionStore();
  app.directive('permission', {
    // 初始化阶段默认隐藏，避免首次渲染闪烁
    beforeMount(el: HTMLElement) {
      applyEffect(el, false);
    },
    async mounted(el: HTMLElement, binding: DirectiveBinding) {
      await processPermission(el, binding, store);
    },
    async updated(el: HTMLElement, binding: DirectiveBinding) {
      await processPermission(el, binding, store);
    },
  });
}
