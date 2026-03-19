// vite.config.ts
import path from "node:path";
import { format } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/date-fns@4.1.0/node_modules/date-fns/index.js";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/vite@5.4.21_less@4.5.1/node_modules/vite/dist/node/index.js";
import pxtorem from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/postcss-pxtorem@6.1.0_postcss@8.5.6/node_modules/postcss-pxtorem/index.js";

// build/constant.ts
var GLOB_CONFIG_FILE_NAME = "assets/app.config.js";
var OUTPUT_DIR = "dist";

// build/utils.ts
import dotenv from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/dotenv@17.2.3/node_modules/dotenv/lib/main.js";
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
import vue from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.21+vue@3.5.25/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.2.0_vite@5.4.21+vue@3.5.25/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import UnoCSS from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/unocss@0.64.1_vz26mvmolyt2yuhyydpqg52gju/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/unplugin-auto-import@0.17.8/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/unplugin-vue-components@0.26.0_vue@3.5.25/node_modules/unplugin-vue-components/dist/vite.js";
import svgLoader from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/vite-svg-loader@5.1.0_vue@3.5.25/node_modules/vite-svg-loader/index.js";

// build/vite/plugin/compress.ts
import compressPlugin from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@5.4.21/node_modules/vite-plugin-compression/dist/index.mjs";
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
import { createHtmlPlugin } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.4.21/node_modules/vite-plugin-html/dist/index.mjs";

// package.json
var package_default = {
  name: "@wb/mf-shell-fe",
  version: "0.1.0",
  private: true,
  type: "module",
  scripts: {
    dev: "vite",
    build: "vite build && tsx build/script/postBuild.ts",
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
    "@wb/shared": "workspace:*",
    axios: "^1.7.7",
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
          }
        }
      ] : []
    }
  });
  return htmlPlugin;
}

