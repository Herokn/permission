// vite.config.ts
import path from "node:path";
import { format } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/fe/node_modules/date-fns/index.js";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/vite/dist/node/index.js";

// build/constant.ts
var GLOB_CONFIG_FILE_NAME = "assets/app.config.js";
var OUTPUT_DIR = "dist";

// build/utils.ts
import dotenv from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/dotenv/lib/main.js";
function wrapperEnv(envConf) {
  const ret = {};
  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;
    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    if (envName === "VITE_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {
      }
    }
    if (envName === "VITE_SERVER_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {
      }
    }
    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}

// build/vite/plugin/index.ts
import vue from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import UnoCSS from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/unplugin-auto-import/dist/vite.js";
import { TDesignResolver } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/unplugin-vue-components/dist/resolvers.js";
import Components from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/unplugin-vue-components/dist/vite.js";
import svgLoader from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/vite-svg-loader/index.js";

// build/vite/plugin/compress.ts
import compressPlugin from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/vite-plugin-compression/dist/index.mjs";
function configCompressPlugin(compress, deleteOriginFile = false) {
  console.log(compress, "compress");
  const compressList = compress.split(",");
  const plugins = [];
  if (compressList.includes("gzip")) {
    plugins.push(
      compressPlugin({
        ext: ".gz",
        deleteOriginFile
      })
    );
  }
  if (compressList.includes("brotli")) {
    plugins.push(
      compressPlugin({
        ext: ".br",
        algorithm: "brotliCompress",
        deleteOriginFile
      })
    );
  }
  return plugins;
}

// build/vite/plugin/html.ts
import { createHtmlPlugin } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/vite-plugin-html/dist/index.mjs";

// package.json
var package_default = {
  name: "@wb/user-magagement-center-fe",
  version: "0.1.0",
  private: true,
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build --mode ${MODE:-production} && tsx build/script/postBuild.ts",
    "build:clean": "rm -rf dist node_modules/.vite && pnpm run build",
    "build:lib": "LIB_BUILD=1 vite build",
    preview: "vite preview",
    typecheck: "vue-tsc --noEmit",
    lint: "eslint --ext .ts,.vue src",
    format: 'prettier --write "src/**/*.{ts,vue,css}"'
  },
  dependencies: {
    "@garfish/browser-snapshot": "^1.19.7",
    "@garfish/browser-vm": "^1.19.7",
    "@garfish/core": "^1.19.7",
    "@garfish/router": "^1.19.7",
    "@vueuse/core": "^14.1.0",
    "@wb/shared": "workspace:*",
    axios: "^1.7.7",
    dayjs: "^1.11.10",
    moment: "^2.30.1",
    pinia: "^2.2.7",
    "pinia-plugin-persistedstate": "^3.2.3",
    "tdesign-icons-vue-next": "^0.4.1",
    "tdesign-vue-next": "^1.17.6",
    vue: "^3.5.0",
    "vue-i18n": "^9.14.2",
    "vue-router": "^4.4.5"
  },
  devDependencies: {
    "@types/lodash": "^4.14.202",
    "@types/moment": "^2.13.0",
    "@types/qs": "^6.14.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "@vitejs/plugin-vue-jsx": "^4.1.0",
    "date-fns": "^4.1.0",
    "eslint-plugin-vue": "^9.28.0",
    less: "^4.4.2",
    lodash: "^4.17.21",
    mockjs: "^1.1.0",
    postcss: "^8.4.0",
    "postcss-pxtorem": "^6.1.0",
    qs: "^6.14.0",
    unocss: "^0.64.0",
    "unplugin-auto-import": "^0.17.6",
    "unplugin-vue-components": "^0.26.0",
    vite: "^5.4.0",
    "vite-plugin-compression": "^0.5.1",
    "vite-plugin-html": "^3.2.0",
    "vite-plugin-mock": "^2.9.8",
    "vite-svg-loader": "^5.1.0",
    "vue-tsc": "^2.1.6"
  }
};

// build/vite/plugin/html.ts
function configHtmlPlugin(env, isBuild) {
  const { VITE_GLOB_APP_TITLE, VITE_BASE_URL } = env;
  const path2 = VITE_BASE_URL.endsWith("/") ? VITE_BASE_URL : `${VITE_BASE_URL}/`;
  const getAppConfigSrc = () => {
    return `${path2}${GLOB_CONFIG_FILE_NAME}?v=${package_default.version}-${(/* @__PURE__ */ new Date()).getTime()}`;
  };
  const htmlPlugin = createHtmlPlugin({
    minify: isBuild,
    inject: {
      // Inject data into ejs template
      data: {
        title: VITE_GLOB_APP_TITLE
      },
      // Embed the generated app.config.js file
      tags: isBuild ? [
        {
          tag: "script",
          attrs: {
            src: getAppConfigSrc()
          },
          injectTo: "head"
        }
      ] : []
    }
  });
  return htmlPlugin;
}

// build/vite/plugin/mock.ts
import { viteMockServe } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/node_modules/vite-plugin-mock/dist/index.js";
function configMockPlugin(isBuild, prodMock) {
  return viteMockServe({
    ignore: /^\_/,
    mockPath: "mock",
    localEnabled: !isBuild,
    prodEnabled: isBuild && prodMock,
    injectCode: `
       import { setupProdMockServer } from '../mock/_createProductionServer';
 
       setupProdMockServer();
       `
  });
}

