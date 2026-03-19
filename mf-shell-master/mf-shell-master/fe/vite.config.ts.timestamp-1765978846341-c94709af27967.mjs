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
import { TDesignResolver } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/.pnpm/unplugin-vue-components@0.26.0_vue@3.5.25/node_modules/unplugin-vue-components/dist/resolvers.js";
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
    "@garfish/es-module": "^1.19.7",
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
      resolvers: [TDesignResolver({ library: "vue-next" })],
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
      resolvers: [TDesignResolver({ library: "vue-next" })]
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
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: `@import "${path.resolve(CWD, "src/styles/variables.less")}";`
        }
      },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvY29uc3RhbnQudHMiLCAiYnVpbGQvdXRpbHMudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaW5kZXgudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50cyIsICJwYWNrYWdlLmpzb24iLCAiYnVpbGQvdml0ZS9wbHVnaW4vbW9jay50cyIsICJidWlsZC92aXRlL3Byb3h5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnZGF0ZS1mbnMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcHh0b3JlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nXG5pbXBvcnQgeyBPVVRQVVRfRElSIH0gZnJvbSAnLi9idWlsZC9jb25zdGFudCdcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tICcuL2J1aWxkL3V0aWxzJ1xuaW1wb3J0IHsgY3JlYXRlVml0ZVBsdWdpbnMgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzJ1xuaW1wb3J0IHsgY3JlYXRlUHJveHkgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcHJveHknXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG5jb25zdCB7IGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzLCBuYW1lLCB2ZXJzaW9uIH0gPSBwa2cgYXMgYW55XG5jb25zdCBDV0QgPSBwcm9jZXNzLmN3ZCgpXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XG4gIHBrZzogeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9LFxuICBsYXN0QnVpbGRUaW1lOiBmb3JtYXQobmV3IERhdGUoKSwgJ3l5eXktTU0tZGQgSEg6bW06c3MnKSxcbn1cbmZ1bmN0aW9uIHBhdGhSZXNvbHZlKGRpcjogc3RyaW5nKSB7IHJldHVybiByZXNvbHZlKENXRCwgJy4nLCBkaXIpIH1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfTogQ29uZmlnRW52KTogVXNlckNvbmZpZyA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgQ1dEKVxuICBjb25zdCB2aXRlRW52ID0gd3JhcHBlckVudihlbnYpXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnXG4gIGNvbnN0IGlzTGliID0gcHJvY2Vzcy5lbnYuTElCX0JVSUxEID09PSAnMSdcbiAgY29uc3QgYmFzZVVybCA9ICh2aXRlRW52IGFzIGFueSkuVklURV9CQVNFX1VSTCB8fCAnL2FwcC8nXG4gIGNvbnN0IHBvcnQgPSAodml0ZUVudiBhcyBhbnkpLlZJVEVfUE9SVCB8fCBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDMwKVxuICBjb25zdCB1c2VQcm94eSA9IG1vZGUgPT09ICdtb2NrJyB8fCBCb29sZWFuKCh2aXRlRW52IGFzIGFueSkuVklURV9JU19SRVFVRVNUX1BST1hZKVxuICBjb25zdCBzZXJ2ZXJQcm94eSA9IHVzZVByb3h5ID8gY3JlYXRlUHJveHkoKHZpdGVFbnYgYXMgYW55KS5WSVRFX1BST1hZIHx8IFtdKSA6IHt9XG4gIGNvbnN0IHByb2RNb2NrID0gKHZpdGVFbnYgYXMgYW55KS5WSVRFX0dMT0JfUFJPRF9NT0NLXG4gIGNvbnN0IGJhc2VDb25maWc6IFVzZXJDb25maWcgPSB7XG4gICAgYmFzZTogYmFzZVVybCxcbiAgICBlc2J1aWxkOiB7fSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW3sgZmluZDogJ0AnLCByZXBsYWNlbWVudDogYCR7cGF0aFJlc29sdmUoJ3NyYycpfS9gIH1dLFxuICAgICAgZGVkdXBlOiBbJ3Z1ZSddLFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEBpbXBvcnQgXCIke3BhdGgucmVzb2x2ZShDV0QsICdzcmMvc3R5bGVzL3ZhcmlhYmxlcy5sZXNzJyl9XCI7YCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICBweHRvcmVtKHtcbiAgICAgICAgICAgIHJvb3RWYWx1ZTogMTYsXG4gICAgICAgICAgICB1bml0UHJlY2lzaW9uOiA1LFxuICAgICAgICAgICAgcHJvcExpc3Q6IFsnKiddLFxuICAgICAgICAgICAgc2VsZWN0b3JCbGFja0xpc3Q6IFtdLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lZGlhUXVlcnk6IGZhbHNlLFxuICAgICAgICAgICAgbWluUGl4ZWxWYWx1ZTogMixcbiAgICAgICAgICAgIGV4Y2x1ZGU6IC9ub2RlX21vZHVsZXMvaSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBjcmVhdGVWaXRlUGx1Z2lucyh2aXRlRW52LCBpc0J1aWxkLCBwcm9kTW9jayksXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9FTlZfXzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYpLFxuICAgICAgX19BUFBfSU5GT19fOiBKU09OLnN0cmluZ2lmeShfX0FQUF9JTkZPX18pLFxuICAgICAgX19WVUVfUFJPRF9IWURSQVRJT05fTUlTTUFUQ0hfREVUQUlMU19fOiBmYWxzZSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQsXG4gICAgICB3YXRjaDogeyB1c2VQb2xsaW5nOiB0cnVlIH0sXG4gICAgICBwcm94eTogc2VydmVyUHJveHksXG4gICAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7IGluY2x1ZGU6IFtdLCBleGNsdWRlOiBbJ3Z1ZS1kZW1pJ10gfSxcbiAgICAvLyBcdTVCOUVcdTlBOENcdTYwMjdcdTUyOUZcdTgwRkRcdUZGMUFcdTZFMzJcdTY3RDNcdTY3ODRcdTVFRkFcdTY1RjZcdTc2ODRcdTk4ODRcdTUyQTBcdThGN0RcdTY4MDdcdTdCN0VcbiAgICBleHBlcmltZW50YWw6IHtcbiAgICAgIHJlbmRlckJ1aWx0VXJsKGZpbGVuYW1lLCB7IGhvc3RUeXBlIH0pIHtcbiAgICAgICAgaWYgKGhvc3RUeXBlID09PSAnanMnKSB7XG4gICAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU1QzA2IFZJVEVfQkFTRV9VUkwgXHU3Njg0XHU1MDNDXHU2Q0U4XHU1MTY1XHU1MjMwXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU0RjlEXHU4RDU2IHdpbmRvdyBcdTUzRDhcdTkxQ0ZcbiAgICAgICAgICByZXR1cm4geyBydW50aW1lOiBKU09OLnN0cmluZ2lmeShwYXRoLnBvc2l4LmpvaW4oYmFzZVVybCwgZmlsZW5hbWUpKSB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcmVsYXRpdmU6IHRydWUgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7IFxuICAgICAgdGFyZ2V0OiAnZXMyMDE1JywgXG4gICAgICBjc3NUYXJnZXQ6ICdjaHJvbWU4MCcsIFxuICAgICAgb3V0RGlyOiBPVVRQVVRfRElSLCBcbiAgICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSwgXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXG4gICAgICAvLyBcdTc4NkVcdTRGRERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdTUzMDVcdTU0MkIgYmFzZSBVUkxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdzdGF0aWMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdzdGF0aWMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdzdGF0aWMvW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbiAgaWYgKCFpc0xpYikgcmV0dXJuIGJhc2VDb25maWdcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIGJ1aWxkOiB7XG4gICAgICAuLi5iYXNlQ29uZmlnLmJ1aWxkLFxuICAgICAgbGliOiB7IGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbW1vbi9pbmRleC50cycpLCBuYW1lOiAnQmFzaWNDb21tb24nLCBmb3JtYXRzOiBbJ2VzJywgJ3VtZCddLCBmaWxlTmFtZTogJ2NvbW1vbicgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ2F4aW9zJywgJ3RkZXNpZ24tdnVlLW5leHQnXSxcbiAgICAgICAgb3V0cHV0OiB7IGdsb2JhbHM6IHsgdnVlOiAnVnVlJywgYXhpb3M6ICdheGlvcycsICd0ZGVzaWduLXZ1ZS1uZXh0JzogJ1REZXNpZ24nIH0gfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL2NvbnN0YW50LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL2NvbnN0YW50LnRzXCI7LyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgY29uZmlndXJhdGlvbiBmaWxlIGVudGVyZWQgaW4gdGhlIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEdMT0JfQ09ORklHX0ZJTEVfTkFNRSA9ICdhc3NldHMvYXBwLmNvbmZpZy5qcyc7XG5cbmV4cG9ydCBjb25zdCBPVVRQVVRfRElSID0gJ2Rpc3QnO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdXRpbHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdXRpbHMudHNcIjtpbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldkZuKG1vZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZSA9PT0gJ2RldmVsb3BtZW50Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvZEZuKG1vZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gZ2VuZXJhdGUgcGFja2FnZSBwcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcG9ydE1vZGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiBwcm9jZXNzLmVudi5SRVBPUlQgPT09ICd0cnVlJztcbn1cblxuLy8gUmVhZCBhbGwgZW52aXJvbm1lbnQgdmFyaWFibGUgY29uZmlndXJhdGlvbiBmaWxlcyB0byBwcm9jZXNzLmVudlxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBwZXJFbnYoZW52Q29uZjogUmVjb3JkYWJsZSk6IFZpdGVFbnYge1xuICBjb25zdCByZXQ6IGFueSA9IHt9O1xuXG4gIGZvciAoY29uc3QgZW52TmFtZSBvZiBPYmplY3Qua2V5cyhlbnZDb25mKSkge1xuICAgIGxldCByZWFsTmFtZSA9IGVudkNvbmZbZW52TmFtZV0ucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpO1xuICAgIHJlYWxOYW1lID0gcmVhbE5hbWUgPT09ICd0cnVlJyA/IHRydWUgOiByZWFsTmFtZSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogcmVhbE5hbWU7XG5cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfUE9SVCcpIHtcbiAgICAgIHJlYWxOYW1lID0gTnVtYmVyKHJlYWxOYW1lKTtcbiAgICB9XG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1BST1hZJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVhbE5hbWUgPSBKU09OLnBhcnNlKHJlYWxOYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH1cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfU0VSVkVSX1BST1hZJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVhbE5hbWUgPSBKU09OLnBhcnNlKHJlYWxOYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH1cbiAgICByZXRbZW52TmFtZV0gPSByZWFsTmFtZTtcbiAgICBwcm9jZXNzLmVudltlbnZOYW1lXSA9IHJlYWxOYW1lO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCB0aGUgc3BlY2lmaWVkIHByZWZpeFxuICogQHBhcmFtIG1hdGNoIHByZWZpeFxuICogQHBhcmFtIGNvbmZGaWxlcyBleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudkNvbmZpZyhtYXRjaCA9ICdWSVRFX0dMT0JfJywgY29uZkZpbGVzID0gWycuZW52JywgJy5lbnYudGVzdCcsICcuZW52LnByb2QnXSkge1xuICBsZXQgZW52Q29uZmlnID0ge307XG4gIGNvbmZGaWxlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudiA9IGRvdGVudi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGl0ZW0pKSk7XG4gICAgICBlbnZDb25maWcgPSB7IC4uLmVudkNvbmZpZywgLi4uZW52IH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKGVudkNvbmZpZykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgcmVnID0gbmV3IFJlZ0V4cChgXigke21hdGNofSlgKTtcbiAgICBpZiAoIXJlZy50ZXN0KGtleSkpIHtcbiAgICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoZW52Q29uZmlnLCBrZXkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBlbnZDb25maWc7XG59XG5cbi8qKlxuICogR2V0IHVzZXIgcm9vdCBkaXJlY3RvcnlcbiAqIEBwYXJhbSBkaXIgZmlsZSBwYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290UGF0aCguLi5kaXI6IHN0cmluZ1tdKSB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgLi4uZGlyKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzXCI7aW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgVERlc2lnblJlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyB2aXRlTW9ja1NlcnZlIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jayc7XG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcic7XG5cbmltcG9ydCB7IGNvbmZpZ0NvbXByZXNzUGx1Z2luIH0gZnJvbSAnLi9jb21wcmVzcyc7XG5pbXBvcnQgeyBjb25maWdIdG1sUGx1Z2luIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IGNvbmZpZ01vY2tQbHVnaW4gfSBmcm9tICcuL21vY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVml0ZVBsdWdpbnModml0ZUVudjogYW55LCBpc0J1aWxkOiBib29sZWFuLCBwcm9kTW9jazogYW55KSB7XG4gIGNvbnN0IHsgVklURV9VU0VfTU9DSywgVklURV9CVUlMRF9DT01QUkVTUywgVklURV9CVUlMRF9DT01QUkVTU19ERUxFVEVfT1JJR0lOX0ZJTEUgfSA9IHZpdGVFbnY7XG5cbiAgY29uc3Qgdml0ZVBsdWdpbnM6IChQbHVnaW4gfCBQbHVnaW5bXSB8IFBsdWdpbk9wdGlvbltdKVtdID0gW1xuICAgIC8vIGhhdmUgdG9cbiAgICB2dWUoKSxcbiAgICAvLyBoYXZlIHRvXG4gICAgdnVlSnN4KCksXG4gICAgc3ZnTG9hZGVyKCksXG4gICAgVW5vQ1NTKCksXG4gICAgLy8gVW5vQ1NTKHtcbiAgICAvLyAgIGhtclRvcExldmVsQXdhaXQ6IGZhbHNlLFxuICAgIC8vICAgcnVsZXM6IGNzc1J1bGVycyBhcyBhbnksXG4gICAgLy8gfSksXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3Z1ZS1pMThuJywgJ3BpbmlhJ10sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC9cXC5bdGpdc3g/JC8sIC8vIC50cywgLnRzeCwgLmpzLCAuanN4XG4gICAgICAgIC9cXC52dWUkLyxcbiAgICAgICAgL1xcLnZ1ZVxcP3Z1ZS8sIC8vIC52dWVcbiAgICAgICAgL1xcLm1kJC8sIC8vIC5tZFxuICAgICAgXSxcbiAgICAgIHJlc29sdmVyczogW1REZXNpZ25SZXNvbHZlcih7IGxpYnJhcnk6ICd2dWUtbmV4dCcgfSldLFxuICAgICAgZHRzOiB0cnVlLFxuICAgIH0pLFxuICAgIC8vXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICAgICAgZXh0ZW5zaW9uczogWyd2dWUnXSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJywgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXG4gICAgICByZXNvbHZlcnM6IFtURGVzaWduUmVzb2x2ZXIoeyBsaWJyYXJ5OiAndnVlLW5leHQnIH0pXSxcbiAgICB9KSxcbiAgICAvLyBDb21wb25lbnRzKHtcbiAgICAvLyAgIGR0czogdHJ1ZSxcbiAgICAvLyAgIHJlc29sdmVyczogW10sXG4gICAgLy8gfSksXG4gIF07XG5cbiAgLy8gdml0ZS1wbHVnaW4taHRtbFxuICB2aXRlUGx1Z2lucy5wdXNoKGNvbmZpZ0h0bWxQbHVnaW4odml0ZUVudiwgaXNCdWlsZCkpO1xuXG4gIC8vIHZpdGUtcGx1Z2luLW1vY2tcbiAgaWYgKFZJVEVfVVNFX01PQ0spIHZpdGVQbHVnaW5zLnB1c2goY29uZmlnTW9ja1BsdWdpbihpc0J1aWxkLCBwcm9kTW9jaykpO1xuXG4gIGlmIChpc0J1aWxkKSB7XG4gICAgLy8gcm9sbHVwLXBsdWdpbi1nemlwXG4gICAgdml0ZVBsdWdpbnMucHVzaChjb25maWdDb21wcmVzc1BsdWdpbihWSVRFX0JVSUxEX0NPTVBSRVNTLCBWSVRFX0JVSUxEX0NPTVBSRVNTX0RFTEVURV9PUklHSU5fRklMRSkpO1xuICB9XG5cbiAgcmV0dXJuIHZpdGVQbHVnaW5zO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHNcIjsvKipcbiAqIFVzZWQgdG8gcGFja2FnZSBhbmQgb3V0cHV0IGd6aXAuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IHdvcmsgcHJvcGVybHkgaW4gVml0ZSwgdGhlIHNwZWNpZmljIHJlYXNvbiBpcyBzdGlsbCBiZWluZyBpbnZlc3RpZ2F0ZWRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2Ivdml0ZS1wbHVnaW4tY29tcHJlc3Npb25cbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCBjb21wcmVzc1BsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWdDb21wcmVzc1BsdWdpbihcbiAgY29tcHJlc3M6ICdnemlwJyB8ICdicm90bGknIHwgJ25vbmUnLFxuICBkZWxldGVPcmlnaW5GaWxlID0gZmFsc2UsXG4pOiBQbHVnaW4gfCBQbHVnaW5bXSB7XG4gIGNvbnNvbGUubG9nKGNvbXByZXNzLCAnY29tcHJlc3MnKTtcblxuICBjb25zdCBjb21wcmVzc0xpc3QgPSBjb21wcmVzcy5zcGxpdCgnLCcpO1xuXG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbltdID0gW107XG5cbiAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcygnZ3ppcCcpKSB7XG4gICAgcGx1Z2lucy5wdXNoKFxuICAgICAgY29tcHJlc3NQbHVnaW4oe1xuICAgICAgICBleHQ6ICcuZ3onLFxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuICBpZiAoY29tcHJlc3NMaXN0LmluY2x1ZGVzKCdicm90bGknKSkge1xuICAgIHBsdWdpbnMucHVzaChcbiAgICAgIGNvbXByZXNzUGx1Z2luKHtcbiAgICAgICAgZXh0OiAnLmJyJyxcbiAgICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcGx1Z2lucztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2h0bWwudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50c1wiOy8qKlxuICogUGx1Z2luIHRvIG1pbmltaXplIGFuZCB1c2UgZWpzIHRlbXBsYXRlIHN5bnRheCBpbiBpbmRleC5odG1sLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FubmN3Yi92aXRlLXBsdWdpbi1odG1sXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCc7XG5cbmltcG9ydCBwa2cgZnJvbSAnLi4vLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7IEdMT0JfQ09ORklHX0ZJTEVfTkFNRSB9IGZyb20gJy4uLy4uL2NvbnN0YW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ0h0bWxQbHVnaW4oZW52OiBWaXRlRW52LCBpc0J1aWxkOiBib29sZWFuKSB7XG4gIGNvbnN0IHsgVklURV9HTE9CX0FQUF9USVRMRSwgVklURV9CQVNFX1VSTCB9ID0gZW52O1xuXG4gIGNvbnN0IHBhdGggPSBWSVRFX0JBU0VfVVJMLmVuZHNXaXRoKCcvJykgPyBWSVRFX0JBU0VfVVJMIDogYCR7VklURV9CQVNFX1VSTH0vYDtcblxuICBjb25zdCBnZXRBcHBDb25maWdTcmMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGAke3BhdGh9JHtHTE9CX0NPTkZJR19GSUxFX05BTUV9P3Y9JHtwa2cudmVyc2lvbn0tJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gO1xuICB9O1xuXG4gIGNvbnN0IGh0bWxQbHVnaW46IFBsdWdpbk9wdGlvbltdID0gY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgbWluaWZ5OiBpc0J1aWxkLFxuICAgIGluamVjdDoge1xuICAgICAgLy8gSW5qZWN0IGRhdGEgaW50byBlanMgdGVtcGxhdGVcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGl0bGU6IFZJVEVfR0xPQl9BUFBfVElUTEUsXG4gICAgICB9LFxuICAgICAgLy8gRW1iZWQgdGhlIGdlbmVyYXRlZCBhcHAuY29uZmlnLmpzIGZpbGVcbiAgICAgIHRhZ3M6IGlzQnVpbGRcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRhZzogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgc3JjOiBnZXRBcHBDb25maWdTcmMoKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdLFxuICAgIH0sXG4gIH0pO1xuICByZXR1cm4gaHRtbFBsdWdpbjtcbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcIkB3Yi9tZi1zaGVsbC1mZVwiLFxuICBcInZlcnNpb25cIjogXCIwLjEuMFwiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGQgJiYgdHN4IGJ1aWxkL3NjcmlwdC9wb3N0QnVpbGQudHNcIixcbiAgICBcImJ1aWxkOmxpYlwiOiBcIkxJQl9CVUlMRD0xIHZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInR5cGVjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXRcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLS1leHQgLnRzLC52dWUgc3JjXCIsXG4gICAgXCJmb3JtYXRcIjogXCJwcmV0dGllciAtLXdyaXRlIFxcXCJzcmMvKiovKi57dHMsdnVlLGNzc31cXFwiXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdhcmZpc2gvZXMtbW9kdWxlXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQGdhcmZpc2gvYnJvd3Nlci1zbmFwc2hvdFwiOiBcIl4xLjE5LjdcIixcbiAgICBcIkBnYXJmaXNoL2Jyb3dzZXItdm1cIjogXCJeMS4xOS43XCIsXG4gICAgXCJAZ2FyZmlzaC9jb3JlXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQGdhcmZpc2gvcm91dGVyXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQHdiL3NoYXJlZFwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjcuN1wiLFxuICAgIFwicGluaWFcIjogXCJeMi4yLjdcIixcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIl4zLjIuM1wiLFxuICAgIFwidGRlc2lnbi1pY29ucy12dWUtbmV4dFwiOiBcIl4wLjQuMVwiLFxuICAgIFwidGRlc2lnbi12dWUtbmV4dFwiOiBcIl4xLjE3LjZcIixcbiAgICBcInZ1ZVwiOiBcIl4zLjUuMFwiLFxuICAgIFwidnVlLWkxOG5cIjogXCJeOS4xNC4yXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC41XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHR5cGVzL2xvZGFzaFwiOiBcIl40LjE0LjIwMlwiLFxuICAgIFwiQHR5cGVzL3FzXCI6IFwiXjYuMTQuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiXjUuMS4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI6IFwiXjQuMS4wXCIsXG4gICAgXCJkYXRlLWZuc1wiOiBcIl40LjEuMFwiLFxuICAgIFwiZXNsaW50LXBsdWdpbi12dWVcIjogXCJeOS4yOC4wXCIsXG4gICAgXCJsZXNzXCI6IFwiXjQuNC4yXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwibW9ja2pzXCI6IFwiXjEuMS4wXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4wXCIsXG4gICAgXCJwb3N0Y3NzLXB4dG9yZW1cIjogXCJeNi4xLjBcIixcbiAgICBcInFzXCI6IFwiXjYuMTQuMFwiLFxuICAgIFwidW5vY3NzXCI6IFwiXjAuNjQuMFwiLFxuICAgIFwidW5wbHVnaW4tYXV0by1pbXBvcnRcIjogXCJeMC4xNy42XCIsXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI2LjBcIixcbiAgICBcInZpdGVcIjogXCJeNS40LjBcIixcbiAgICBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI6IFwiXjAuNS4xXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1odG1sXCI6IFwiXjMuMi4wXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1tb2NrXCI6IFwiXjIuOS44XCIsXG4gICAgXCJ2aXRlLXN2Zy1sb2FkZXJcIjogXCJeNS4xLjBcIixcbiAgICBcInZ1ZS10c2NcIjogXCJeMi4xLjZcIlxuICB9XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9tb2NrLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL21vY2sudHNcIjsvKipcbiAqIE1vY2sgcGx1Z2luIGZvciBkZXZlbG9wbWVudCBhbmQgcHJvZHVjdGlvbi5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2Ivdml0ZS1wbHVnaW4tbW9ja1xuICovXG5pbXBvcnQgeyB2aXRlTW9ja1NlcnZlIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jayc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWdNb2NrUGx1Z2luKGlzQnVpbGQ6IGJvb2xlYW4sIHByb2RNb2NrOiBib29sZWFuKSB7XG4gIHJldHVybiB2aXRlTW9ja1NlcnZlKHtcbiAgICBpZ25vcmU6IC9eXFxfLyxcbiAgICBtb2NrUGF0aDogJ21vY2snLFxuICAgIGxvY2FsRW5hYmxlZDogIWlzQnVpbGQsXG4gICAgcHJvZEVuYWJsZWQ6IGlzQnVpbGQgJiYgcHJvZE1vY2ssXG4gICAgaW5qZWN0Q29kZTogYFxuICAgICAgIGltcG9ydCB7IHNldHVwUHJvZE1vY2tTZXJ2ZXIgfSBmcm9tICcuLi9tb2NrL19jcmVhdGVQcm9kdWN0aW9uU2VydmVyJztcbiBcbiAgICAgICBzZXR1cFByb2RNb2NrU2VydmVyKCk7XG4gICAgICAgYCxcbiAgfSk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcHJveHkudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wcm94eS50c1wiOy8qKlxuICogVXNlZCB0byBwYXJzZSB0aGUgLmVudi5kZXZlbG9wbWVudCBwcm94eSBjb25maWd1cmF0aW9uXG4gKi9cbmltcG9ydCB0eXBlIHsgUHJveHlPcHRpb25zIH0gZnJvbSAndml0ZSc7XG5cbnR5cGUgUHJveHlJdGVtID0gW3N0cmluZywgc3RyaW5nXTtcblxudHlwZSBQcm94eUxpc3QgPSBQcm94eUl0ZW1bXTtcblxudHlwZSBQcm94eVRhcmdldExpc3QgPSBSZWNvcmQ8c3RyaW5nLCBQcm94eU9wdGlvbnMgJiB7IHJld3JpdGU/OiAocGF0aDogc3RyaW5nKSA9PiBzdHJpbmcgfT47XG5cbmNvbnN0IGh0dHBzUkUgPSAvXmh0dHBzOlxcL1xcLy87XG5cbi8qKlxuICogR2VuZXJhdGUgcHJveHlcbiAqIEBwYXJhbSBsaXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm94eShsaXN0OiBQcm94eUxpc3QgPSBbXSkge1xuICBjb25zdCByZXQ6IFByb3h5VGFyZ2V0TGlzdCA9IHt9O1xuICBmb3IgKGNvbnN0IFtwcmVmaXgsIHRhcmdldF0gb2YgbGlzdCkge1xuICAgIGNvbnN0IGlzSHR0cHMgPSBodHRwc1JFLnRlc3QodGFyZ2V0KTtcblxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9odHRwLXBhcnR5L25vZGUtaHR0cC1wcm94eSNvcHRpb25zXG4gICAgcmV0W3ByZWZpeF0gPSB7XG4gICAgICB0YXJnZXQsXG4gICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAvLyB3czogdHJ1ZSxcbiAgICAgIHJld3JpdGU6IChwYXRoKSA9PiB7XG4gICAgICAgIHJldHVybiBwYXRoLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7cHJlZml4fWApLCAnJyk7XG4gICAgICB9LFxuICAgICAgLy8gaHR0cHMgaXMgcmVxdWlyZSBzZWN1cmU9ZmFsc2VcbiAgICAgIC4uLihpc0h0dHBzID8geyBzZWN1cmU6IGZhbHNlIH0gOiB7fSksXG4gICAgfTtcbiAgICBjb25zb2xlLmxvZygncHJveHkgc2V0OicsIHJldCwgcmV0W3ByZWZpeF0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThYLE9BQU8sVUFBVTtBQUMvWSxTQUFTLGNBQWM7QUFDdkIsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsY0FBYyxlQUFnRDtBQUN2RSxPQUFPLGFBQWE7OztBQ0RiLElBQU0sd0JBQXdCO0FBRTlCLElBQU0sYUFBYTs7O0FDTDBXLE9BQU8sWUFBWTtBQW9CaFosU0FBUyxXQUFXLFNBQThCO0FBQ3ZELFFBQU0sTUFBVyxDQUFDO0FBRWxCLGFBQVcsV0FBVyxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQzFDLFFBQUksV0FBVyxRQUFRLE9BQU8sRUFBRSxRQUFRLFFBQVEsSUFBSTtBQUNwRCxlQUFXLGFBQWEsU0FBUyxPQUFPLGFBQWEsVUFBVSxRQUFRO0FBRXZFLFFBQUksWUFBWSxhQUFhO0FBQzNCLGlCQUFXLE9BQU8sUUFBUTtBQUFBLElBQzVCO0FBQ0EsUUFBSSxZQUFZLGNBQWM7QUFDNUIsVUFBSTtBQUNGLG1CQUFXLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDaEMsU0FBUyxPQUFPO0FBQUEsTUFBQztBQUFBLElBQ25CO0FBQ0EsUUFBSSxZQUFZLHFCQUFxQjtBQUNuQyxVQUFJO0FBQ0YsbUJBQVcsS0FBSyxNQUFNLFFBQVE7QUFB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LFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxrQkFBa0IsU0FBUyxTQUFTLFFBQVE7QUFBQSxJQUNyRCxRQUFRO0FBQUEsTUFDTixhQUFhLEtBQUssVUFBVSxJQUFJLE9BQU87QUFBQSxNQUN2QyxjQUFjLEtBQUssVUFBVSxZQUFZO0FBQUEsTUFDekMseUNBQXlDO0FBQUEsSUFDM0M7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLE1BQU07QUFBQSxNQUNOO0FBQUEsTUFDQSxPQUFPLEVBQUUsWUFBWSxLQUFLO0FBQUEsTUFDMUIsT0FBTztBQUFBLE1BQ1AsWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLFFBQ1AsK0JBQStCO0FBQUEsTUFDakM7QUFBQSxJQUNGO0FBQUEsSUFDQSxjQUFjLEVBQUUsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRTtBQUFBO0FBQUEsSUFFbkQsY0FBYztBQUFBLE1BQ1osZUFBZSxVQUFVLEVBQUUsU0FBUyxHQUFHO0FBQ3JDLFlBQUksYUFBYSxNQUFNO0FBRXJCLGlCQUFPLEVBQUUsU0FBUyxLQUFLLFVBQVUsS0FBSyxNQUFNLEtBQUssU0FBUyxRQUFRLENBQUMsRUFBRTtBQUFBLFFBQ3ZFO0FBQ0EsZUFBTyxFQUFFLFVBQVUsS0FBSztBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1Isc0JBQXNCO0FBQUEsTUFDdEIsdUJBQXVCO0FBQUE7QUFBQSxNQUV2QixlQUFlO0FBQUEsUUFDYixRQUFRO0FBQUEsVUFDTixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxVQUNoQixnQkFBZ0I7QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLE1BQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsU0FBTztBQUFBLElBQ0wsR0FBRztBQUFBLElBQ0gsT0FBTztBQUFBLE1BQ0wsR0FBRyxXQUFXO0FBQUEsTUFDZCxLQUFLLEVBQUUsT0FBTyxLQUFLLFFBQVEsa0NBQVcscUJBQXFCLEdBQUcsTUFBTSxlQUFlLFNBQVMsQ0FBQyxNQUFNLEtBQUssR0FBRyxVQUFVLFNBQVM7QUFBQSxNQUM5SCxlQUFlO0FBQUEsUUFDYixVQUFVLENBQUMsT0FBTyxTQUFTLGtCQUFrQjtBQUFBLFFBQzdDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxPQUFPLE9BQU8sU0FBUyxvQkFBb0IsVUFBVSxFQUFFO0FBQUEsTUFDbkY7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiLCAicGF0aCJdCn0K
