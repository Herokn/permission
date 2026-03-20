import path from 'node:path'
import { format } from 'date-fns'
import { resolve } from 'path'
import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import pxtorem from 'postcss-pxtorem'
import { OUTPUT_DIR } from './build/constant'
import { wrapperEnv } from './build/utils'
import { createVitePlugins } from './build/vite/plugin/index.ts'
import { createProxy } from './build/vite/proxy'
import pkg from './package.json'

const { dependencies, devDependencies, name, version } = pkg as any
const CWD = process.cwd()
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
}
function pathResolve(dir: string) {
  return resolve(CWD, '.', dir)
}

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, CWD)
  // Explicitly log the raw env value from loadEnv
  console.log('Raw loadEnv VITE_BASE_URL:', env.VITE_BASE_URL)

  const viteEnv = wrapperEnv(env)
  const isBuild = command === 'build'
  const isLib = process.env.LIB_BUILD === '1'

  // Use VITE_BASE_URL from environment variables
  const baseUrl = (viteEnv as any).VITE_BASE_URL || '/'

  console.log('Loaded VITE_BASE_URL:', (viteEnv as any).VITE_BASE_URL)
  console.log('Using baseUrl:', baseUrl)
  const port = (viteEnv as any).VITE_PORT || Number(process.env.PORT || 3030)
  const useProxy =
    mode === 'mock' || Boolean((viteEnv as any).VITE_IS_REQUEST_PROXY)
  const serverProxy = useProxy
    ? createProxy((viteEnv as any).VITE_PROXY || [])
    : {}
  const prodMock = (viteEnv as any).VITE_GLOB_PROD_MOCK
  const baseConfig: UserConfig = {
    base: baseUrl,
    esbuild: {},
    resolve: {
      alias: [{ find: '@', replacement: `${pathResolve('src')}/` }],
      dedupe: ['vue'],
    },
    css: {
      preprocessorOptions: { less: { javascriptEnabled: true } },
      postcss: {
        plugins: [
          // 禁用 pxtorem，因为我们只在移动端使用 rem，通过 main.ts 动态设置根字体大小
          // pxtorem({
          //   rootValue: 16,
          //   unitPrecision: 5,
          //   propList: ['*'],
          //   selectorBlackList: [],
          //   replace: true,
          //   mediaQuery: false,
          //   minPixelValue: 2,
          //   exclude: /node_modules/i,
          // }),
        ],
      },
    },
    plugins: createVitePlugins(viteEnv, isBuild, prodMock),
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    },
    server: {
      hmr: true,
      host: '0.0.0.0',
      port,
      watch: { usePolling: true },
      proxy: serverProxy,
      strictPort: false,
      cors: true,
      origin: `http://localhost:${port}`,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    optimizeDeps: { include: [], exclude: ['vue-demi'] },
    // 实验性功能：渲染构建时的预加载标签
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          // 直接将 VITE_BASE_URL 的值注入到构建产物中，而不是依赖 window 变量
          return { runtime: JSON.stringify(path.posix.join(baseUrl, filename)) }
        }
        return { relative: true }
      },
    },
    build: {
      target: 'es2015',
      cssTarget: 'chrome80',
      outDir: OUTPUT_DIR,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      // 确保动态导入的文件路径包含 base URL
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  }
  if (!isLib) return baseConfig
  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      lib: {
        entry: path.resolve(__dirname, 'src/common/index.ts'),
        name: 'BasicCommon',
        formats: ['es', 'umd'],
        fileName: 'common',
      },
      rollupOptions: {
        external: ['vue', 'axios', 'tdesign-vue-next'],
        output: {
          globals: {
            vue: 'Vue',
            axios: 'axios',
            'tdesign-vue-next': 'TDesign',
          },
        },
      },
    },
  }
})
