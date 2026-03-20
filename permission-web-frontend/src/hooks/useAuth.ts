import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, logout as logoutApi, getCurrentUser } from '@/services/api';
import { setUserInfo, clearAuth, getUserInfo, emitTokenChanged, safeRedirect } from '@/utils/request';
import type { UserInfo, LoginRequest } from '@/types';

interface UseAuthReturn {
  user: UserInfo | null;
  isAuthenticated: boolean;
  /** 已从服务端同步过当前用户（或确认无本地缓存），布局可据此再做无权限跳转 */
  hydrated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(() => getUserInfo() as UserInfo | null);
  const [isAuthed, setIsAuthed] = useState(() => !!getUserInfo());
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const handleTokenChange = () => {
      const userInfo = getUserInfo() as UserInfo | null;
      setIsAuthed(!!userInfo);
      setUser(userInfo);
    };

    window.addEventListener('auth:token-changed', handleTokenChange);
    return () => {
      window.removeEventListener('auth:token-changed', handleTokenChange);
    };
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
      setUserInfo(res.data);
      setIsAuthed(true);
    } catch {
      clearAuth();
      setUser(null);
      setIsAuthed(false);
    }
  }, []);

  /** 进入受保护布局后拉取最新权限，避免仅角色变更后仍使用登录时的旧 sessionStorage */
  useEffect(() => {
    if (!getUserInfo()) {
      setHydrated(true);
      return;
    }
    let cancelled = false;
    void fetchUser().finally(() => {
      if (!cancelled) setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchUser]);

  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const res = await loginApi(data);
      const userInfo = res.data;
      
      if (!userInfo || !userInfo.userId) {
        throw new Error('登录响应缺少用户信息');
      }
      
      setUserInfo(userInfo);
      setUser(userInfo);
      setIsAuthed(true);
      
      message.success('登录成功');

      emitTokenChanged();
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || sessionStorage.getItem('post_login_redirect');
      if (redirect) {
        sessionStorage.removeItem('post_login_redirect');
        safeRedirect(redirect);
        return;
      }
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 0);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      clearAuth();
      setUser(null);
      setIsAuthed(false);
      emitTokenChanged();
      message.success('已退出登录');
      navigate('/login');
    }
  }, [navigate]);

  return {
    user,
    isAuthenticated: isAuthed,
    hydrated,
    loading,
    login,
    logout,
    fetchUser,
  };
};
