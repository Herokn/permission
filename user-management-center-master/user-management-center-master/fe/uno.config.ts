import { defineConfig, presetUno, presetIcons, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetIcons(), presetAttributify()],
  rules: [
    // 自定义规则：支持 ml-16px, mr-20px 等直接使用 px 的类名，使用 !important 确保优先级
    [
      /^m([trblxy])?-(\d+)px$/,
      ([, d, n]) => {
        const directions = {
          t: 'top',
          r: 'right',
          b: 'bottom',
          l: 'left',
          x: 'left,right',
          y: 'top,bottom',
        }
        const dir = d ? directions[d as keyof typeof directions] : ''
        if (dir) {
          return dir.split(',').reduce(
            (acc, cur) => ({
              ...acc,
              [`margin-${cur}`]: `${n}px !important`,
            }),
            {}
          )
        }
        return { margin: `${n}px !important` }
      },
    ],
    [
      /^p([trblxy])?-(\d+)px$/,
      ([, d, n]) => {
        const directions = {
          t: 'top',
          r: 'right',
          b: 'bottom',
          l: 'left',
          x: 'left,right',
          y: 'top,bottom',
        }
        const dir = d ? directions[d as keyof typeof directions] : ''
        if (dir) {
          return dir.split(',').reduce(
            (acc, cur) => ({
              ...acc,
              [`padding-${cur}`]: `${n}px !important`,
            }),
            {}
          )
        }
        return { padding: `${n}px !important` }
      },
    ],
  ],
})