// build/vite/plugin/index.ts
function createVitePlugins(viteEnv, isBuild, prodMock) {
  const {
    VITE_USE_MOCK,
    VITE_BUILD_COMPRESS,
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
  } = viteEnv;
  const vitePlugins = [
    // have to
    vue(),
    // have to
    vueJsx(),
    svgLoader(),
    UnoCSS(),
    // UnoCSS({
    //   hmrTopLevelAwait: false,
    //   rules: cssRulers as any,
    // }),
    AutoImport({
      imports: ["vue", "vue-router", "vue-i18n", "pinia"],
      include: [
        /\.[tj]sx?$/,
        // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/,
        // .vue
        /\.md$/
        // .md
      ],
      resolvers: [
        TDesignResolver({
          library: "vue-next"
        })
      ],
      dts: true
    }),
    //
    Components({
      dirs: ["src/components"],
      // 自动扫描组件目录
      extensions: ["vue"],
      deep: true,
      dts: "src/components.d.ts",
      // 自动生成类型声明
      resolvers: [
        TDesignResolver({
          library: "vue-next"
        })
      ]
    })
    // Components({
    //   dts: true,
    //   resolvers: [],
    // }),
  ];
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));
  if (VITE_USE_MOCK) vitePlugins.push(configMockPlugin(isBuild, prodMock));
  if (isBuild) {
    vitePlugins.push(
      configCompressPlugin(
        VITE_BUILD_COMPRESS,
        VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      )
    );
  }
  return vitePlugins;
}

// build/vite/proxy.ts
var httpsRE = /^https:\/\//;
function createProxy(list = []) {
  const ret = {};
  for (const [prefix, target] of list) {
    const isHttps = httpsRE.test(target);
    ret[prefix] = {
      target,
      changeOrigin: true,
      // ws: true,
      rewrite: (path2) => {
        return path2.replace(new RegExp(`^${prefix}`), "");
      },
      // https is require secure=false
      ...isHttps ? { secure: false } : {}
    };
    console.log("proxy set:", ret, ret[prefix]);
  }
  return ret;
}

