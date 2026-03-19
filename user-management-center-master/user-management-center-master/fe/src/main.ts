import { useMediaQuery } from '@vueuse/core'
import 'tdesign-vue-next/es/style/index.css'
import 'uno.css'
import { createApp, type App as VueApp } from 'vue'
import App from './App.vue'
import { mfeConfig } from './config/mfe'
import { i18n } from './locales'
import garfish from './mfe/garfish'
import { initRouter, router } from './router'
import { store } from './stores'
import './styles/index.less'

// 使用 VueUse 检测移动设备
const isMobile = useMediaQuery(
  '(max-width: 768px) and (hover: none) and (pointer: coarse)'
)

function updateRem() {
  // 只在移动设备上使用rem布局
  if (!isMobile.value) {
    document.documentElement.style.fontSize = '16px'
    return
  }

  // 移动端：进行动态rem缩放
  const w = window.innerWidth || document.documentElement.clientWidth
  const min = 320
  const max = 768
  const cw = Math.min(Math.max(w, min), max)
  const fs = 16 * (cw / 375)
  document.documentElement.style.fontSize = `${fs}px`
}

updateRem()
window.addEventListener('resize', updateRem)

let app: VueApp | null = null

// 渲染函数
async function render(props: any = {}) {
  const { container, basename } = props
  app = createApp(App)

  // 如果是主应用模式，初始化 Garfish
  if (mfeConfig.isMainApp) {
    // 注册子应用
    garfish.run(mfeConfig.apps)
  }

  // 初始化路由，如果有 basename（作为子应用运行），则使用它
  // 如果是独立运行，basename 为 undefined，initRouter 会使用默认 base
  const appRouter = basename ? initRouter(basename) : router

  app.use(appRouter)
  app.use(store)
  app.use(i18n)

  const root = container ? container.querySelector('#app') : '#app'
  app.mount(root)
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
export const provider = () => {
  return {
    render,
    destroy,
  }
}

if (typeof window !== 'undefined' && window.__GARFISH__) {
  ;(window as any).provider = provider
}
