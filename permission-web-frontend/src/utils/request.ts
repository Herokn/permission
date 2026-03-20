import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { ApiResponse } from '@/types';
import { refreshToken } from '@/services/api';
import { decodeUserFromSession, encodeUserForSession } from '@/utils/userStorage';

// Token 变化事件
export const TOKEN_CHANGED_EVENT = 'auth:token-changed';

// 401 跳转标志位（防止重复跳转）
let isRedirectingToLogin = false;

// 是否正在刷新 Token
let isRefreshing = false;

// 等待刷新完成的请求队列
let refreshSubscribers: ((success: boolean) => void)[] = [];

// 用户信息存储键（仅存储用户基本信息，Token 由 httpOnly Cookie 管理）
const USER_INFO_KEY = 'user_info';

const subscribeTokenRefresh = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

export const emitTokenChanged = () => {
  window.dispatchEvent(new CustomEvent(TOKEN_CHANGED_EVENT));
};

export const setUserInfo = (userInfo: unknown) => {
  const encoded = encodeUserForSession(userInfo);
  if (encoded) {
    sessionStorage.setItem(USER_INFO_KEY, encoded);
  } else {
    sessionStorage.removeItem(USER_INFO_KEY);
  }
};

export const getUserInfo = (): unknown => {
  try {
    const info = sessionStorage.getItem(USER_INFO_KEY);
    if (!info) return null;
    const parsed = decodeUserFromSession(info);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('getUserInfo: 无效的用户信息，已清除');
      sessionStorage.removeItem(USER_INFO_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('getUserInfo: 解析用户信息失败，已清除', e);
    sessionStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};

export const clearAuth = () => {
  sessionStorage.removeItem(USER_INFO_KEY);
  emitTokenChanged();
};

/**
 * 检查是否已登录（通过用户信息判断，Token 由 Cookie 自动管理）
 */
export const isAuthenticated = (): boolean => {
  return !!getUserInfo();
};

/**
 * 验证重定向 URL 是否安全（防止开放重定向攻击）
 * 只允许：相对路径（/开头）或同源 URL
 */
export const isSafeRedirectUrl = (url: string | null): boolean => {
  if (!url) return false;

  // 允许相对路径（以 / 开头且不以 // 开头）
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    // 检查是否为同源 URL
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    // URL 解析失败（如以 // 开头的协议相对 URL），视为不安全
    return false;
  }
};

/**
 * 执行安全跳转，如果 URL 不安全则跳转到首页
 */
export const safeRedirect = (url: string | null): void => {
  if (isSafeRedirectUrl(url)) {
    window.location.href = url!;
  } else {
    // URL 不安全，跳转到首页
    window.location.href = '/';
  }
};

/**
 * 创建 Axios 实例
 * Cookie 模式：Token 通过 httpOnly Cookie 自动发送，无需手动添加 Authorization Header
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  axiosRetry(instance, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return false;
      }
      if (axiosRetry.isNetworkError(error)) {
        return true;
      }
      return !error.response && (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT');
    },
  });

  // 响应拦截器：处理错误
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const { data } = response;
      
      // 业务错误
      if (data.code !== 200) {
        return Promise.reject(new Error(data.message || '请求失败'));
      }
      
      return response;
    },
    async (error: AxiosError<ApiResponse>) => {
      const requestUrl = error.config?.url || '';
      const isRefreshRequest = requestUrl.includes('/auth/refresh');

      // 401 未授权，尝试静默续期
      if (error.response?.status === 401) {
        if (isRefreshRequest) {
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            clearAuth();
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              sessionStorage.setItem('redirect_after_login', currentPath);
            }
            safeRedirect('/login');
          }
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }

        // 如果已经在刷新 Token，等待刷新结果
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((success) => {
              if (success) {
                // 刷新成功，重试原请求
                const config = error.config!;
                resolve(instance.request(config));
              } else {
                // 刷新失败，跳转登录
                reject(new Error('登录已过期，请重新登录'));
              }
            });
          });
        }

        isRefreshing = true;
        
        try {
          // 尝试刷新 Token
          await refreshToken();
          isRefreshing = false;
          onTokenRefreshed(true);
          emitTokenChanged();
          
          // 刷新成功，重试原请求
          const config = error.config!;
          return instance.request(config);
        } catch (refreshError) {
          isRefreshing = false;
          onTokenRefreshed(false);
          
          // 刷新失败，跳转登录
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true;
            clearAuth();
            // 存储当前路由，登录后回跳
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
              sessionStorage.setItem('redirect_after_login', currentPath);
            }
            safeRedirect('/login');
          }
          
          return Promise.reject(new Error('登录已过期，请重新登录'));
        }
      }
      
      const message = error.response?.data?.message || error.message || '网络错误';
      return Promise.reject(new Error(message));
    }
  );

  return instance;
};

const request = createAxiosInstance();

/**
 * GET 请求
 */
export const get = <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return request.get<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, config).then((res) => res.data);
};

/**
 * POST 请求
 */
export const post = <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return request.post<ApiResponse<T>, AxiosResponse<ApiResponse<T>>>(url, data, config).then((res) => res.data);
};

export default request;
