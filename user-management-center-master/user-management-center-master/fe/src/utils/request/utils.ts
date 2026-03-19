import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export function joinTimestamp<T extends boolean>(join: boolean, restful: T): T extends true ? string : object;

export function joinTimestamp(join: boolean, restful = false): string | object {
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

// 格式化提交参数时间
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  for (const key in params) {
    // eslint-disable-next-line no-underscore-dangle
    if (params[key] && params[key]._isAMomentObject) {
      params[key] = params[key].format(DATE_TIME_FORMAT);
    }
    if (isString(key)) {
      const value = params[key];
      if (value) {
        try {
          params[key] = isString(value) ? value.trim() : value;
        } catch (error: any) {
          throw new Error(error);
        }
      }
    }
    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}

// 将对象转为Url参数
export function setObjToUrlParams(baseUrl: string, obj: { [index: string]: any }): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

import type { AxiosRequestConfig } from 'axios';

import type { RequestOptions } from '@/types/axios';
import { request } from '@/utils/request';

/**
 * 创建带有 URL 前缀的 API 请求包装器
 * @param urlPrefix URL 前缀
 * @returns 返回包装后的请求方法对象
 */
export function createApiWithOptions(opt: RequestOptions | {} = {}) {
  return {
    get: <T = any>(config: AxiosRequestConfig, options?: RequestOptions) =>
      request.get<T>(config, { ...opt, ...options }),
    post: <T = any>(config: AxiosRequestConfig, options?: RequestOptions) =>
      request.post<T>(config, { ...opt, ...options }),
    put: <T = any>(config: AxiosRequestConfig, options?: RequestOptions) =>
      request.put<T>(config, { ...opt, ...options }),
    delete: <T = any>(config: AxiosRequestConfig, options?: RequestOptions) =>
      request.delete<T>(config, { ...opt, ...options }),
  };
}
