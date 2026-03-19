// 微前端配置
export const mfeConfig = {
  // 是否开启微前端主应用模式
  isMainApp: import.meta.env.VITE_APP_TYPE === 'main',
  
  // 子应用列表（开发环境和生产环境可配置不同地址）
  apps: [
    {
      name: 'sub-app-demo', // 子应用唯一标识
      entry: import.meta.env.VITE_SUB_APP_DEMO_URL || 'http://localhost:3031', // 子应用入口
      activeWhen: '/sub-app-demo', // 激活路由
      sandbox: {
        snapshot: false,
        fixStaticResources: true,
      },
    },
    // 可在此处继续添加其他子应用
  ],
}
