module.exports = {
  apps: [
    {
      name: 'mf-shell-server',
      cwd: './server',
      script: 'dist/main.js',
      instances: 1, // 设置为 1 限制只启动一个应用实例
      // exec_mode: 'cluster', // 单实例模式通常不需要 cluster，除非为了零停机重载
      autorestart: true,
      max_memory_restart: '1G',
      time: true, // 开启日志时间戳
      env: {
        NODE_ENV: 'production',
        PORT: '4130',
        // 1 = 纯后端模式（不托管前端静态资源）
        // 0 = 全栈模式（托管前端静态资源，需确保 ../fe/dist 存在）
        DISABLE_FE_STATIC: '1',
      },
      env_test: {
        NODE_ENV: 'test',
        PORT: '5130',
        DISABLE_FE_STATIC: '0',
      },
      env_prod: {
        NODE_ENV: 'production',
        PORT: '6130',
        DISABLE_FE_STATIC: '0',
      },
    },
    // 前端由 Nginx 或 S3 托管，生产环境不建议用 PM2 跑 vite preview
  ],
}