// vite.config.ts
var __vite_injected_original_dirname = "/Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/user-magagement-center/fe";
var { dependencies, devDependencies, name, version } = package_default;
var CWD = process.cwd();
var __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: format(/* @__PURE__ */ new Date(), "yyyy-MM-dd HH:mm:ss")
};
function pathResolve(dir) {
  return resolve(CWD, ".", dir);
}
var vite_config_default = defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, CWD);
  console.log("Raw loadEnv VITE_BASE_URL:", env.VITE_BASE_URL);
  const viteEnv = wrapperEnv(env);
  const isBuild = command === "build";
  const isLib = process.env.LIB_BUILD === "1";
  const baseUrl = viteEnv.VITE_BASE_URL || "/";
  console.log("Loaded VITE_BASE_URL:", viteEnv.VITE_BASE_URL);
  console.log("Using baseUrl:", baseUrl);
  const port = viteEnv.VITE_PORT || Number(process.env.PORT || 3030);
  const useProxy = mode === "mock" || Boolean(viteEnv.VITE_IS_REQUEST_PROXY);
  const serverProxy = useProxy ? createProxy(viteEnv.VITE_PROXY || []) : {};
  const prodMock = viteEnv.VITE_GLOB_PROD_MOCK;
  const baseConfig = {
    base: baseUrl,
    esbuild: {},
    resolve: {
      alias: [{ find: "@", replacement: `${pathResolve("src")}/` }],
      dedupe: ["vue"]
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
        ]
      }
    },
    plugins: createVitePlugins(viteEnv, isBuild, prodMock),
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    server: {
      hmr: true,
      host: true,
      port,
      watch: { usePolling: true },
      proxy: serverProxy,
      strictPort: false,
      cors: true,
      origin: `http://localhost:${port}`,
      headers: {
        "Access-Control-Allow-Origin": "*"
      }
    },
    optimizeDeps: { include: [], exclude: ["vue-demi"] },
    // 实验性功能：渲染构建时的预加载标签
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === "js") {
          return { runtime: JSON.stringify(path.posix.join(baseUrl, filename)) };
        }
        return { relative: true };
      }
    },
    build: {
      target: "es2015",
      cssTarget: "chrome80",
      outDir: OUTPUT_DIR,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2e3,
      // 确保动态导入的文件路径包含 base URL
      rollupOptions: {
        output: {
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]"
        }
      }
    }
  };
  if (!isLib) return baseConfig;
  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      lib: {
        entry: path.resolve(__vite_injected_original_dirname, "src/common/index.ts"),
        name: "BasicCommon",
        formats: ["es", "umd"],
        fileName: "common"
      },
      rollupOptions: {
        external: ["vue", "axios", "tdesign-vue-next"],
        output: {
          globals: {
            vue: "Vue",
            axios: "axios",
            "tdesign-vue-next": "TDesign"
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvY29uc3RhbnQudHMiLCAiYnVpbGQvdXRpbHMudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaW5kZXgudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50cyIsICJwYWNrYWdlLmpzb24iLCAiYnVpbGQvdml0ZS9wbHVnaW4vbW9jay50cyIsICJidWlsZC92aXRlL3Byb3h5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnZGF0ZS1mbnMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcHh0b3JlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nXG5pbXBvcnQgeyBPVVRQVVRfRElSIH0gZnJvbSAnLi9idWlsZC9jb25zdGFudCdcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tICcuL2J1aWxkL3V0aWxzJ1xuaW1wb3J0IHsgY3JlYXRlVml0ZVBsdWdpbnMgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzJ1xuaW1wb3J0IHsgY3JlYXRlUHJveHkgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcHJveHknXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG5jb25zdCB7IGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzLCBuYW1lLCB2ZXJzaW9uIH0gPSBwa2cgYXMgYW55XG5jb25zdCBDV0QgPSBwcm9jZXNzLmN3ZCgpXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XG4gIHBrZzogeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9LFxuICBsYXN0QnVpbGRUaW1lOiBmb3JtYXQobmV3IERhdGUoKSwgJ3l5eXktTU0tZGQgSEg6bW06c3MnKSxcbn1cbmZ1bmN0aW9uIHBhdGhSZXNvbHZlKGRpcjogc3RyaW5nKSB7XG4gIHJldHVybiByZXNvbHZlKENXRCwgJy4nLCBkaXIpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBjb21tYW5kLCBtb2RlIH06IENvbmZpZ0Vudik6IFVzZXJDb25maWcgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIENXRClcbiAgLy8gRXhwbGljaXRseSBsb2cgdGhlIHJhdyBlbnYgdmFsdWUgZnJvbSBsb2FkRW52XG4gIGNvbnNvbGUubG9nKCdSYXcgbG9hZEVudiBWSVRFX0JBU0VfVVJMOicsIGVudi5WSVRFX0JBU0VfVVJMKVxuXG4gIGNvbnN0IHZpdGVFbnYgPSB3cmFwcGVyRW52KGVudilcbiAgY29uc3QgaXNCdWlsZCA9IGNvbW1hbmQgPT09ICdidWlsZCdcbiAgY29uc3QgaXNMaWIgPSBwcm9jZXNzLmVudi5MSUJfQlVJTEQgPT09ICcxJ1xuXG4gIC8vIFVzZSBWSVRFX0JBU0VfVVJMIGZyb20gZW52aXJvbm1lbnQgdmFyaWFibGVzXG4gIGNvbnN0IGJhc2VVcmwgPSAodml0ZUVudiBhcyBhbnkpLlZJVEVfQkFTRV9VUkwgfHwgJy8nXG5cbiAgY29uc29sZS5sb2coJ0xvYWRlZCBWSVRFX0JBU0VfVVJMOicsICh2aXRlRW52IGFzIGFueSkuVklURV9CQVNFX1VSTClcbiAgY29uc29sZS5sb2coJ1VzaW5nIGJhc2VVcmw6JywgYmFzZVVybClcbiAgY29uc3QgcG9ydCA9ICh2aXRlRW52IGFzIGFueSkuVklURV9QT1JUIHx8IE51bWJlcihwcm9jZXNzLmVudi5QT1JUIHx8IDMwMzApXG4gIGNvbnN0IHVzZVByb3h5ID1cbiAgICBtb2RlID09PSAnbW9jaycgfHwgQm9vbGVhbigodml0ZUVudiBhcyBhbnkpLlZJVEVfSVNfUkVRVUVTVF9QUk9YWSlcbiAgY29uc3Qgc2VydmVyUHJveHkgPSB1c2VQcm94eVxuICAgID8gY3JlYXRlUHJveHkoKHZpdGVFbnYgYXMgYW55KS5WSVRFX1BST1hZIHx8IFtdKVxuICAgIDoge31cbiAgY29uc3QgcHJvZE1vY2sgPSAodml0ZUVudiBhcyBhbnkpLlZJVEVfR0xPQl9QUk9EX01PQ0tcbiAgY29uc3QgYmFzZUNvbmZpZzogVXNlckNvbmZpZyA9IHtcbiAgICBiYXNlOiBiYXNlVXJsLFxuICAgIGVzYnVpbGQ6IHt9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiBbeyBmaW5kOiAnQCcsIHJlcGxhY2VtZW50OiBgJHtwYXRoUmVzb2x2ZSgnc3JjJyl9L2AgfV0sXG4gICAgICBkZWR1cGU6IFsndnVlJ10sXG4gICAgfSxcbiAgICBjc3M6IHtcbiAgICAgIHByZXByb2Nlc3Nvck9wdGlvbnM6IHsgbGVzczogeyBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSB9IH0sXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICAvLyBcdTc5ODFcdTc1MjggcHh0b3JlbVx1RkYwQ1x1NTZFMFx1NEUzQVx1NjIxMVx1NEVFQ1x1NTNFQVx1NTcyOFx1NzlGQlx1NTJBOFx1N0FFRlx1NEY3Rlx1NzUyOCByZW1cdUZGMENcdTkwMUFcdThGQzcgbWFpbi50cyBcdTUyQThcdTYwMDFcdThCQkVcdTdGNkVcdTY4MzlcdTVCNTdcdTRGNTNcdTU5MjdcdTVDMEZcbiAgICAgICAgICAvLyBweHRvcmVtKHtcbiAgICAgICAgICAvLyAgIHJvb3RWYWx1ZTogMTYsXG4gICAgICAgICAgLy8gICB1bml0UHJlY2lzaW9uOiA1LFxuICAgICAgICAgIC8vICAgcHJvcExpc3Q6IFsnKiddLFxuICAgICAgICAgIC8vICAgc2VsZWN0b3JCbGFja0xpc3Q6IFtdLFxuICAgICAgICAgIC8vICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAvLyAgIG1lZGlhUXVlcnk6IGZhbHNlLFxuICAgICAgICAgIC8vICAgbWluUGl4ZWxWYWx1ZTogMixcbiAgICAgICAgICAvLyAgIGV4Y2x1ZGU6IC9ub2RlX21vZHVsZXMvaSxcbiAgICAgICAgICAvLyB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBjcmVhdGVWaXRlUGx1Z2lucyh2aXRlRW52LCBpc0J1aWxkLCBwcm9kTW9jayksXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9FTlZfXzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYpLFxuICAgICAgX19BUFBfSU5GT19fOiBKU09OLnN0cmluZ2lmeShfX0FQUF9JTkZPX18pLFxuICAgICAgX19WVUVfUFJPRF9IWURSQVRJT05fTUlTTUFUQ0hfREVUQUlMU19fOiBmYWxzZSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQsXG4gICAgICB3YXRjaDogeyB1c2VQb2xsaW5nOiB0cnVlIH0sXG4gICAgICBwcm94eTogc2VydmVyUHJveHksXG4gICAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBvcmlnaW46IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH1gLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczogeyBpbmNsdWRlOiBbXSwgZXhjbHVkZTogWyd2dWUtZGVtaSddIH0sXG4gICAgLy8gXHU1QjlFXHU5QThDXHU2MDI3XHU1MjlGXHU4MEZEXHVGRjFBXHU2RTMyXHU2N0QzXHU2Nzg0XHU1RUZBXHU2NUY2XHU3Njg0XHU5ODg0XHU1MkEwXHU4RjdEXHU2ODA3XHU3QjdFXG4gICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICByZW5kZXJCdWlsdFVybChmaWxlbmFtZSwgeyBob3N0VHlwZSB9KSB7XG4gICAgICAgIGlmIChob3N0VHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NUMwNiBWSVRFX0JBU0VfVVJMIFx1NzY4NFx1NTAzQ1x1NkNFOFx1NTE2NVx1NTIzMFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NEY5RFx1OEQ1NiB3aW5kb3cgXHU1M0Q4XHU5MUNGXG4gICAgICAgICAgcmV0dXJuIHsgcnVudGltZTogSlNPTi5zdHJpbmdpZnkocGF0aC5wb3NpeC5qb2luKGJhc2VVcmwsIGZpbGVuYW1lKSkgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHJlbGF0aXZlOiB0cnVlIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXMyMDE1JyxcbiAgICAgIGNzc1RhcmdldDogJ2Nocm9tZTgwJyxcbiAgICAgIG91dERpcjogT1VUUFVUX0RJUixcbiAgICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSxcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMjAwMCxcbiAgICAgIC8vIFx1Nzg2RVx1NEZERFx1NTJBOFx1NjAwMVx1NUJGQ1x1NTE2NVx1NzY4NFx1NjU4N1x1NEVGNlx1OERFRlx1NUY4NFx1NTMwNVx1NTQyQiBiYXNlIFVSTFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxuICBpZiAoIWlzTGliKSByZXR1cm4gYmFzZUNvbmZpZ1xuICByZXR1cm4ge1xuICAgIC4uLmJhc2VDb25maWcsXG4gICAgYnVpbGQ6IHtcbiAgICAgIC4uLmJhc2VDb25maWcuYnVpbGQsXG4gICAgICBsaWI6IHtcbiAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvY29tbW9uL2luZGV4LnRzJyksXG4gICAgICAgIG5hbWU6ICdCYXNpY0NvbW1vbicsXG4gICAgICAgIGZvcm1hdHM6IFsnZXMnLCAndW1kJ10sXG4gICAgICAgIGZpbGVOYW1lOiAnY29tbW9uJyxcbiAgICAgIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGV4dGVybmFsOiBbJ3Z1ZScsICdheGlvcycsICd0ZGVzaWduLXZ1ZS1uZXh0J10sXG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAgIHZ1ZTogJ1Z1ZScsXG4gICAgICAgICAgICBheGlvczogJ2F4aW9zJyxcbiAgICAgICAgICAgICd0ZGVzaWduLXZ1ZS1uZXh0JzogJ1REZXNpZ24nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvY29uc3RhbnQudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC9jb25zdGFudC50c1wiOy8qKlxuICogVGhlIG5hbWUgb2YgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZSBlbnRlcmVkIGluIHRoZSBwcm9kdWN0aW9uIGVudmlyb25tZW50XG4gKi9cbmV4cG9ydCBjb25zdCBHTE9CX0NPTkZJR19GSUxFX05BTUUgPSAnYXNzZXRzL2FwcC5jb25maWcuanMnO1xuXG5leHBvcnQgY29uc3QgT1VUUFVUX0RJUiA9ICdkaXN0JztcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC91dGlscy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3V0aWxzLnRzXCI7aW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZGbihtb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1vZGUgPT09ICdkZXZlbG9wbWVudCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb2RGbihtb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1vZGUgPT09ICdwcm9kdWN0aW9uJztcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIGdlbmVyYXRlIHBhY2thZ2UgcHJldmlld1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXBvcnRNb2RlKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnYuUkVQT1JUID09PSAndHJ1ZSc7XG59XG5cbi8vIFJlYWQgYWxsIGVudmlyb25tZW50IHZhcmlhYmxlIGNvbmZpZ3VyYXRpb24gZmlsZXMgdG8gcHJvY2Vzcy5lbnZcbmV4cG9ydCBmdW5jdGlvbiB3cmFwcGVyRW52KGVudkNvbmY6IFJlY29yZGFibGUpOiBWaXRlRW52IHtcbiAgY29uc3QgcmV0OiBhbnkgPSB7fTtcblxuICBmb3IgKGNvbnN0IGVudk5hbWUgb2YgT2JqZWN0LmtleXMoZW52Q29uZikpIHtcbiAgICBsZXQgcmVhbE5hbWUgPSBlbnZDb25mW2Vudk5hbWVdLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKTtcbiAgICByZWFsTmFtZSA9IHJlYWxOYW1lID09PSAndHJ1ZScgPyB0cnVlIDogcmVhbE5hbWUgPT09ICdmYWxzZScgPyBmYWxzZSA6IHJlYWxOYW1lO1xuXG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1BPUlQnKSB7XG4gICAgICByZWFsTmFtZSA9IE51bWJlcihyZWFsTmFtZSk7XG4gICAgfVxuICAgIGlmIChlbnZOYW1lID09PSAnVklURV9QUk9YWScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlYWxOYW1lID0gSlNPTi5wYXJzZShyZWFsTmFtZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1NFUlZFUl9QUk9YWScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlYWxOYW1lID0gSlNPTi5wYXJzZShyZWFsTmFtZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0W2Vudk5hbWVdID0gcmVhbE5hbWU7XG4gICAgcHJvY2Vzcy5lbnZbZW52TmFtZV0gPSByZWFsTmFtZTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIHN0YXJ0aW5nIHdpdGggdGhlIHNwZWNpZmllZCBwcmVmaXhcbiAqIEBwYXJhbSBtYXRjaCBwcmVmaXhcbiAqIEBwYXJhbSBjb25mRmlsZXMgZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnZDb25maWcobWF0Y2ggPSAnVklURV9HTE9CXycsIGNvbmZGaWxlcyA9IFsnLmVudicsICcuZW52LnRlc3QnLCAnLmVudi5wcm9kJ10pIHtcbiAgbGV0IGVudkNvbmZpZyA9IHt9O1xuICBjb25mRmlsZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnYgPSBkb3RlbnYucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBpdGVtKSkpO1xuICAgICAgZW52Q29uZmlnID0geyAuLi5lbnZDb25maWcsIC4uLmVudiB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICB9KTtcblxuICBPYmplY3Qua2V5cyhlbnZDb25maWcpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHJlZyA9IG5ldyBSZWdFeHAoYF4oJHttYXRjaH0pYCk7XG4gICAgaWYgKCFyZWcudGVzdChrZXkpKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGVudkNvbmZpZywga2V5KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZW52Q29uZmlnO1xufVxuXG4vKipcbiAqIEdldCB1c2VyIHJvb3QgZGlyZWN0b3J5XG4gKiBAcGFyYW0gZGlyIGZpbGUgcGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdFBhdGgoLi4uZGlyOiBzdHJpbmdbXSkge1xuICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIC4uLmRpcik7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvdml0ZS9wbHVnaW4vaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC92aXRlL3BsdWdpbi9pbmRleC50c1wiO2ltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcbi8vIGltcG9ydCB7IE5haXZlVWlSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IHsgVERlc2lnblJlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcbmltcG9ydCB0eXBlIHsgUGx1Z2luLCBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHN2Z0xvYWRlciBmcm9tICd2aXRlLXN2Zy1sb2FkZXInXG5cbmltcG9ydCB7IGNvbmZpZ0NvbXByZXNzUGx1Z2luIH0gZnJvbSAnLi9jb21wcmVzcydcbmltcG9ydCB7IGNvbmZpZ0h0bWxQbHVnaW4gfSBmcm9tICcuL2h0bWwnXG5pbXBvcnQgeyBjb25maWdNb2NrUGx1Z2luIH0gZnJvbSAnLi9tb2NrJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVml0ZVBsdWdpbnMoXG4gIHZpdGVFbnY6IFZpdGVFbnYsXG4gIGlzQnVpbGQ6IGJvb2xlYW4sXG4gIHByb2RNb2NrXG4pIHtcbiAgY29uc3Qge1xuICAgIFZJVEVfVVNFX01PQ0ssXG4gICAgVklURV9CVUlMRF9DT01QUkVTUyxcbiAgICBWSVRFX0JVSUxEX0NPTVBSRVNTX0RFTEVURV9PUklHSU5fRklMRSxcbiAgfSA9IHZpdGVFbnZcblxuICBjb25zdCB2aXRlUGx1Z2luczogKFBsdWdpbiB8IFBsdWdpbltdIHwgUGx1Z2luT3B0aW9uW10pW10gPSBbXG4gICAgLy8gaGF2ZSB0b1xuICAgIHZ1ZSgpLFxuICAgIC8vIGhhdmUgdG9cbiAgICB2dWVKc3goKSxcbiAgICBzdmdMb2FkZXIoKSxcbiAgICBVbm9DU1MoKSxcbiAgICAvLyBVbm9DU1Moe1xuICAgIC8vICAgaG1yVG9wTGV2ZWxBd2FpdDogZmFsc2UsXG4gICAgLy8gICBydWxlczogY3NzUnVsZXJzIGFzIGFueSxcbiAgICAvLyB9KSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAndnVlLWkxOG4nLCAncGluaWEnXSxcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgL1xcLlt0al1zeD8kLywgLy8gLnRzLCAudHN4LCAuanMsIC5qc3hcbiAgICAgICAgL1xcLnZ1ZSQvLFxuICAgICAgICAvXFwudnVlXFw/dnVlLywgLy8gLnZ1ZVxuICAgICAgICAvXFwubWQkLywgLy8gLm1kXG4gICAgICBdLFxuICAgICAgcmVzb2x2ZXJzOiBbXG4gICAgICAgIFREZXNpZ25SZXNvbHZlcih7XG4gICAgICAgICAgbGlicmFyeTogJ3Z1ZS1uZXh0JyxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgICAgZHRzOiB0cnVlLFxuICAgIH0pLFxuICAgIC8vXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICAgICAgZXh0ZW5zaW9uczogWyd2dWUnXSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJywgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgVERlc2lnblJlc29sdmVyKHtcbiAgICAgICAgICBsaWJyYXJ5OiAndnVlLW5leHQnLFxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgfSksXG4gICAgLy8gQ29tcG9uZW50cyh7XG4gICAgLy8gICBkdHM6IHRydWUsXG4gICAgLy8gICByZXNvbHZlcnM6IFtdLFxuICAgIC8vIH0pLFxuICBdXG5cbiAgLy8gdml0ZS1wbHVnaW4taHRtbFxuICB2aXRlUGx1Z2lucy5wdXNoKGNvbmZpZ0h0bWxQbHVnaW4odml0ZUVudiwgaXNCdWlsZCkpXG5cbiAgLy8gdml0ZS1wbHVnaW4tbW9ja1xuICBpZiAoVklURV9VU0VfTU9DSykgdml0ZVBsdWdpbnMucHVzaChjb25maWdNb2NrUGx1Z2luKGlzQnVpbGQsIHByb2RNb2NrKSlcblxuICBpZiAoaXNCdWlsZCkge1xuICAgIC8vIHJvbGx1cC1wbHVnaW4tZ3ppcFxuICAgIHZpdGVQbHVnaW5zLnB1c2goXG4gICAgICBjb25maWdDb21wcmVzc1BsdWdpbihcbiAgICAgICAgVklURV9CVUlMRF9DT01QUkVTUyxcbiAgICAgICAgVklURV9CVUlMRF9DT01QUkVTU19ERUxFVEVfT1JJR0lOX0ZJTEVcbiAgICAgIClcbiAgICApXG4gIH1cblxuICByZXR1cm4gdml0ZVBsdWdpbnNcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC92aXRlL3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC92aXRlL3BsdWdpbi9jb21wcmVzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2NvbXByZXNzLnRzXCI7LyoqXG4gKiBVc2VkIHRvIHBhY2thZ2UgYW5kIG91dHB1dCBnemlwLiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCB3b3JrIHByb3Blcmx5IGluIFZpdGUsIHRoZSBzcGVjaWZpYyByZWFzb24gaXMgc3RpbGwgYmVpbmcgaW52ZXN0aWdhdGVkXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5uY3diL3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgY29tcHJlc3NQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnQ29tcHJlc3NQbHVnaW4oXG4gIGNvbXByZXNzOiAnZ3ppcCcgfCAnYnJvdGxpJyB8ICdub25lJyxcbiAgZGVsZXRlT3JpZ2luRmlsZSA9IGZhbHNlLFxuKTogUGx1Z2luIHwgUGx1Z2luW10ge1xuICBjb25zb2xlLmxvZyhjb21wcmVzcywgJ2NvbXByZXNzJyk7XG5cbiAgY29uc3QgY29tcHJlc3NMaXN0ID0gY29tcHJlc3Muc3BsaXQoJywnKTtcblxuICBjb25zdCBwbHVnaW5zOiBQbHVnaW5bXSA9IFtdO1xuXG4gIGlmIChjb21wcmVzc0xpc3QuaW5jbHVkZXMoJ2d6aXAnKSkge1xuICAgIHBsdWdpbnMucHVzaChcbiAgICAgIGNvbXByZXNzUGx1Z2luKHtcbiAgICAgICAgZXh0OiAnLmd6JyxcbiAgICAgICAgZGVsZXRlT3JpZ2luRmlsZSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cbiAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcygnYnJvdGxpJykpIHtcbiAgICBwbHVnaW5zLnB1c2goXG4gICAgICBjb21wcmVzc1BsdWdpbih7XG4gICAgICAgIGV4dDogJy5icicsXG4gICAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcbiAgICAgICAgZGVsZXRlT3JpZ2luRmlsZSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHBsdWdpbnM7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2h0bWwudHNcIjsvKipcbiAqIFBsdWdpbiB0byBtaW5pbWl6ZSBhbmQgdXNlIGVqcyB0ZW1wbGF0ZSBzeW50YXggaW4gaW5kZXguaHRtbC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2Ivdml0ZS1wbHVnaW4taHRtbFxuICovXG5pbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCdcblxuaW1wb3J0IHBrZyBmcm9tICcuLi8uLi8uLi9wYWNrYWdlLmpzb24nXG5pbXBvcnQgeyBHTE9CX0NPTkZJR19GSUxFX05BTUUgfSBmcm9tICcuLi8uLi9jb25zdGFudCdcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ0h0bWxQbHVnaW4oZW52OiBWaXRlRW52LCBpc0J1aWxkOiBib29sZWFuKSB7XG4gIGNvbnN0IHsgVklURV9HTE9CX0FQUF9USVRMRSwgVklURV9CQVNFX1VSTCB9ID0gZW52XG5cbiAgY29uc3QgcGF0aCA9IFZJVEVfQkFTRV9VUkwuZW5kc1dpdGgoJy8nKSA/IFZJVEVfQkFTRV9VUkwgOiBgJHtWSVRFX0JBU0VfVVJMfS9gXG5cbiAgY29uc3QgZ2V0QXBwQ29uZmlnU3JjID0gKCkgPT4ge1xuICAgIHJldHVybiBgJHtwYXRofSR7R0xPQl9DT05GSUdfRklMRV9OQU1FfT92PSR7cGtnLnZlcnNpb259LSR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICB9XG5cbiAgY29uc3QgaHRtbFBsdWdpbjogUGx1Z2luT3B0aW9uW10gPSBjcmVhdGVIdG1sUGx1Z2luKHtcbiAgICBtaW5pZnk6IGlzQnVpbGQsXG4gICAgaW5qZWN0OiB7XG4gICAgICAvLyBJbmplY3QgZGF0YSBpbnRvIGVqcyB0ZW1wbGF0ZVxuICAgICAgZGF0YToge1xuICAgICAgICB0aXRsZTogVklURV9HTE9CX0FQUF9USVRMRSxcbiAgICAgIH0sXG4gICAgICAvLyBFbWJlZCB0aGUgZ2VuZXJhdGVkIGFwcC5jb25maWcuanMgZmlsZVxuICAgICAgdGFnczogaXNCdWlsZFxuICAgICAgICA/IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICBzcmM6IGdldEFwcENvbmZpZ1NyYygpLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBpbmplY3RUbzogJ2hlYWQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW10sXG4gICAgfSxcbiAgfSlcbiAgcmV0dXJuIGh0bWxQbHVnaW5cbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcIkB3Yi91c2VyLW1hZ2FnZW1lbnQtY2VudGVyLWZlXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMS4wXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZCAtLW1vZGUgJHtNT0RFOi1wcm9kdWN0aW9ufSAmJiB0c3ggYnVpbGQvc2NyaXB0L3Bvc3RCdWlsZC50c1wiLFxuICAgIFwiYnVpbGQ6Y2xlYW5cIjogXCJybSAtcmYgZGlzdCBub2RlX21vZHVsZXMvLnZpdGUgJiYgcG5wbSBydW4gYnVpbGRcIixcbiAgICBcImJ1aWxkOmxpYlwiOiBcIkxJQl9CVUlMRD0xIHZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInR5cGVjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXRcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLS1leHQgLnRzLC52dWUgc3JjXCIsXG4gICAgXCJmb3JtYXRcIjogXCJwcmV0dGllciAtLXdyaXRlIFxcXCJzcmMvKiovKi57dHMsdnVlLGNzc31cXFwiXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdhcmZpc2gvYnJvd3Nlci1zbmFwc2hvdFwiOiBcIl4xLjE5LjdcIixcbiAgICBcIkBnYXJmaXNoL2Jyb3dzZXItdm1cIjogXCJeMS4xOS43XCIsXG4gICAgXCJAZ2FyZmlzaC9jb3JlXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQGdhcmZpc2gvcm91dGVyXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQHZ1ZXVzZS9jb3JlXCI6IFwiXjE0LjEuMFwiLFxuICAgIFwiQHdiL3NoYXJlZFwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjcuN1wiLFxuICAgIFwiZGF5anNcIjogXCJeMS4xMS4xMFwiLFxuICAgIFwibW9tZW50XCI6IFwiXjIuMzAuMVwiLFxuICAgIFwicGluaWFcIjogXCJeMi4yLjdcIixcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIl4zLjIuM1wiLFxuICAgIFwidGRlc2lnbi1pY29ucy12dWUtbmV4dFwiOiBcIl4wLjQuMVwiLFxuICAgIFwidGRlc2lnbi12dWUtbmV4dFwiOiBcIl4xLjE3LjZcIixcbiAgICBcInZ1ZVwiOiBcIl4zLjUuMFwiLFxuICAgIFwidnVlLWkxOG5cIjogXCJeOS4xNC4yXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIl40LjE0LjIwMlwiLFxuICAgIFwiQHR5cGVzL21vbWVudFwiOiBcIl4yLjEzLjBcIixcbiAgICBcIkB0eXBlcy9xc1wiOiBcIl42LjE0LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjEuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl40LjEuMFwiLFxuICAgIFwiZGF0ZS1mbnNcIjogXCJeNC4xLjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tdnVlXCI6IFwiXjkuMjguMFwiLFxuICAgIFwibGVzc1wiOiBcIl40LjQuMlwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcIm1vY2tqc1wiOiBcIl4xLjEuMFwiLFxuICAgIFwicG9zdGNzc1wiOiBcIl44LjQuMFwiLFxuICAgIFwicG9zdGNzcy1weHRvcmVtXCI6IFwiXjYuMS4wXCIsXG4gICAgXCJxc1wiOiBcIl42LjE0LjBcIixcbiAgICBcInVub2Nzc1wiOiBcIl4wLjY0LjBcIixcbiAgICBcInVucGx1Z2luLWF1dG8taW1wb3J0XCI6IFwiXjAuMTcuNlwiLFxuICAgIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcIjogXCJeMC4yNi4wXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuNC4wXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiOiBcIl4wLjUuMVwiLFxuICAgIFwidml0ZS1wbHVnaW4taHRtbFwiOiBcIl4zLjIuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tbW9ja1wiOiBcIl4yLjkuOFwiLFxuICAgIFwidml0ZS1zdmctbG9hZGVyXCI6IFwiXjUuMS4wXCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjIuMS42XCJcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL21vY2sudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvdXNlci1tYWdhZ2VtZW50LWNlbnRlci9mZS9idWlsZC92aXRlL3BsdWdpbi9tb2NrLnRzXCI7LyoqXG4gKiBNb2NrIHBsdWdpbiBmb3IgZGV2ZWxvcG1lbnQgYW5kIHByb2R1Y3Rpb24uXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5uY3diL3ZpdGUtcGx1Z2luLW1vY2tcbiAqL1xuaW1wb3J0IHsgdml0ZU1vY2tTZXJ2ZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnTW9ja1BsdWdpbihpc0J1aWxkOiBib29sZWFuLCBwcm9kTW9jazogYm9vbGVhbikge1xuICByZXR1cm4gdml0ZU1vY2tTZXJ2ZSh7XG4gICAgaWdub3JlOiAvXlxcXy8sXG4gICAgbW9ja1BhdGg6ICdtb2NrJyxcbiAgICBsb2NhbEVuYWJsZWQ6ICFpc0J1aWxkLFxuICAgIHByb2RFbmFibGVkOiBpc0J1aWxkICYmIHByb2RNb2NrLFxuICAgIGluamVjdENvZGU6IGBcbiAgICAgICBpbXBvcnQgeyBzZXR1cFByb2RNb2NrU2VydmVyIH0gZnJvbSAnLi4vbW9jay9fY3JlYXRlUHJvZHVjdGlvblNlcnZlcic7XG4gXG4gICAgICAgc2V0dXBQcm9kTW9ja1NlcnZlcigpO1xuICAgICAgIGAsXG4gIH0pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL3VzZXItbWFnYWdlbWVudC1jZW50ZXIvZmUvYnVpbGQvdml0ZS9wcm94eS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci91c2VyLW1hZ2FnZW1lbnQtY2VudGVyL2ZlL2J1aWxkL3ZpdGUvcHJveHkudHNcIjsvKipcbiAqIFVzZWQgdG8gcGFyc2UgdGhlIC5lbnYuZGV2ZWxvcG1lbnQgcHJveHkgY29uZmlndXJhdGlvblxuICovXG5pbXBvcnQgdHlwZSB7IFByb3h5T3B0aW9ucyB9IGZyb20gJ3ZpdGUnO1xuXG50eXBlIFByb3h5SXRlbSA9IFtzdHJpbmcsIHN0cmluZ107XG5cbnR5cGUgUHJveHlMaXN0ID0gUHJveHlJdGVtW107XG5cbnR5cGUgUHJveHlUYXJnZXRMaXN0ID0gUmVjb3JkPHN0cmluZywgUHJveHlPcHRpb25zICYgeyByZXdyaXRlPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nIH0+O1xuXG5jb25zdCBodHRwc1JFID0gL15odHRwczpcXC9cXC8vO1xuXG4vKipcbiAqIEdlbmVyYXRlIHByb3h5XG4gKiBAcGFyYW0gbGlzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJveHkobGlzdDogUHJveHlMaXN0ID0gW10pIHtcbiAgY29uc3QgcmV0OiBQcm94eVRhcmdldExpc3QgPSB7fTtcbiAgZm9yIChjb25zdCBbcHJlZml4LCB0YXJnZXRdIG9mIGxpc3QpIHtcbiAgICBjb25zdCBpc0h0dHBzID0gaHR0cHNSRS50ZXN0KHRhcmdldCk7XG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaHR0cC1wYXJ0eS9ub2RlLWh0dHAtcHJveHkjb3B0aW9uc1xuICAgIHJldFtwcmVmaXhdID0ge1xuICAgICAgdGFyZ2V0LFxuICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgLy8gd3M6IHRydWUsXG4gICAgICByZXdyaXRlOiAocGF0aCkgPT4ge1xuICAgICAgICByZXR1cm4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke3ByZWZpeH1gKSwgJycpO1xuICAgICAgfSxcbiAgICAgIC8vIGh0dHBzIGlzIHJlcXVpcmUgc2VjdXJlPWZhbHNlXG4gICAgICAuLi4oaXNIdHRwcyA/IHsgc2VjdXJlOiBmYWxzZSB9IDoge30pLFxuICAgIH07XG4gICAgY29uc29sZS5sb2coJ3Byb3h5IHNldDonLCByZXQsIHJldFtwcmVmaXhdKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3YSxPQUFPLFVBQVU7QUFDemIsU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGNBQWMsZUFBZ0Q7OztBQ0FoRSxJQUFNLHdCQUF3QjtBQUU5QixJQUFNLGFBQWE7OztBQ0xvWixPQUFPLFlBQVk7QUFvQjFiLFNBQVMsV0FBVyxTQUE4QjtBQUN2RCxRQUFNLE1BQVcs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