// build/vite/plugin/mock.ts
import { viteMockServe } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/vite-plugin-mock@2.9.8_mockjs@1.1.0+vite@5.4.21/node_modules/vite-plugin-mock/dist/index.js";
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
  const { VITE_USE_MOCK, VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = viteEnv;
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
      dts: true
    }),
    //
    Components({
      dirs: ["src/components"],
      // 自动扫描组件目录
      extensions: ["vue"],
      deep: true,
      dts: "src/components.d.ts"
      // 自动生成类型声明
    })
    // Components({
    //   dts: true,
    //   resolvers: [],
    // }),
  ];
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));
  if (VITE_USE_MOCK) vitePlugins.push(configMockPlugin(isBuild, prodMock));
  if (isBuild) {
    vitePlugins.push(configCompressPlugin(VITE_BUILD_COMPRESS, VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE));
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
var __vite_injected_original_dirname = "/Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/fe";
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
  const viteEnv = wrapperEnv(env);
  const isBuild = command === "build";
  const isLib = process.env.LIB_BUILD === "1";
  const baseUrl = viteEnv.VITE_BASE_URL || "/app/";
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
          pxtorem({
            rootValue: 16,
            unitPrecision: 5,
            propList: ["*"],
            selectorBlackList: [],
            replace: true,
            mediaQuery: false,
            minPixelValue: 2,
            exclude: /node_modules/i
          })
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
          chunkFileNames: "static/js/[name]-[hash].js",
          entryFileNames: "static/js/[name]-[hash].js",
          assetFileNames: "static/[ext]/[name]-[hash].[ext]"
        }
      }
    }
  };
  if (!isLib) return baseConfig;
  return {
    ...baseConfig,
    build: {
      ...baseConfig.build,
      lib: { entry: path.resolve(__vite_injected_original_dirname, "src/common/index.ts"), name: "BasicCommon", formats: ["es", "umd"], fileName: "common" },
      rollupOptions: {
        external: ["vue", "axios", "tdesign-vue-next"],
        output: { globals: { vue: "Vue", axios: "axios", "tdesign-vue-next": "TDesign" } }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvY29uc3RhbnQudHMiLCAiYnVpbGQvdXRpbHMudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaW5kZXgudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50cyIsICJwYWNrYWdlLmpzb24iLCAiYnVpbGQvdml0ZS9wbHVnaW4vbW9jay50cyIsICJidWlsZC92aXRlL3Byb3h5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnZGF0ZS1mbnMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcHh0b3JlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nXG5pbXBvcnQgeyBPVVRQVVRfRElSIH0gZnJvbSAnLi9idWlsZC9jb25zdGFudCdcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tICcuL2J1aWxkL3V0aWxzJ1xuaW1wb3J0IHsgY3JlYXRlVml0ZVBsdWdpbnMgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzJ1xuaW1wb3J0IHsgY3JlYXRlUHJveHkgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcHJveHknXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG5jb25zdCB7IGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzLCBuYW1lLCB2ZXJzaW9uIH0gPSBwa2cgYXMgYW55XG5jb25zdCBDV0QgPSBwcm9jZXNzLmN3ZCgpXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XG4gIHBrZzogeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9LFxuICBsYXN0QnVpbGRUaW1lOiBmb3JtYXQobmV3IERhdGUoKSwgJ3l5eXktTU0tZGQgSEg6bW06c3MnKSxcbn1cbmZ1bmN0aW9uIHBhdGhSZXNvbHZlKGRpcjogc3RyaW5nKSB7IHJldHVybiByZXNvbHZlKENXRCwgJy4nLCBkaXIpIH1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfTogQ29uZmlnRW52KTogVXNlckNvbmZpZyA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgQ1dEKVxuICBjb25zdCB2aXRlRW52ID0gd3JhcHBlckVudihlbnYpXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnXG4gIGNvbnN0IGlzTGliID0gcHJvY2Vzcy5lbnYuTElCX0JVSUxEID09PSAnMSdcbiAgY29uc3QgYmFzZVVybCA9ICh2aXRlRW52IGFzIGFueSkuVklURV9CQVNFX1VSTCB8fCAnL2FwcC8nXG4gIGNvbnN0IHBvcnQgPSAodml0ZUVudiBhcyBhbnkpLlZJVEVfUE9SVCB8fCBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDMwKVxuICBjb25zdCB1c2VQcm94eSA9IG1vZGUgPT09ICdtb2NrJyB8fCBCb29sZWFuKCh2aXRlRW52IGFzIGFueSkuVklURV9JU19SRVFVRVNUX1BST1hZKVxuICBjb25zdCBzZXJ2ZXJQcm94eSA9IHVzZVByb3h5ID8gY3JlYXRlUHJveHkoKHZpdGVFbnYgYXMgYW55KS5WSVRFX1BST1hZIHx8IFtdKSA6IHt9XG4gIGNvbnN0IHByb2RNb2NrID0gKHZpdGVFbnYgYXMgYW55KS5WSVRFX0dMT0JfUFJPRF9NT0NLXG4gIGNvbnN0IGJhc2VDb25maWc6IFVzZXJDb25maWcgPSB7XG4gICAgYmFzZTogYmFzZVVybCxcbiAgICBlc2J1aWxkOiB7fSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW3sgZmluZDogJ0AnLCByZXBsYWNlbWVudDogYCR7cGF0aFJlc29sdmUoJ3NyYycpfS9gIH1dLFxuICAgICAgZGVkdXBlOiBbJ3Z1ZSddLFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7IGxlc3M6IHsgamF2YXNjcmlwdEVuYWJsZWQ6IHRydWUgfSB9LFxuICAgICAgcG9zdGNzczoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgcHh0b3JlbSh7XG4gICAgICAgICAgICByb290VmFsdWU6IDE2LFxuICAgICAgICAgICAgdW5pdFByZWNpc2lvbjogNSxcbiAgICAgICAgICAgIHByb3BMaXN0OiBbJyonXSxcbiAgICAgICAgICAgIHNlbGVjdG9yQmxhY2tMaXN0OiBbXSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICBtZWRpYVF1ZXJ5OiBmYWxzZSxcbiAgICAgICAgICAgIG1pblBpeGVsVmFsdWU6IDIsXG4gICAgICAgICAgICBleGNsdWRlOiAvbm9kZV9tb2R1bGVzL2ksXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogY3JlYXRlVml0ZVBsdWdpbnModml0ZUVudiwgaXNCdWlsZCwgcHJvZE1vY2spLFxuICAgIGRlZmluZToge1xuICAgICAgX19BUFBfRU5WX186IEpTT04uc3RyaW5naWZ5KGVudi5BUFBfRU5WKSxcbiAgICAgIF9fQVBQX0lORk9fXzogSlNPTi5zdHJpbmdpZnkoX19BUFBfSU5GT19fKSxcbiAgICAgIF9fVlVFX1BST0RfSFlEUkFUSU9OX01JU01BVENIX0RFVEFJTFNfXzogZmFsc2UsXG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhtcjogdHJ1ZSxcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBwb3J0LFxuICAgICAgd2F0Y2g6IHsgdXNlUG9sbGluZzogdHJ1ZSB9LFxuICAgICAgcHJveHk6IHNlcnZlclByb3h5LFxuICAgICAgc3RyaWN0UG9ydDogZmFsc2UsXG4gICAgICBjb3JzOiB0cnVlLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgfSxcbiAgICB9LFxuICAgIG9wdGltaXplRGVwczogeyBpbmNsdWRlOiBbXSwgZXhjbHVkZTogWyd2dWUtZGVtaSddIH0sXG4gICAgLy8gXHU1QjlFXHU5QThDXHU2MDI3XHU1MjlGXHU4MEZEXHVGRjFBXHU2RTMyXHU2N0QzXHU2Nzg0XHU1RUZBXHU2NUY2XHU3Njg0XHU5ODg0XHU1MkEwXHU4RjdEXHU2ODA3XHU3QjdFXG4gICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICByZW5kZXJCdWlsdFVybChmaWxlbmFtZSwgeyBob3N0VHlwZSB9KSB7XG4gICAgICAgIGlmIChob3N0VHlwZSA9PT0gJ2pzJykge1xuICAgICAgICAgIC8vIFx1NzZGNFx1NjNBNVx1NUMwNiBWSVRFX0JBU0VfVVJMIFx1NzY4NFx1NTAzQ1x1NkNFOFx1NTE2NVx1NTIzMFx1Njc4NFx1NUVGQVx1NEVBN1x1NzI2OVx1NEUyRFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NjYyRlx1NEY5RFx1OEQ1NiB3aW5kb3cgXHU1M0Q4XHU5MUNGXG4gICAgICAgICAgcmV0dXJuIHsgcnVudGltZTogSlNPTi5zdHJpbmdpZnkocGF0aC5wb3NpeC5qb2luKGJhc2VVcmwsIGZpbGVuYW1lKSkgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHJlbGF0aXZlOiB0cnVlIH1cbiAgICAgIH0sXG4gICAgfSxcbiAgICBidWlsZDogeyBcbiAgICAgIHRhcmdldDogJ2VzMjAxNScsIFxuICAgICAgY3NzVGFyZ2V0OiAnY2hyb21lODAnLCBcbiAgICAgIG91dERpcjogT1VUUFVUX0RJUiwgXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsIFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLFxuICAgICAgLy8gXHU3ODZFXHU0RkREXHU1MkE4XHU2MDAxXHU1QkZDXHU1MTY1XHU3Njg0XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XHU1MzA1XHU1NDJCIGJhc2UgVVJMXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnc3RhdGljL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnc3RhdGljL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnc3RhdGljL1tleHRdL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9XG4gIGlmICghaXNMaWIpIHJldHVybiBiYXNlQ29uZmlnXG4gIHJldHVybiB7XG4gICAgLi4uYmFzZUNvbmZpZyxcbiAgICBidWlsZDoge1xuICAgICAgLi4uYmFzZUNvbmZpZy5idWlsZCxcbiAgICAgIGxpYjogeyBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb21tb24vaW5kZXgudHMnKSwgbmFtZTogJ0Jhc2ljQ29tbW9uJywgZm9ybWF0czogWydlcycsICd1bWQnXSwgZmlsZU5hbWU6ICdjb21tb24nIH0sXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGV4dGVybmFsOiBbJ3Z1ZScsICdheGlvcycsICd0ZGVzaWduLXZ1ZS1uZXh0J10sXG4gICAgICAgIG91dHB1dDogeyBnbG9iYWxzOiB7IHZ1ZTogJ1Z1ZScsIGF4aW9zOiAnYXhpb3MnLCAndGRlc2lnbi12dWUtbmV4dCc6ICdURGVzaWduJyB9IH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC9jb25zdGFudC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC9jb25zdGFudC50c1wiOy8qKlxuICogVGhlIG5hbWUgb2YgdGhlIGNvbmZpZ3VyYXRpb24gZmlsZSBlbnRlcmVkIGluIHRoZSBwcm9kdWN0aW9uIGVudmlyb25tZW50XG4gKi9cbmV4cG9ydCBjb25zdCBHTE9CX0NPTkZJR19GSUxFX05BTUUgPSAnYXNzZXRzL2FwcC5jb25maWcuanMnO1xuXG5leHBvcnQgY29uc3QgT1VUUFVUX0RJUiA9ICdkaXN0JztcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3V0aWxzLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3V0aWxzLnRzXCI7aW1wb3J0IGRvdGVudiBmcm9tICdkb3RlbnYnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEZXZGbihtb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1vZGUgPT09ICdkZXZlbG9wbWVudCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Byb2RGbihtb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG1vZGUgPT09ICdwcm9kdWN0aW9uJztcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRvIGdlbmVyYXRlIHBhY2thZ2UgcHJldmlld1xuICovXG5leHBvcnQgZnVuY3Rpb24gaXNSZXBvcnRNb2RlKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnYuUkVQT1JUID09PSAndHJ1ZSc7XG59XG5cbi8vIFJlYWQgYWxsIGVudmlyb25tZW50IHZhcmlhYmxlIGNvbmZpZ3VyYXRpb24gZmlsZXMgdG8gcHJvY2Vzcy5lbnZcbmV4cG9ydCBmdW5jdGlvbiB3cmFwcGVyRW52KGVudkNvbmY6IFJlY29yZGFibGUpOiBWaXRlRW52IHtcbiAgY29uc3QgcmV0OiBhbnkgPSB7fTtcblxuICBmb3IgKGNvbnN0IGVudk5hbWUgb2YgT2JqZWN0LmtleXMoZW52Q29uZikpIHtcbiAgICBsZXQgcmVhbE5hbWUgPSBlbnZDb25mW2Vudk5hbWVdLnJlcGxhY2UoL1xcXFxuL2csICdcXG4nKTtcbiAgICByZWFsTmFtZSA9IHJlYWxOYW1lID09PSAndHJ1ZScgPyB0cnVlIDogcmVhbE5hbWUgPT09ICdmYWxzZScgPyBmYWxzZSA6IHJlYWxOYW1lO1xuXG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1BPUlQnKSB7XG4gICAgICByZWFsTmFtZSA9IE51bWJlcihyZWFsTmFtZSk7XG4gICAgfVxuICAgIGlmIChlbnZOYW1lID09PSAnVklURV9QUk9YWScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlYWxOYW1lID0gSlNPTi5wYXJzZShyZWFsTmFtZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1NFUlZFUl9QUk9YWScpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlYWxOYW1lID0gSlNPTi5wYXJzZShyZWFsTmFtZSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICB9XG4gICAgcmV0W2Vudk5hbWVdID0gcmVhbE5hbWU7XG4gICAgcHJvY2Vzcy5lbnZbZW52TmFtZV0gPSByZWFsTmFtZTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIEdldCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIHN0YXJ0aW5nIHdpdGggdGhlIHNwZWNpZmllZCBwcmVmaXhcbiAqIEBwYXJhbSBtYXRjaCBwcmVmaXhcbiAqIEBwYXJhbSBjb25mRmlsZXMgZXh0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnZDb25maWcobWF0Y2ggPSAnVklURV9HTE9CXycsIGNvbmZGaWxlcyA9IFsnLmVudicsICcuZW52LnRlc3QnLCAnLmVudi5wcm9kJ10pIHtcbiAgbGV0IGVudkNvbmZpZyA9IHt9O1xuICBjb25mRmlsZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbnYgPSBkb3RlbnYucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBpdGVtKSkpO1xuICAgICAgZW52Q29uZmlnID0geyAuLi5lbnZDb25maWcsIC4uLmVudiB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICB9KTtcblxuICBPYmplY3Qua2V5cyhlbnZDb25maWcpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHJlZyA9IG5ldyBSZWdFeHAoYF4oJHttYXRjaH0pYCk7XG4gICAgaWYgKCFyZWcudGVzdChrZXkpKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGVudkNvbmZpZywga2V5KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZW52Q29uZmlnO1xufVxuXG4vKipcbiAqIEdldCB1c2VyIHJvb3QgZGlyZWN0b3J5XG4gKiBAcGFyYW0gZGlyIGZpbGUgcGF0aFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Um9vdFBhdGgoLi4uZGlyOiBzdHJpbmdbXSkge1xuICByZXR1cm4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIC4uLmRpcik7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9pbmRleC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9pbmRleC50c1wiO2ltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCc7XG5pbXBvcnQgVW5vQ1NTIGZyb20gJ3Vub2Nzcy92aXRlJztcbi8vIGltcG9ydCB7IE5haXZlVWlSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycyc7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJztcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4sIFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHsgdml0ZU1vY2tTZXJ2ZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snO1xuaW1wb3J0IHN2Z0xvYWRlciBmcm9tICd2aXRlLXN2Zy1sb2FkZXInO1xuXG5pbXBvcnQgeyBjb25maWdDb21wcmVzc1BsdWdpbiB9IGZyb20gJy4vY29tcHJlc3MnO1xuaW1wb3J0IHsgY29uZmlnSHRtbFBsdWdpbiB9IGZyb20gJy4vaHRtbCc7XG5pbXBvcnQgeyBjb25maWdNb2NrUGx1Z2luIH0gZnJvbSAnLi9tb2NrJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZpdGVQbHVnaW5zKHZpdGVFbnY6IFZpdGVFbnYsIGlzQnVpbGQ6IGJvb2xlYW4sIHByb2RNb2NrKSB7XG4gIGNvbnN0IHsgVklURV9VU0VfTU9DSywgVklURV9CVUlMRF9DT01QUkVTUywgVklURV9CVUlMRF9DT01QUkVTU19ERUxFVEVfT1JJR0lOX0ZJTEUgfSA9IHZpdGVFbnY7XG5cbiAgY29uc3Qgdml0ZVBsdWdpbnM6IChQbHVnaW4gfCBQbHVnaW5bXSB8IFBsdWdpbk9wdGlvbltdKVtdID0gW1xuICAgIC8vIGhhdmUgdG9cbiAgICB2dWUoKSxcbiAgICAvLyBoYXZlIHRvXG4gICAgdnVlSnN4KCksXG4gICAgc3ZnTG9hZGVyKCksXG4gICAgVW5vQ1NTKCksXG4gICAgLy8gVW5vQ1NTKHtcbiAgICAvLyAgIGhtclRvcExldmVsQXdhaXQ6IGZhbHNlLFxuICAgIC8vICAgcnVsZXM6IGNzc1J1bGVycyBhcyBhbnksXG4gICAgLy8gfSksXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3Z1ZS1pMThuJywgJ3BpbmlhJ10sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC9cXC5bdGpdc3g/JC8sIC8vIC50cywgLnRzeCwgLmpzLCAuanN4XG4gICAgICAgIC9cXC52dWUkLyxcbiAgICAgICAgL1xcLnZ1ZVxcP3Z1ZS8sIC8vIC52dWVcbiAgICAgICAgL1xcLm1kJC8sIC8vIC5tZFxuICAgICAgXSxcbiAgICAgIGR0czogdHJ1ZSxcbiAgICB9KSxcbiAgICAvL1xuICAgIENvbXBvbmVudHMoe1xuICAgICAgZGlyczogWydzcmMvY29tcG9uZW50cyddLCAvLyBcdTgxRUFcdTUyQThcdTYyNkJcdTYzQ0ZcdTdFQzRcdTRFRjZcdTc2RUVcdTVGNTVcbiAgICAgIGV4dGVuc2lvbnM6IFsndnVlJ10sXG4gICAgICBkZWVwOiB0cnVlLFxuICAgICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsIC8vIFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVxuICAgIH0pLFxuICAgIC8vIENvbXBvbmVudHMoe1xuICAgIC8vICAgZHRzOiB0cnVlLFxuICAgIC8vICAgcmVzb2x2ZXJzOiBbXSxcbiAgICAvLyB9KSxcbiAgXTtcblxuICAvLyB2aXRlLXBsdWdpbi1odG1sXG4gIHZpdGVQbHVnaW5zLnB1c2goY29uZmlnSHRtbFBsdWdpbih2aXRlRW52LCBpc0J1aWxkKSk7XG5cbiAgLy8gdml0ZS1wbHVnaW4tbW9ja1xuICBpZiAoVklURV9VU0VfTU9DSykgdml0ZVBsdWdpbnMucHVzaChjb25maWdNb2NrUGx1Z2luKGlzQnVpbGQsIHByb2RNb2NrKSk7XG5cbiAgaWYgKGlzQnVpbGQpIHtcbiAgICAvLyByb2xsdXAtcGx1Z2luLWd6aXBcbiAgICB2aXRlUGx1Z2lucy5wdXNoKGNvbmZpZ0NvbXByZXNzUGx1Z2luKFZJVEVfQlVJTERfQ09NUFJFU1MsIFZJVEVfQlVJTERfQ09NUFJFU1NfREVMRVRFX09SSUdJTl9GSUxFKSk7XG4gIH1cblxuICByZXR1cm4gdml0ZVBsdWdpbnM7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9jb21wcmVzcy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9jb21wcmVzcy50c1wiOy8qKlxuICogVXNlZCB0byBwYWNrYWdlIGFuZCBvdXRwdXQgZ3ppcC4gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3Qgd29yayBwcm9wZXJseSBpbiBWaXRlLCB0aGUgc3BlY2lmaWMgcmVhc29uIGlzIHN0aWxsIGJlaW5nIGludmVzdGlnYXRlZFxuICogaHR0cHM6Ly9naXRodWIuY29tL2FubmN3Yi92aXRlLXBsdWdpbi1jb21wcmVzc2lvblxuICovXG5pbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IGNvbXByZXNzUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLWNvbXByZXNzaW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ0NvbXByZXNzUGx1Z2luKFxuICBjb21wcmVzczogJ2d6aXAnIHwgJ2Jyb3RsaScgfCAnbm9uZScsXG4gIGRlbGV0ZU9yaWdpbkZpbGUgPSBmYWxzZSxcbik6IFBsdWdpbiB8IFBsdWdpbltdIHtcbiAgY29uc29sZS5sb2coY29tcHJlc3MsICdjb21wcmVzcycpO1xuXG4gIGNvbnN0IGNvbXByZXNzTGlzdCA9IGNvbXByZXNzLnNwbGl0KCcsJyk7XG5cbiAgY29uc3QgcGx1Z2luczogUGx1Z2luW10gPSBbXTtcblxuICBpZiAoY29tcHJlc3NMaXN0LmluY2x1ZGVzKCdnemlwJykpIHtcbiAgICBwbHVnaW5zLnB1c2goXG4gICAgICBjb21wcmVzc1BsdWdpbih7XG4gICAgICAgIGV4dDogJy5neicsXG4gICAgICAgIGRlbGV0ZU9yaWdpbkZpbGUsXG4gICAgICB9KSxcbiAgICApO1xuICB9XG4gIGlmIChjb21wcmVzc0xpc3QuaW5jbHVkZXMoJ2Jyb3RsaScpKSB7XG4gICAgcGx1Z2lucy5wdXNoKFxuICAgICAgY29tcHJlc3NQbHVnaW4oe1xuICAgICAgICBleHQ6ICcuYnInLFxuICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXG4gICAgICAgIGRlbGV0ZU9yaWdpbkZpbGUsXG4gICAgICB9KSxcbiAgICApO1xuICB9XG4gIHJldHVybiBwbHVnaW5zO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9odG1sLnRzXCI7LyoqXG4gKiBQbHVnaW4gdG8gbWluaW1pemUgYW5kIHVzZSBlanMgdGVtcGxhdGUgc3ludGF4IGluIGluZGV4Lmh0bWwuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5uY3diL3ZpdGUtcGx1Z2luLWh0bWxcbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IGNyZWF0ZUh0bWxQbHVnaW4gfSBmcm9tICd2aXRlLXBsdWdpbi1odG1sJztcblxuaW1wb3J0IHBrZyBmcm9tICcuLi8uLi8uLi9wYWNrYWdlLmpzb24nO1xuaW1wb3J0IHsgR0xPQl9DT05GSUdfRklMRV9OQU1FIH0gZnJvbSAnLi4vLi4vY29uc3RhbnQnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnSHRtbFBsdWdpbihlbnY6IFZpdGVFbnYsIGlzQnVpbGQ6IGJvb2xlYW4pIHtcbiAgY29uc3QgeyBWSVRFX0dMT0JfQVBQX1RJVExFLCBWSVRFX0JBU0VfVVJMIH0gPSBlbnY7XG5cbiAgY29uc3QgcGF0aCA9IFZJVEVfQkFTRV9VUkwuZW5kc1dpdGgoJy8nKSA/IFZJVEVfQkFTRV9VUkwgOiBgJHtWSVRFX0JBU0VfVVJMfS9gO1xuXG4gIGNvbnN0IGdldEFwcENvbmZpZ1NyYyA9ICgpID0+IHtcbiAgICByZXR1cm4gYCR7cGF0aH0ke0dMT0JfQ09ORklHX0ZJTEVfTkFNRX0/dj0ke3BrZy52ZXJzaW9ufS0ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWA7XG4gIH07XG5cbiAgY29uc3QgaHRtbFBsdWdpbjogUGx1Z2luT3B0aW9uW10gPSBjcmVhdGVIdG1sUGx1Z2luKHtcbiAgICBtaW5pZnk6IGlzQnVpbGQsXG4gICAgaW5qZWN0OiB7XG4gICAgICAvLyBJbmplY3QgZGF0YSBpbnRvIGVqcyB0ZW1wbGF0ZVxuICAgICAgZGF0YToge1xuICAgICAgICB0aXRsZTogVklURV9HTE9CX0FQUF9USVRMRSxcbiAgICAgIH0sXG4gICAgICAvLyBFbWJlZCB0aGUgZ2VuZXJhdGVkIGFwcC5jb25maWcuanMgZmlsZVxuICAgICAgdGFnczogaXNCdWlsZFxuICAgICAgICA/IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGFnOiAnc2NyaXB0JyxcbiAgICAgICAgICAgICAgYXR0cnM6IHtcbiAgICAgICAgICAgICAgICBzcmM6IGdldEFwcENvbmZpZ1NyYygpLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW10sXG4gICAgfSxcbiAgfSk7XG4gIHJldHVybiBodG1sUGx1Z2luO1xufVxuIiwgIntcbiAgXCJuYW1lXCI6IFwiQHdiL21mLXNoZWxsLWZlXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMS4wXCIsXG4gIFwicHJpdmF0ZVwiOiB0cnVlLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZCAmJiB0c3ggYnVpbGQvc2NyaXB0L3Bvc3RCdWlsZC50c1wiLFxuICAgIFwiYnVpbGQ6bGliXCI6IFwiTElCX0JVSUxEPTEgdml0ZSBidWlsZFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxuICAgIFwidHlwZWNoZWNrXCI6IFwidnVlLXRzYyAtLW5vRW1pdFwiLFxuICAgIFwibGludFwiOiBcImVzbGludCAtLWV4dCAudHMsLnZ1ZSBzcmNcIixcbiAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgXFxcInNyYy8qKi8qLnt0cyx2dWUsY3NzfVxcXCJcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAZ2FyZmlzaC9icm93c2VyLXNuYXBzaG90XCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQGdhcmZpc2gvYnJvd3Nlci12bVwiOiBcIl4xLjE5LjdcIixcbiAgICBcIkBnYXJmaXNoL2NvcmVcIjogXCJeMS4xOS43XCIsXG4gICAgXCJAZ2FyZmlzaC9yb3V0ZXJcIjogXCJeMS4xOS43XCIsXG4gICAgXCJAd2Ivc2hhcmVkXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcImF4aW9zXCI6IFwiXjEuNy43XCIsXG4gICAgXCJwaW5pYVwiOiBcIl4yLjIuN1wiLFxuICAgIFwicGluaWEtcGx1Z2luLXBlcnNpc3RlZHN0YXRlXCI6IFwiXjMuMi4zXCIsXG4gICAgXCJ0ZGVzaWduLWljb25zLXZ1ZS1uZXh0XCI6IFwiXjAuNC4xXCIsXG4gICAgXCJ0ZGVzaWduLXZ1ZS1uZXh0XCI6IFwiXjEuMTcuNlwiLFxuICAgIFwidnVlXCI6IFwiXjMuNS4wXCIsXG4gICAgXCJ2dWUtaTE4blwiOiBcIl45LjE0LjJcIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCJeNC40LjVcIlxuICB9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTQuMjAyXCIsXG4gICAgXCJAdHlwZXMvcXNcIjogXCJeNi4xNC4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4xLjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJeNC4xLjBcIixcbiAgICBcImRhdGUtZm5zXCI6IFwiXjQuMS4wXCIsXG4gICAgXCJlc2xpbnQtcGx1Z2luLXZ1ZVwiOiBcIl45LjI4LjBcIixcbiAgICBcImxlc3NcIjogXCJeNC40LjJcIixcbiAgICBcImxvZGFzaFwiOiBcIl40LjE3LjIxXCIsXG4gICAgXCJtb2NranNcIjogXCJeMS4xLjBcIixcbiAgICBcInBvc3Rjc3NcIjogXCJeOC40LjBcIixcbiAgICBcInBvc3Rjc3MtcHh0b3JlbVwiOiBcIl42LjEuMFwiLFxuICAgIFwicXNcIjogXCJeNi4xNC4wXCIsXG4gICAgXCJ1bm9jc3NcIjogXCJeMC42NC4wXCIsXG4gICAgXCJ1bnBsdWdpbi1hdXRvLWltcG9ydFwiOiBcIl4wLjE3LjZcIixcbiAgICBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzXCI6IFwiXjAuMjYuMFwiLFxuICAgIFwidml0ZVwiOiBcIl41LjQuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tY29tcHJlc3Npb25cIjogXCJeMC41LjFcIixcbiAgICBcInZpdGUtcGx1Z2luLWh0bWxcIjogXCJeMy4yLjBcIixcbiAgICBcInZpdGUtcGx1Z2luLW1vY2tcIjogXCJeMi45LjhcIixcbiAgICBcInZpdGUtc3ZnLWxvYWRlclwiOiBcIl41LjEuMFwiLFxuICAgIFwidnVlLXRzY1wiOiBcIl4yLjEuNlwiXG4gIH1cbn0iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9tb2NrLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL21vY2sudHNcIjsvKipcbiAqIE1vY2sgcGx1Z2luIGZvciBkZXZlbG9wbWVudCBhbmQgcHJvZHVjdGlvbi5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2Ivdml0ZS1wbHVnaW4tbW9ja1xuICovXG5pbXBvcnQgeyB2aXRlTW9ja1NlcnZlIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWdNb2NrUGx1Z2luKGlzQnVpbGQ6IGJvb2xlYW4sIHByb2RNb2NrOiBib29sZWFuKSB7XG4gIHJldHVybiB2aXRlTW9ja1NlcnZlKHtcbiAgICBpZ25vcmU6IC9eXFxfLyxcbiAgICBtb2NrUGF0aDogJ21vY2snLFxuICAgIGxvY2FsRW5hYmxlZDogIWlzQnVpbGQsXG4gICAgcHJvZEVuYWJsZWQ6IGlzQnVpbGQgJiYgcHJvZE1vY2ssXG4gICAgaW5qZWN0Q29kZTogYFxuICAgICAgIGltcG9ydCB7IHNldHVwUHJvZE1vY2tTZXJ2ZXIgfSBmcm9tICcuLi9tb2NrL19jcmVhdGVQcm9kdWN0aW9uU2VydmVyJztcbiBcbiAgICAgICBzZXR1cFByb2RNb2NrU2VydmVyKCk7XG4gICAgICAgYCxcbiAgfSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wcm94eS50c1wiOy8qKlxuICogVXNlZCB0byBwYXJzZSB0aGUgLmVudi5kZXZlbG9wbWVudCBwcm94eSBjb25maWd1cmF0aW9uXG4gKi9cbmltcG9ydCB0eXBlIHsgUHJveHlPcHRpb25zIH0gZnJvbSAndml0ZSc7XG5cbnR5cGUgUHJveHlJdGVtID0gW3N0cmluZywgc3RyaW5nXTtcblxudHlwZSBQcm94eUxpc3QgPSBQcm94eUl0ZW1bXTtcblxudHlwZSBQcm94eVRhcmdldExpc3QgPSBSZWNvcmQ8c3RyaW5nLCBQcm94eU9wdGlvbnMgJiB7IHJld3JpdGU/OiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmcgfT47XG5cbmNvbnN0IGh0dHBzUkUgPSAvXmh0dHBzOlxcL1xcLy87XG5cbi8qKlxuICogR2VuZXJhdGUgcHJveHlcbiAqIEBwYXJhbSBsaXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm94eShsaXN0OiBQcm94eUxpc3QgPSBbXSkge1xuICBjb25zdCByZXQ6IFByb3h5VGFyZ2V0TGlzdCA9IHt9O1xuICBmb3IgKGNvbnN0IFtwcmVmaXgsIHRhcmdldF0gb2YgbGlzdCkge1xuICAgIGNvbnN0IGlzSHR0cHMgPSBodHRwc1JFLnRlc3QodGFyZ2V0KTtcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9odHRwLXBhcnR5L25vZGUtaHR0cC1wcm94eSNvcHRpb25zXG4gICAgcmV0W3ByZWZpeF0gPSB7XG4gICAgICB0YXJnZXQsXG4gICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAvLyB3czogdHJ1ZSxcbiAgICAgIHJld3JpdGU6IChwYXRoKSA9PiB7XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7cHJlZml4fWApLCAnJyk7XG4gICAgICB9LFxuICAgICAgLy8gaHR0cHMgaXMgcmVxdWlyZSBzZWN1cmU9ZmFsc2VcbiAgICAgIC4uLihpc0h0dHBzID8geyBzZWN1cmU6IGZhbHNlIH0gOiB7fSksXG4gICAgfTtcbiAgICBjb25zb2xlLmxvZygncHJveHkgc2V0OicsIHJldCwgcmV0W3ByZWZpeF0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThYLE9BQU8sVUFBVTtBQUMvWSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsY0FBYyxlQUFnRDtBQUN2RSxPQUFPLGFBQWE7OztBQ0RiLElBQU0sd0JBQXdCO0FBRTlCLElBQU0sYUFBYTs7O0FDTDBXLE9BQU8sWUFBWTtBQW9CaFosU0FBUyxXQUFXLFNBQThCO0FBQ3ZELFFBQU0sTUFBVyxDQUFDO0FBRWxCLGFBQVcsV0FBVyxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQzFDLFFBQUksV0FBVyxRQUFRLE9BQU8sRUFBRSxRQUFRLFFBQVEsSUFBSTtBQUNwRCxlQUFXLGFBQWEsU0FBUyxPQUFPLGFBQWEsVUFBVSxRQUFRO0FBRXZFLFFBQUksWUFBWSxhQUFhO0FBQzNCLGlCQUFXLE9BQU8sUUFBUTtBQUFBLElBQzVCO0FBQ0EsUUFBSSxZQUFZLGNBQWM7QUFDNUIsVUFBSTtBQUNGLG1CQUFXLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDaEMsU0FBUyxPQUFPO0FBQUEsTUFBQztBQUFBLElBQ25CO0FBQ0EsUUFBSSxZQUFZLHFCQUFxQjtBQUNuQyxVQUFJO0FBQ0YsbUJBQVcsS0FBSyxNQUFNLFFBQVE7QUFBQSxNQUNoQyxTQUFTLE9BQU87QUFBQSxNQUFDO0FBQUEsSUFDbkI7QUFDQSxRQUFJLE9BQU8sSUFBSTtBQUNmLFlBQVEsSUFBSSxPQUFPLElBQUk7QUFBQSxFQUN6QjtBQUNBLFNBQU87QUFDVDs7O0FDNUN3YSxPQUFPLFNBQVM7QUFDeGIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sWUFBWTtBQUVuQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQUd2QixPQUFPLGVBQWU7OztBQ0h0QixPQUFPLG9CQUFvQjtBQUVwQixTQUFTLHFCQUNkLFVBQ0EsbUJBQW1CLE9BQ0E7QUFDbkIsVUFBUSxJQUFJLFVBQVUsVUFBVTtBQUVo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
