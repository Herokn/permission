import { createApp, type App as VueApp } from 'vue'
import App from './App.vue'
import 'tdesign-vue-next/es/style/index.css'
import './styles/index.less'
import 'uno.css'
import { router, initRouter } from './router'
import { store } from './stores'
import { i18n } from './locales'
import { setupPermissionDebugger } from './utils/permission-debugger'
import { setupSubAppMessageHandler } from './utils/sub-app-navigator'
import { usePermissionStore, useUserStore } from './stores'

// 移动端 rem 适配（仅在 VITE_IS_MOBILE 为 true 时启用）
const isMobile =
  import.meta.env.VITE_IS_MOBILE === 'true' ||
  import.meta.env.VITE_IS_MOBILE === true

if (isMobile) {
  function updateRem() {
    const w = window.innerWidth || document.documentElement.clientWidth
    // PC端和iPad端（宽度 >= 768px）不需要rem适配
    if (w >= 768) {
      document.documentElement.style.fontSize = '16px'
      return
    }
    const min = 320
    const max = 768
    const cw = Math.min(Math.max(w, min), max)
    const fs = 16 * (cw / 375)
    document.documentElement.style.fontSize = `${fs}px`
  }
  updateRem()
  window.addEventListener('resize', updateRem)
}

let app: VueApp | null = null

// 渲染函数
async function render(props: any = {}) {
  const { container, basename } = props
  app = createApp(App)

  // 初始化路由，如果有 basename（作为子应用运行），则使用它
  // 如果是独立运行，basename 为 undefined，initRouter 会使用默认 base
  const appRouter = basename ? initRouter(basename) : router

  app.use(appRouter)
  app.use(store)
  app.use(i18n)

  // 设置路由守卫：检查token
  appRouter.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 白名单：不需要登录的页面
    const whiteList = ['/login']

    if (whiteList.includes(to.path)) {
      // 如果是登录页且已有token，直接跳转到dashboard
      if (to.path === '/login' && userStore.token) {
        next('/dashboard')
      } else {
        next()
      }
    } else {
      // 需要登录的页面，检查token
      if (userStore.token) {
        next()
      } else {
        // 没有token，跳转到登录页
        next('/login')
      }
    }
  })

  const root = container ? container.querySelector('#app') : '#app'
  app.mount(root)

  // 开发环境下启用权限调试工具
  if (import.meta.env.DEV) {
    setupPermissionDebugger()
  }

  // 设置子应用消息处理器（用于老系统兼容）
  const permissionStore = usePermissionStore()
  setupSubAppMessageHandler(appRouter, permissionStore)

  // 暴露路由实例给 Garfish
  ;(window as any).__MAIN_ROUTER__ = appRouter
}

// 销毁函数
function destroy() {
  if (app) {
    app.unmount()
    app = null
  }
}

// 判断是否在 Garfish 环境下运行
// 如果不在 Garfish 环境下（独立运行），立即渲染
if (!window.__GARFISH__) {
  render()
}

// 导出 Garfish 子应用生命周期
export function provider() {
  return {
    render,
    destroy,
  }
}
