// vite.config.ts
import path from "node:path";
import { format } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/fe/node_modules/date-fns/index.js";
import { resolve } from "path";
import { defineConfig, loadEnv } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/vite/dist/node/index.js";
import pxtorem from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/postcss-pxtorem/index.js";

// build/constant.ts
var GLOB_CONFIG_FILE_NAME = "assets/app.config.js";
var OUTPUT_DIR = "dist";

// build/utils.ts
import dotenv from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/dotenv/lib/main.js";
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
import vue from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import UnoCSS from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/unocss/dist/vite.mjs";
import { TDesignResolver } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/unplugin-vue-components/dist/resolvers.js";
import AutoImport from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/unplugin-vue-components/dist/vite.js";
import svgLoader from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/vite-svg-loader/index.js";

// build/vite/plugin/compress.ts
import compressPlugin from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/vite-plugin-compression/dist/index.mjs";
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
import { createHtmlPlugin } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/vite-plugin-html/dist/index.mjs";

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
    "vue-clipboard3": "^2.0.0",
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
import { viteMockServe } from "file:///Users/yongqiangzhao/Desktop/WB/coding/applicationCenter/mf-shell/node_modules/vite-plugin-mock/dist/index.js";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiYnVpbGQvY29uc3RhbnQudHMiLCAiYnVpbGQvdXRpbHMudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaW5kZXgudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHMiLCAiYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50cyIsICJwYWNrYWdlLmpzb24iLCAiYnVpbGQvdml0ZS9wbHVnaW4vbW9jay50cyIsICJidWlsZC92aXRlL3Byb3h5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSAnZGF0ZS1mbnMnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiwgdHlwZSBDb25maWdFbnYsIHR5cGUgVXNlckNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcHh0b3JlbSBmcm9tICdwb3N0Y3NzLXB4dG9yZW0nXG5pbXBvcnQgeyBPVVRQVVRfRElSIH0gZnJvbSAnLi9idWlsZC9jb25zdGFudCdcbmltcG9ydCB7IHdyYXBwZXJFbnYgfSBmcm9tICcuL2J1aWxkL3V0aWxzJ1xuaW1wb3J0IHsgY3JlYXRlVml0ZVBsdWdpbnMgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzJ1xuaW1wb3J0IHsgY3JlYXRlUHJveHkgfSBmcm9tICcuL2J1aWxkL3ZpdGUvcHJveHknXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG5jb25zdCB7IGRlcGVuZGVuY2llcywgZGV2RGVwZW5kZW5jaWVzLCBuYW1lLCB2ZXJzaW9uIH0gPSBwa2cgYXMgYW55XG5jb25zdCBDV0QgPSBwcm9jZXNzLmN3ZCgpXG5jb25zdCBfX0FQUF9JTkZPX18gPSB7XG4gIHBrZzogeyBkZXBlbmRlbmNpZXMsIGRldkRlcGVuZGVuY2llcywgbmFtZSwgdmVyc2lvbiB9LFxuICBsYXN0QnVpbGRUaW1lOiBmb3JtYXQobmV3IERhdGUoKSwgJ3l5eXktTU0tZGQgSEg6bW06c3MnKSxcbn1cbmZ1bmN0aW9uIHBhdGhSZXNvbHZlKGRpcjogc3RyaW5nKSB7IHJldHVybiByZXNvbHZlKENXRCwgJy4nLCBkaXIpIH1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IGNvbW1hbmQsIG1vZGUgfTogQ29uZmlnRW52KTogVXNlckNvbmZpZyA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgQ1dEKVxuICBjb25zdCB2aXRlRW52ID0gd3JhcHBlckVudihlbnYpXG4gIGNvbnN0IGlzQnVpbGQgPSBjb21tYW5kID09PSAnYnVpbGQnXG4gIGNvbnN0IGlzTGliID0gcHJvY2Vzcy5lbnYuTElCX0JVSUxEID09PSAnMSdcbiAgY29uc3QgYmFzZVVybCA9ICh2aXRlRW52IGFzIGFueSkuVklURV9CQVNFX1VSTCB8fCAnL2FwcC8nXG4gIGNvbnN0IHBvcnQgPSAodml0ZUVudiBhcyBhbnkpLlZJVEVfUE9SVCB8fCBOdW1iZXIocHJvY2Vzcy5lbnYuUE9SVCB8fCAzMDMwKVxuICBjb25zdCB1c2VQcm94eSA9IG1vZGUgPT09ICdtb2NrJyB8fCBCb29sZWFuKCh2aXRlRW52IGFzIGFueSkuVklURV9JU19SRVFVRVNUX1BST1hZKVxuICBjb25zdCBzZXJ2ZXJQcm94eSA9IHVzZVByb3h5ID8gY3JlYXRlUHJveHkoKHZpdGVFbnYgYXMgYW55KS5WSVRFX1BST1hZIHx8IFtdKSA6IHt9XG4gIGNvbnN0IHByb2RNb2NrID0gKHZpdGVFbnYgYXMgYW55KS5WSVRFX0dMT0JfUFJPRF9NT0NLXG4gIGNvbnN0IGJhc2VDb25maWc6IFVzZXJDb25maWcgPSB7XG4gICAgYmFzZTogYmFzZVVybCxcbiAgICBlc2J1aWxkOiB7fSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW3sgZmluZDogJ0AnLCByZXBsYWNlbWVudDogYCR7cGF0aFJlc29sdmUoJ3NyYycpfS9gIH1dLFxuICAgICAgZGVkdXBlOiBbJ3Z1ZSddLFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgIGxlc3M6IHtcbiAgICAgICAgICBqYXZhc2NyaXB0RW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICBhZGRpdGlvbmFsRGF0YTogYEBpbXBvcnQgXCIke3BhdGgucmVzb2x2ZShDV0QsICdzcmMvc3R5bGVzL3ZhcmlhYmxlcy5sZXNzJyl9XCI7YCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICBweHRvcmVtKHtcbiAgICAgICAgICAgIHJvb3RWYWx1ZTogMTYsXG4gICAgICAgICAgICB1bml0UHJlY2lzaW9uOiA1LFxuICAgICAgICAgICAgcHJvcExpc3Q6IFsnKiddLFxuICAgICAgICAgICAgc2VsZWN0b3JCbGFja0xpc3Q6IFtdLFxuICAgICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICAgIG1lZGlhUXVlcnk6IGZhbHNlLFxuICAgICAgICAgICAgbWluUGl4ZWxWYWx1ZTogMixcbiAgICAgICAgICAgIGV4Y2x1ZGU6IC9ub2RlX21vZHVsZXMvaSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICBwbHVnaW5zOiBjcmVhdGVWaXRlUGx1Z2lucyh2aXRlRW52LCBpc0J1aWxkLCBwcm9kTW9jayksXG4gICAgZGVmaW5lOiB7XG4gICAgICBfX0FQUF9FTlZfXzogSlNPTi5zdHJpbmdpZnkoZW52LkFQUF9FTlYpLFxuICAgICAgX19BUFBfSU5GT19fOiBKU09OLnN0cmluZ2lmeShfX0FQUF9JTkZPX18pLFxuICAgICAgX19WVUVfUFJPRF9IWURSQVRJT05fTUlTTUFUQ0hfREVUQUlMU19fOiBmYWxzZSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG1yOiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIHBvcnQsXG4gICAgICB3YXRjaDogeyB1c2VQb2xsaW5nOiB0cnVlIH0sXG4gICAgICBwcm94eTogc2VydmVyUHJveHksXG4gICAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7IGluY2x1ZGU6IFtdLCBleGNsdWRlOiBbJ3Z1ZS1kZW1pJ10gfSxcbiAgICAvLyBcdTVCOUVcdTlBOENcdTYwMjdcdTUyOUZcdTgwRkRcdUZGMUFcdTZFMzJcdTY3RDNcdTY3ODRcdTVFRkFcdTY1RjZcdTc2ODRcdTk4ODRcdTUyQTBcdThGN0RcdTY4MDdcdTdCN0VcbiAgICBleHBlcmltZW50YWw6IHtcbiAgICAgIHJlbmRlckJ1aWx0VXJsKGZpbGVuYW1lLCB7IGhvc3RUeXBlIH0pIHtcbiAgICAgICAgaWYgKGhvc3RUeXBlID09PSAnanMnKSB7XG4gICAgICAgICAgLy8gXHU3NkY0XHU2M0E1XHU1QzA2IFZJVEVfQkFTRV9VUkwgXHU3Njg0XHU1MDNDXHU2Q0U4XHU1MTY1XHU1MjMwXHU2Nzg0XHU1RUZBXHU0RUE3XHU3MjY5XHU0RTJEXHVGRjBDXHU4MDBDXHU0RTBEXHU2NjJGXHU0RjlEXHU4RDU2IHdpbmRvdyBcdTUzRDhcdTkxQ0ZcbiAgICAgICAgICByZXR1cm4geyBydW50aW1lOiBKU09OLnN0cmluZ2lmeShwYXRoLnBvc2l4LmpvaW4oYmFzZVVybCwgZmlsZW5hbWUpKSB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgcmVsYXRpdmU6IHRydWUgfVxuICAgICAgfSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7IFxuICAgICAgdGFyZ2V0OiAnZXMyMDE1JywgXG4gICAgICBjc3NUYXJnZXQ6ICdjaHJvbWU4MCcsIFxuICAgICAgb3V0RGlyOiBPVVRQVVRfRElSLCBcbiAgICAgIHJlcG9ydENvbXByZXNzZWRTaXplOiBmYWxzZSwgXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDIwMDAsXG4gICAgICAvLyBcdTc4NkVcdTRGRERcdTUyQThcdTYwMDFcdTVCRkNcdTUxNjVcdTc2ODRcdTY1ODdcdTRFRjZcdThERUZcdTVGODRcdTUzMDVcdTU0MkIgYmFzZSBVUkxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH1cbiAgaWYgKCFpc0xpYikgcmV0dXJuIGJhc2VDb25maWdcbiAgcmV0dXJuIHtcbiAgICAuLi5iYXNlQ29uZmlnLFxuICAgIGJ1aWxkOiB7XG4gICAgICAuLi5iYXNlQ29uZmlnLmJ1aWxkLFxuICAgICAgbGliOiB7IGVudHJ5OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2NvbW1vbi9pbmRleC50cycpLCBuYW1lOiAnQmFzaWNDb21tb24nLCBmb3JtYXRzOiBbJ2VzJywgJ3VtZCddLCBmaWxlTmFtZTogJ2NvbW1vbicgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ2F4aW9zJywgJ3RkZXNpZ24tdnVlLW5leHQnXSxcbiAgICAgICAgb3V0cHV0OiB7IGdsb2JhbHM6IHsgdnVlOiAnVnVlJywgYXhpb3M6ICdheGlvcycsICd0ZGVzaWduLXZ1ZS1uZXh0JzogJ1REZXNpZ24nIH0gfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfVxufSlcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL2NvbnN0YW50LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL2NvbnN0YW50LnRzXCI7LyoqXG4gKiBUaGUgbmFtZSBvZiB0aGUgY29uZmlndXJhdGlvbiBmaWxlIGVudGVyZWQgaW4gdGhlIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRcbiAqL1xuZXhwb3J0IGNvbnN0IEdMT0JfQ09ORklHX0ZJTEVfTkFNRSA9ICdhc3NldHMvYXBwLmNvbmZpZy5qcyc7XG5cbmV4cG9ydCBjb25zdCBPVVRQVVRfRElSID0gJ2Rpc3QnO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdXRpbHMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdXRpbHMudHNcIjtpbXBvcnQgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RldkZuKG1vZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZSA9PT0gJ2RldmVsb3BtZW50Jztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvZEZuKG1vZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdG8gZ2VuZXJhdGUgcGFja2FnZSBwcmV2aWV3XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcG9ydE1vZGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiBwcm9jZXNzLmVudi5SRVBPUlQgPT09ICd0cnVlJztcbn1cblxuLy8gUmVhZCBhbGwgZW52aXJvbm1lbnQgdmFyaWFibGUgY29uZmlndXJhdGlvbiBmaWxlcyB0byBwcm9jZXNzLmVudlxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBwZXJFbnYoZW52Q29uZjogUmVjb3JkYWJsZSk6IFZpdGVFbnYge1xuICBjb25zdCByZXQ6IGFueSA9IHt9O1xuXG4gIGZvciAoY29uc3QgZW52TmFtZSBvZiBPYmplY3Qua2V5cyhlbnZDb25mKSkge1xuICAgIGxldCByZWFsTmFtZSA9IGVudkNvbmZbZW52TmFtZV0ucmVwbGFjZSgvXFxcXG4vZywgJ1xcbicpO1xuICAgIHJlYWxOYW1lID0gcmVhbE5hbWUgPT09ICd0cnVlJyA/IHRydWUgOiByZWFsTmFtZSA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogcmVhbE5hbWU7XG5cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfUE9SVCcpIHtcbiAgICAgIHJlYWxOYW1lID0gTnVtYmVyKHJlYWxOYW1lKTtcbiAgICB9XG4gICAgaWYgKGVudk5hbWUgPT09ICdWSVRFX1BST1hZJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVhbE5hbWUgPSBKU09OLnBhcnNlKHJlYWxOYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH1cbiAgICBpZiAoZW52TmFtZSA9PT0gJ1ZJVEVfU0VSVkVSX1BST1hZJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVhbE5hbWUgPSBKU09OLnBhcnNlKHJlYWxOYW1lKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7fVxuICAgIH1cbiAgICByZXRbZW52TmFtZV0gPSByZWFsTmFtZTtcbiAgICBwcm9jZXNzLmVudltlbnZOYW1lXSA9IHJlYWxOYW1lO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgc3RhcnRpbmcgd2l0aCB0aGUgc3BlY2lmaWVkIHByZWZpeFxuICogQHBhcmFtIG1hdGNoIHByZWZpeFxuICogQHBhcmFtIGNvbmZGaWxlcyBleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVudkNvbmZpZyhtYXRjaCA9ICdWSVRFX0dMT0JfJywgY29uZkZpbGVzID0gWycuZW52JywgJy5lbnYudGVzdCcsICcuZW52LnByb2QnXSkge1xuICBsZXQgZW52Q29uZmlnID0ge307XG4gIGNvbmZGaWxlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVudiA9IGRvdGVudi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGl0ZW0pKSk7XG4gICAgICBlbnZDb25maWcgPSB7IC4uLmVudkNvbmZpZywgLi4uZW52IH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKGVudkNvbmZpZykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgcmVnID0gbmV3IFJlZ0V4cChgXigke21hdGNofSlgKTtcbiAgICBpZiAoIXJlZy50ZXN0KGtleSkpIHtcbiAgICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoZW52Q29uZmlnLCBrZXkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBlbnZDb25maWc7XG59XG5cbi8qKlxuICogR2V0IHVzZXIgcm9vdCBkaXJlY3RvcnlcbiAqIEBwYXJhbSBkaXIgZmlsZSBwYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb290UGF0aCguLi5kaXI6IHN0cmluZ1tdKSB7XG4gIHJldHVybiBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgLi4uZGlyKTtcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2luZGV4LnRzXCI7aW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4JztcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnO1xuaW1wb3J0IHsgVERlc2lnblJlc29sdmVyIH0gZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvcmVzb2x2ZXJzJztcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbiwgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyB2aXRlTW9ja1NlcnZlIH0gZnJvbSAndml0ZS1wbHVnaW4tbW9jayc7XG5pbXBvcnQgc3ZnTG9hZGVyIGZyb20gJ3ZpdGUtc3ZnLWxvYWRlcic7XG5cbmltcG9ydCB7IGNvbmZpZ0NvbXByZXNzUGx1Z2luIH0gZnJvbSAnLi9jb21wcmVzcyc7XG5pbXBvcnQgeyBjb25maWdIdG1sUGx1Z2luIH0gZnJvbSAnLi9odG1sJztcbmltcG9ydCB7IGNvbmZpZ01vY2tQbHVnaW4gfSBmcm9tICcuL21vY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVml0ZVBsdWdpbnModml0ZUVudjogYW55LCBpc0J1aWxkOiBib29sZWFuLCBwcm9kTW9jazogYW55KSB7XG4gIGNvbnN0IHsgVklURV9VU0VfTU9DSywgVklURV9CVUlMRF9DT01QUkVTUywgVklURV9CVUlMRF9DT01QUkVTU19ERUxFVEVfT1JJR0lOX0ZJTEUgfSA9IHZpdGVFbnY7XG5cbiAgY29uc3Qgdml0ZVBsdWdpbnM6IChQbHVnaW4gfCBQbHVnaW5bXSB8IFBsdWdpbk9wdGlvbltdKVtdID0gW1xuICAgIC8vIGhhdmUgdG9cbiAgICB2dWUoKSxcbiAgICAvLyBoYXZlIHRvXG4gICAgdnVlSnN4KCksXG4gICAgc3ZnTG9hZGVyKCksXG4gICAgVW5vQ1NTKCksXG4gICAgLy8gVW5vQ1NTKHtcbiAgICAvLyAgIGhtclRvcExldmVsQXdhaXQ6IGZhbHNlLFxuICAgIC8vICAgcnVsZXM6IGNzc1J1bGVycyBhcyBhbnksXG4gICAgLy8gfSksXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3Z1ZS1pMThuJywgJ3BpbmlhJ10sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIC9cXC5bdGpdc3g/JC8sIC8vIC50cywgLnRzeCwgLmpzLCAuanN4XG4gICAgICAgIC9cXC52dWUkLyxcbiAgICAgICAgL1xcLnZ1ZVxcP3Z1ZS8sIC8vIC52dWVcbiAgICAgICAgL1xcLm1kJC8sIC8vIC5tZFxuICAgICAgXSxcbiAgICAgIHJlc29sdmVyczogW1REZXNpZ25SZXNvbHZlcih7IGxpYnJhcnk6ICd2dWUtbmV4dCcgfSldLFxuICAgICAgZHRzOiB0cnVlLFxuICAgIH0pLFxuICAgIC8vXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NjI2Qlx1NjNDRlx1N0VDNFx1NEVGNlx1NzZFRVx1NUY1NVxuICAgICAgZXh0ZW5zaW9uczogWyd2dWUnXSxcbiAgICAgIGRlZXA6IHRydWUsXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJywgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXG4gICAgICByZXNvbHZlcnM6IFtURGVzaWduUmVzb2x2ZXIoeyBsaWJyYXJ5OiAndnVlLW5leHQnIH0pXSxcbiAgICB9KSxcbiAgICAvLyBDb21wb25lbnRzKHtcbiAgICAvLyAgIGR0czogdHJ1ZSxcbiAgICAvLyAgIHJlc29sdmVyczogW10sXG4gICAgLy8gfSksXG4gIF07XG5cbiAgLy8gdml0ZS1wbHVnaW4taHRtbFxuICB2aXRlUGx1Z2lucy5wdXNoKGNvbmZpZ0h0bWxQbHVnaW4odml0ZUVudiwgaXNCdWlsZCkpO1xuXG4gIC8vIHZpdGUtcGx1Z2luLW1vY2tcbiAgaWYgKFZJVEVfVVNFX01PQ0spIHZpdGVQbHVnaW5zLnB1c2goY29uZmlnTW9ja1BsdWdpbihpc0J1aWxkLCBwcm9kTW9jaykpO1xuXG4gIGlmIChpc0J1aWxkKSB7XG4gICAgLy8gcm9sbHVwLXBsdWdpbi1nemlwXG4gICAgdml0ZVBsdWdpbnMucHVzaChjb25maWdDb21wcmVzc1BsdWdpbihWSVRFX0JVSUxEX0NPTVBSRVNTLCBWSVRFX0JVSUxEX0NPTVBSRVNTX0RFTEVURV9PUklHSU5fRklMRSkpO1xuICB9XG5cbiAgcmV0dXJuIHZpdGVQbHVnaW5zO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vY29tcHJlc3MudHNcIjsvKipcbiAqIFVzZWQgdG8gcGFja2FnZSBhbmQgb3V0cHV0IGd6aXAuIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IHdvcmsgcHJvcGVybHkgaW4gVml0ZSwgdGhlIHNwZWNpZmljIHJlYXNvbiBpcyBzdGlsbCBiZWluZyBpbnZlc3RpZ2F0ZWRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbm5jd2Ivdml0ZS1wbHVnaW4tY29tcHJlc3Npb25cbiAqL1xuaW1wb3J0IHR5cGUgeyBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCBjb21wcmVzc1BsdWdpbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWdDb21wcmVzc1BsdWdpbihcbiAgY29tcHJlc3M6ICdnemlwJyB8ICdicm90bGknIHwgJ25vbmUnLFxuICBkZWxldGVPcmlnaW5GaWxlID0gZmFsc2UsXG4pOiBQbHVnaW4gfCBQbHVnaW5bXSB7XG4gIGNvbnNvbGUubG9nKGNvbXByZXNzLCAnY29tcHJlc3MnKTtcblxuICBjb25zdCBjb21wcmVzc0xpc3QgPSBjb21wcmVzcy5zcGxpdCgnLCcpO1xuXG4gIGNvbnN0IHBsdWdpbnM6IFBsdWdpbltdID0gW107XG5cbiAgaWYgKGNvbXByZXNzTGlzdC5pbmNsdWRlcygnZ3ppcCcpKSB7XG4gICAgcGx1Z2lucy5wdXNoKFxuICAgICAgY29tcHJlc3NQbHVnaW4oe1xuICAgICAgICBleHQ6ICcuZ3onLFxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuICBpZiAoY29tcHJlc3NMaXN0LmluY2x1ZGVzKCdicm90bGknKSkge1xuICAgIHBsdWdpbnMucHVzaChcbiAgICAgIGNvbXByZXNzUGx1Z2luKHtcbiAgICAgICAgZXh0OiAnLmJyJyxcbiAgICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxuICAgICAgICBkZWxldGVPcmlnaW5GaWxlLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcGx1Z2lucztcbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcGx1Z2luL2h0bWwudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vaHRtbC50c1wiOy8qKlxuICogUGx1Z2luIHRvIG1pbmltaXplIGFuZCB1c2UgZWpzIHRlbXBsYXRlIHN5bnRheCBpbiBpbmRleC5odG1sLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2FubmN3Yi92aXRlLXBsdWdpbi1odG1sXG4gKi9cbmltcG9ydCB0eXBlIHsgUGx1Z2luT3B0aW9uIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgeyBjcmVhdGVIdG1sUGx1Z2luIH0gZnJvbSAndml0ZS1wbHVnaW4taHRtbCc7XG5cbmltcG9ydCBwa2cgZnJvbSAnLi4vLi4vLi4vcGFja2FnZS5qc29uJztcbmltcG9ydCB7IEdMT0JfQ09ORklHX0ZJTEVfTkFNRSB9IGZyb20gJy4uLy4uL2NvbnN0YW50JztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ0h0bWxQbHVnaW4oZW52OiBWaXRlRW52LCBpc0J1aWxkOiBib29sZWFuKSB7XG4gIGNvbnN0IHsgVklURV9HTE9CX0FQUF9USVRMRSwgVklURV9CQVNFX1VSTCB9ID0gZW52O1xuXG4gIGNvbnN0IHBhdGggPSBWSVRFX0JBU0VfVVJMLmVuZHNXaXRoKCcvJykgPyBWSVRFX0JBU0VfVVJMIDogYCR7VklURV9CQVNFX1VSTH0vYDtcblxuICBjb25zdCBnZXRBcHBDb25maWdTcmMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGAke3BhdGh9JHtHTE9CX0NPTkZJR19GSUxFX05BTUV9P3Y9JHtwa2cudmVyc2lvbn0tJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gO1xuICB9O1xuXG4gIGNvbnN0IGh0bWxQbHVnaW46IFBsdWdpbk9wdGlvbltdID0gY3JlYXRlSHRtbFBsdWdpbih7XG4gICAgbWluaWZ5OiBpc0J1aWxkLFxuICAgIGluamVjdDoge1xuICAgICAgLy8gSW5qZWN0IGRhdGEgaW50byBlanMgdGVtcGxhdGVcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdGl0bGU6IFZJVEVfR0xPQl9BUFBfVElUTEUsXG4gICAgICB9LFxuICAgICAgLy8gRW1iZWQgdGhlIGdlbmVyYXRlZCBhcHAuY29uZmlnLmpzIGZpbGVcbiAgICAgIHRhZ3M6IGlzQnVpbGRcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRhZzogJ3NjcmlwdCcsXG4gICAgICAgICAgICAgIGF0dHJzOiB7XG4gICAgICAgICAgICAgICAgc3JjOiBnZXRBcHBDb25maWdTcmMoKSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdLFxuICAgIH0sXG4gIH0pO1xuICByZXR1cm4gaHRtbFBsdWdpbjtcbn1cbiIsICJ7XG4gIFwibmFtZVwiOiBcIkB3Yi9tZi1zaGVsbC1mZVwiLFxuICBcInZlcnNpb25cIjogXCIwLjEuMFwiLFxuICBcInByaXZhdGVcIjogdHJ1ZSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGQgJiYgdHN4IGJ1aWxkL3NjcmlwdC9wb3N0QnVpbGQudHNcIixcbiAgICBcImJ1aWxkOmxpYlwiOiBcIkxJQl9CVUlMRD0xIHZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIixcbiAgICBcInR5cGVjaGVja1wiOiBcInZ1ZS10c2MgLS1ub0VtaXRcIixcbiAgICBcImxpbnRcIjogXCJlc2xpbnQgLS1leHQgLnRzLC52dWUgc3JjXCIsXG4gICAgXCJmb3JtYXRcIjogXCJwcmV0dGllciAtLXdyaXRlIFxcXCJzcmMvKiovKi57dHMsdnVlLGNzc31cXFwiXCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGdhcmZpc2gvYnJvd3Nlci1zbmFwc2hvdFwiOiBcIl4xLjE5LjdcIixcbiAgICBcIkBnYXJmaXNoL2Jyb3dzZXItdm1cIjogXCJeMS4xOS43XCIsXG4gICAgXCJAZ2FyZmlzaC9jb3JlXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQGdhcmZpc2gvcm91dGVyXCI6IFwiXjEuMTkuN1wiLFxuICAgIFwiQHdiL3NoYXJlZFwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJheGlvc1wiOiBcIl4xLjcuN1wiLFxuICAgIFwicGluaWFcIjogXCJeMi4yLjdcIixcbiAgICBcInBpbmlhLXBsdWdpbi1wZXJzaXN0ZWRzdGF0ZVwiOiBcIl4zLjIuM1wiLFxuICAgIFwidGRlc2lnbi1pY29ucy12dWUtbmV4dFwiOiBcIl4wLjQuMVwiLFxuICAgIFwidGRlc2lnbi12dWUtbmV4dFwiOiBcIl4xLjE3LjZcIixcbiAgICBcInZ1ZVwiOiBcIl4zLjUuMFwiLFxuICAgIFwidnVlLWNsaXBib2FyZDNcIjogXCJeMi4wLjBcIixcbiAgICBcInZ1ZS1pMThuXCI6IFwiXjkuMTQuMlwiLFxuICAgIFwidnVlLXJvdXRlclwiOiBcIl40LjQuNVwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB0eXBlcy9sb2Rhc2hcIjogXCJeNC4xNC4yMDJcIixcbiAgICBcIkB0eXBlcy9xc1wiOiBcIl42LjE0LjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjEuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl40LjEuMFwiLFxuICAgIFwiZGF0ZS1mbnNcIjogXCJeNC4xLjBcIixcbiAgICBcImVzbGludC1wbHVnaW4tdnVlXCI6IFwiXjkuMjguMFwiLFxuICAgIFwibGVzc1wiOiBcIl40LjQuMlwiLFxuICAgIFwibG9kYXNoXCI6IFwiXjQuMTcuMjFcIixcbiAgICBcIm1vY2tqc1wiOiBcIl4xLjEuMFwiLFxuICAgIFwicG9zdGNzc1wiOiBcIl44LjQuMFwiLFxuICAgIFwicG9zdGNzcy1weHRvcmVtXCI6IFwiXjYuMS4wXCIsXG4gICAgXCJxc1wiOiBcIl42LjE0LjBcIixcbiAgICBcInVub2Nzc1wiOiBcIl4wLjY0LjBcIixcbiAgICBcInVucGx1Z2luLWF1dG8taW1wb3J0XCI6IFwiXjAuMTcuNlwiLFxuICAgIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHNcIjogXCJeMC4yNi4wXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuNC4wXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiOiBcIl4wLjUuMVwiLFxuICAgIFwidml0ZS1wbHVnaW4taHRtbFwiOiBcIl4zLjIuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tbW9ja1wiOiBcIl4yLjkuOFwiLFxuICAgIFwidml0ZS1zdmctbG9hZGVyXCI6IFwiXjUuMS4wXCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjIuMS42XCJcbiAgfVxufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lvbmdxaWFuZ3poYW8vRGVza3RvcC9XQi9jb2RpbmcvYXBwbGljYXRpb25DZW50ZXIvbWYtc2hlbGwvZmUvYnVpbGQvdml0ZS9wbHVnaW4vbW9jay50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3BsdWdpbi9tb2NrLnRzXCI7LyoqXG4gKiBNb2NrIHBsdWdpbiBmb3IgZGV2ZWxvcG1lbnQgYW5kIHByb2R1Y3Rpb24uXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5uY3diL3ZpdGUtcGx1Z2luLW1vY2tcbiAqL1xuaW1wb3J0IHsgdml0ZU1vY2tTZXJ2ZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW1vY2snO1xuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnTW9ja1BsdWdpbihpc0J1aWxkOiBib29sZWFuLCBwcm9kTW9jazogYm9vbGVhbikge1xuICByZXR1cm4gdml0ZU1vY2tTZXJ2ZSh7XG4gICAgaWdub3JlOiAvXlxcXy8sXG4gICAgbW9ja1BhdGg6ICdtb2NrJyxcbiAgICBsb2NhbEVuYWJsZWQ6ICFpc0J1aWxkLFxuICAgIHByb2RFbmFibGVkOiBpc0J1aWxkICYmIHByb2RNb2NrLFxuICAgIGluamVjdENvZGU6IGBcbiAgICAgICBpbXBvcnQgeyBzZXR1cFByb2RNb2NrU2VydmVyIH0gZnJvbSAnLi4vbW9jay9fY3JlYXRlUHJvZHVjdGlvblNlcnZlcic7XG4gXG4gICAgICAgc2V0dXBQcm9kTW9ja1NlcnZlcigpO1xuICAgICAgIGAsXG4gIH0pO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMveW9uZ3FpYW5nemhhby9EZXNrdG9wL1dCL2NvZGluZy9hcHBsaWNhdGlvbkNlbnRlci9tZi1zaGVsbC9mZS9idWlsZC92aXRlL3Byb3h5LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy95b25ncWlhbmd6aGFvL0Rlc2t0b3AvV0IvY29kaW5nL2FwcGxpY2F0aW9uQ2VudGVyL21mLXNoZWxsL2ZlL2J1aWxkL3ZpdGUvcHJveHkudHNcIjsvKipcbiAqIFVzZWQgdG8gcGFyc2UgdGhlIC5lbnYuZGV2ZWxvcG1lbnQgcHJveHkgY29uZmlndXJhdGlvblxuICovXG5pbXBvcnQgdHlwZSB7IFByb3h5T3B0aW9ucyB9IGZyb20gJ3ZpdGUnO1xuXG50eXBlIFByb3h5SXRlbSA9IFtzdHJpbmcsIHN0cmluZ107XG5cbnR5cGUgUHJveHlMaXN0ID0gUHJveHlJdGVtW107XG5cbnR5cGUgUHJveHlUYXJnZXRMaXN0ID0gUmVjb3JkPHN0cmluZywgUHJveHlPcHRpb25zICYgeyByZXdyaXRlPzogKHBhdGg6IHN0cmluZykgPT4gc3RyaW5nIH0+O1xuXG5jb25zdCBodHRwc1JFID0gL15odHRwczpcXC9cXC8vO1xuXG4vKipcbiAqIEdlbmVyYXRlIHByb3h5XG4gKiBAcGFyYW0gbGlzdFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJveHkobGlzdDogUHJveHlMaXN0ID0gW10pIHtcbiAgY29uc3QgcmV0OiBQcm94eVRhcmdldExpc3QgPSB7fTtcbiAgZm9yIChjb25zdCBbcHJlZml4LCB0YXJnZXRdIG9mIGxpc3QpIHtcbiAgICBjb25zdCBpc0h0dHBzID0gaHR0cHNSRS50ZXN0KHRhcmdldCk7XG5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaHR0cC1wYXJ0eS9ub2RlLWh0dHAtcHJveHkjb3B0aW9uc1xuICAgIHJldFtwcmVmaXhdID0ge1xuICAgICAgdGFyZ2V0LFxuICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgLy8gd3M6IHRydWUsXG4gICAgICByZXdyaXRlOiAocGF0aCkgPT4ge1xuICAgICAgIFxuICAgICAgICByZXR1cm4gcGF0aC5yZXBsYWNlKG5ldyBSZWdFeHAoYF4ke3ByZWZpeH1gKSwgJycpO1xuICAgICAgfSxcbiAgICAgIC8vIGh0dHBzIGlzIHJlcXVpcmUgc2VjdXJlPWZhbHNlXG4gICAgICAuLi4oaXNIdHRwcyA/IHsgc2VjdXJlOiBmYWxzZSB9IDoge30pLFxuICAgIH07XG4gICAgY29uc29sZS5sb2coJ3Byb3h5IHNldDonLCByZXQsIHJldFtwcmVmaXhdKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4WCxPQUFPLFVBQVU7QUFDL1ksU0FBUyxjQUFjO0FBQ3ZCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGNBQWMsZUFBZ0Q7QUFDdkUsT0FBTyxhQUFhOzs7QUNEYixJQUFNLHdCQUF3QjtBQUU5QixJQUFNLGFBQWE7OztBQ0wwVyxPQUFPLFlBQVk7QUFvQmhaLFNBQVMsV0FBVyxTQUE4QjtBQUN2RCxRQUFNLE1BQVcsQ0FBQztBQUVsQixhQUFXLFdBQVcsT0FBTyxLQUFLLE9BQU8sR0FBRztBQUMxQyxRQUFJLFdBQVcsUUFBUSxPQUFPLEVBQUUsUUFBUSxRQUFRLElBQUk7QUFDcEQsZUFBVyxhQUFhLFNBQVMsT0FBTyxhQUFhLFVBQVUsUUFBUTtBQUV2RSxRQUFJLFlBQVksYUFBYTtBQUMzQixpQkFBVyxPQUFPLFFBQVE7QUFBQSxJQUM1QjtBQUNBLFFBQUksWUFBWSxjQUFjO0FBQzVCLFVBQUk7QUFDRixtQkFBVyxLQUFLLE1BQU0sUUFBUTtBQUFBLE1BQ2hDLFNBQVMsT0FBTztBQUFBLE1BQUM7QUFBQSxJQUNuQjtBQUNBLFFBQUksWUFBWSxxQkFBcUI7QUFDbkMsVUFBSTtBQUNGLG1CQUFXLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDaEMs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QUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsa0JBQWtCLFNBQVMsU0FBUyxRQUFRO0FBQUEsSUFDckQsUUFBUTtBQUFBLE1BQ04sYUFBYSxLQUFLLFVBQVUsSUFBSSxPQUFPO0FBQUEsTUFDdkMsY0FBYyxLQUFLLFVBQVUsWUFBWTtBQUFBLE1BQ3pDLHlDQUF5QztBQUFBLElBQzNDO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixLQUFLO0FBQUEsTUFDTCxNQUFNO0FBQUEsTUFDTjtBQUFBLE1BQ0EsT0FBTyxFQUFFLFlBQVksS0FBSztBQUFBLE1BQzFCLE9BQU87QUFBQSxNQUNQLFlBQVk7QUFBQSxNQUNaLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxRQUNQLCtCQUErQjtBQUFBLE1BQ2pDO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYyxFQUFFLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUU7QUFBQTtBQUFBLElBRW5ELGNBQWM7QUFBQSxNQUNaLGVBQWUsVUFBVSxFQUFFLFNBQVMsR0FBRztBQUNyQyxZQUFJLGFBQWEsTUFBTTtBQUVyQixpQkFBTyxFQUFFLFNBQVMsS0FBSyxVQUFVLEtBQUssTUFBTSxLQUFLLFNBQVMsUUFBUSxDQUFDLEVBQUU7QUFBQSxRQUN2RTtBQUNBLGVBQU8sRUFBRSxVQUFVLEtBQUs7QUFBQSxNQUMxQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLFFBQVE7QUFBQSxNQUNSLHNCQUFzQjtBQUFBLE1BQ3RCLHVCQUF1QjtBQUFBO0FBQUEsTUFFdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsVUFDaEIsZ0JBQWdCO0FBQUEsUUFDbEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxNQUFJLENBQUMsTUFBTyxRQUFPO0FBQ25CLFNBQU87QUFBQSxJQUNMLEdBQUc7QUFBQSxJQUNILE9BQU87QUFBQSxNQUNMLEdBQUcsV0FBVztBQUFBLE1BQ2QsS0FBSyxFQUFFLE9BQU8sS0FBSyxRQUFRLGtDQUFXLHFCQUFxQixHQUFHLE1BQU0sZUFBZSxTQUFTLENBQUMsTUFBTSxLQUFLLEdBQUcsVUFBVSxTQUFTO0FBQUEsTUFDOUgsZUFBZTtBQUFBLFFBQ2IsVUFBVSxDQUFDLE9BQU8sU0FBUyxrQkFBa0I7QUFBQSxRQUM3QyxRQUFRLEVBQUUsU0FBUyxFQUFFLEtBQUssT0FBTyxPQUFPLFNBQVMsb0JBQW9CLFVBQVUsRUFBRTtBQUFBLE1BQ25GO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIiwgInBhdGgiXQp9Cg==
