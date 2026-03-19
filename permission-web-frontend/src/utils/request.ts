import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';
import { refreshToken } from '@/services/api';

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

/**
 * 订阅 Token 刷新结果
 */
const subscribeTokenRefresh = (callback: (success: boolean) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * 通知所有订阅者 Token 刷新结果
 */
const onTokenRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

/**
 * 触发 Token 变化事件
 */
export const emitTokenChanged = () => {
  window.dispatchEvent(new CustomEvent(TOKEN_CHANGED_EVENT));
};

/**
 * 存储用户信息
 */
export const setUserInfo = (userInfo: unknown) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
};

/**
 * 获取用户信息（带校验）
 */
export const getUserInfo = (): unknown => {
  try {
    const info = localStorage.getItem(USER_INFO_KEY);
    if (!info) return null;
    const parsed = JSON.parse(info);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('getUserInfo: 无效的用户信息，已清除');
      localStorage.removeItem(USER_INFO_KEY);
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('getUserInfo: 解析用户信息失败，已清除', e);
    localStorage.removeItem(USER_INFO_KEY);
    return null;
  }
};

/**
 * 清除登录状态
 */
export const clearAuth = () => {
  localStorage.removeItem(USER_INFO_KEY);
  emitTokenChanged();
};

/**
 * 检查是否已登录（通过用户信息判断，Token 由 Cookie 自动管理）
 */
export const isAuthenticated = (): boolean => {
  return !!getUserInfo();
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
      // 401 未授权，尝试静默续期
      if (error.response?.status === 401) {
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
            window.location.href = '/login';
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
