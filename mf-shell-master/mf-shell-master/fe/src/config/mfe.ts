// 微前端配置
export const mfeConfig = {
  // 是否开启微前端主应用模式
  isMainApp: import.meta.env.VITE_APP_TYPE === 'main',
  // basename: '/',
  disablePreloadApp: true,
  // 子应用列表（开发环境和生产环境可配置不同地址）
  apps: [
    {
      name: 'user-management', // 子应用唯一标识
      entry: 'http://localhost:3042/', // 子应用入口
      activeWhen: '/users', // 激活路径，与路由配置一致
      domGetter: '#sub-app-container', // 挂载节点
      sandbox: {
        snapshot: false,
        fixStaticResources: true,
      },
    },
  ],
   beforeLoad(appInfo) {
      console.log('子应用开始加载', appInfo.name);
    },
    afterLoad(appInfo) {
      console.log('子应用加载完成', appInfo.name);
    },
}
