// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
import type { AxiosInstance, AxiosResponse } from 'axios'
import { AxiosError } from 'axios'
import isString from 'lodash/isString'
import merge from 'lodash/merge'
import { MessagePlugin } from 'tdesign-vue-next'

import { ContentTypeEnum } from '@/constants'
// import router from '@/router';
// import { useUserStore } from '@/stores';
import type { RequestOptions, Result } from '@/types/axios.d'

import { VAxios } from './Axios'
import type { AxiosTransform, CreateAxiosOptions } from './AxiosTransform'
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils'

const env = import.meta.env.MODE || 'development'

// 如果是mock模式 或 没启用直连代理 就不配置host 会走本地Mock拦截 或 Vite 代理
const host =
  env === 'mock' || !import.meta.env.VITE_IS_REQUEST_PROXY
    ? import.meta.env.VITE_API_URL
    : ''
// 数据处理，方便区分多种处理方式
const transform: AxiosTransform = {
  // 处理请求数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: <T = any>(
    res: AxiosResponse<Result<T>>,
    options: RequestOptions
  ): any => {
    const {
      isTransformResponse,
      isReturnNativeResponse,
      useErrorInterceptors,
    } = options

    // 如果204无内容直接返回
    const method = (res.config.method || '').toLowerCase()
    if (res.status === 204 && ['put', 'patch', 'delete'].includes(method)) {
      return res
    }

    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data
    }
    // console.log('transformRequestHook:', res);

    // 错误的时候返回
    const { data } = res
    if (!data) {
      throw new Error('请求接口错误')
    }
    //  这里 code为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, message } = data

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && [200, 2000].includes(code)
    if (hasSuccess) {
      return data?.result || data || true
    }
    // 开启错误拦截器 才处理错误信息
    // 具体业务可自行配置覆盖
    // useErrorInterceptors: false 即不处理错误信息
    if (useErrorInterceptors) {
      MessagePlugin.error(message)
    }
    // TODO: 接口请求错误，统一提示错误信息
    // 1、通用错误信息 提示：
    // 2、通过 上层 声明参数，控制显示错误信息
    // 3、映射错误码对象 处理，文本弹出错误信息，函数执行 方便上层处理
    // 4、log 中打印 api url 地址 和 错误信息
    // throw new Error(message || `请求接口错误, 错误码: ${code}`);
    console.error(
      '请求接口错误, 错误码: ',
      new Error(message || `请求接口错误, 错误码: ${code}`)
    )
    return null
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const {
      apiUrl,
      isJoinPrefix,
      urlPrefix,
      joinParamsToUrl,
      formatDate,
      joinTime = true,
    } = options

    // 添加接口前缀
    if (isJoinPrefix && urlPrefix && isString(urlPrefix)) {
      config.url = `${urlPrefix}${config.url}`
    }

    // 将baseUrl拼接
    if (apiUrl && isString(apiUrl)) {
      config.url = `${apiUrl}${config.url}`
    }
    const params = config.params || {}
    const data = config.data || false

    if (formatDate && data && !isString(data)) {
      formatRequestDate(data)
    }
    if (config.method?.toUpperCase() === 'GET') {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(
          params || {},
          joinTimestamp(joinTime, false)
        )
      } else {
        // 兼容restful风格
        config.url = `${config.url + params}${joinTimestamp(joinTime, true)}`
        config.params = undefined
      }
    } else if (!isString(params)) {
      if (formatDate) {
        formatRequestDate(params)
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Object.keys(config.data).length > 0 || data instanceof FormData)
      ) {
        config.data = data
        config.params = params
      } else {
        // 非GET请求如果没有提供data，则将params视为data
        config.data = params
        config.params = undefined
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, {
          ...config.params,
          ...config.data,
        })
      }
    } else {
      // 兼容restful风格
      config.url += params
      config.params = undefined
    }
    return config
  },

  // 请求拦截器处理
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    // 从 pinia store 获取已拼接好的完整 token
    let token = ''

    try {
      // 从 pinia store 获取（pinia-plugin-persistedstate 持久化到 localStorage.user）
      const userStoreData = localStorage.getItem('user')
      if (userStoreData) {
        const userData = JSON.parse(userStoreData)
        // token 已经是拼接好的完整值 (tokenType + accessToken)
        token = userData.token || ''
      }
    } catch (e) {
      console.warn('Failed to parse user store data:', e)
    }

    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // Authorization header (用于Node BFF等服务)
      ;(config as Recordable).headers.Authorization = token

      // WB-Access-Token header (用于Java权限服务等)
      ;(config as Recordable).headers['WB-Access-Token'] = token
    }
    return config
  },

  // 响应拦截器处理
  responseInterceptors: (res) => {
    // console.log('responseInterceptors:', res);
    // res.data?.code 为 403 \ 500 \ 4001
    // 将 状态码 赋值给 res.status
    // 将 状态描述 赋值给 res.statusText

    // 处理4001状态码：未授权，清除本地数据并跳转到登录页
    if (res.data?.code === 4001) {
      // 直接清除localStorage和跳转，避免异步导致的问题
      localStorage.clear()
      MessagePlugin.error(
        res.data?.message || 'Session expired, please login again'
      )
      // 跳转到登录页
      window.location.href = '/login'

      const error = new AxiosError(
        res.data?.message || 'Unauthorized',
        'ERR_UNAUTHORIZED',
        res.config,
        undefined,
        res
      )
      return Promise.reject(error)
    }

    if (res.data?.code === 403 || res.data?.code === 500) {
      res.status = res.data?.code
      res.statusText =
        res.data?.message ||
        (res.data?.code === 403 ? 'Forbidden' : 'Server Error')
      const error = new AxiosError(
        res.statusText,
        'ERR_BAD_RESPONSE',
        res.config,
        undefined,
        res
      )
      return Promise.reject(error)
    }
    return res
  },

  // 响应错误处理
  responseInterceptorsCatch: (error: any, instance: AxiosInstance) => {
    const { response, config } = error
    console.log('responseInterceptorsCatch:', response)
    // 处理401未授权错误
    if (response?.status === 401) {
      // TODO：：多语言
      // 显示登录过期提示
      MessagePlugin.error('Unauthorized')
      return Promise.reject(error)
    }

    // 处理403权限不足错误
    if (response?.status === 403) {
      const message = response?.data?.message || '无权限访问此资源'
      MessagePlugin.warning(message)
      return Promise.reject(error)
    }

    if (!config || !config.requestOptions.retry) return Promise.reject(error)

    config.retryCount = config.retryCount || 0

    if (config.retryCount >= config.requestOptions.retry.count)
      return Promise.reject(error)

    config.retryCount += 1

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config)
      }, config.requestOptions.retry.delay || 1)
    })
    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json }
    return backoff.then((conf) => instance.request(conf as any))
  },
}

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    merge(
      <CreateAxiosOptions>{
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // 例如: authenticationScheme: 'Bearer'
        authenticationScheme: '',
        // 超时
        timeout: 50 * 1000,
        // 携带Cookie
        withCredentials: true,
        // 头信息
        headers: { 'Content-Type': ContentTypeEnum.Json },
        // 数据处理方式
        transform,
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 接口地址
          apiUrl: host,
          // 是否自动添加接口前缀
          isJoinPrefix: true,
          // 接口前缀
          // 例如: https://www.baidu.com/api
          // urlPrefix: '/api'
          urlPrefix: import.meta.env.VITE_API_URL_PREFIX,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 是否加入时间戳
          joinTime: true,
          // 是否忽略请求取消令牌
          // 如果启用，则重复请求时不进行处理
          // 如果禁用，则重复请求时会取消当前请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
          // 重试
          retry: {
            count: 3,
            delay: 1000,
          },
          // 是否使用 默认 拦截器
          useErrorInterceptors: true,
        },
      },
      opt || {}
    )
  )
}
export const request = createAxios()
