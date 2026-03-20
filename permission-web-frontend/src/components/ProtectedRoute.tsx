import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { getCurrentUser } from '@/services/api';
import { isAuthenticated, clearAuth, setUserInfo, emitTokenChanged } from '@/utils/request';

const TOKEN_CHANGED_EVENT = 'auth:token-changed';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** 精确匹配某一权限点 */
  requiredPermission?: string;
  /** 任一以此前缀开头的权限点即通过（用于用户中心多子能力） */
  requiredPermissionPrefix?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissionPrefix,
}) => {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const verifyAuth = async () => {
      // 先检查 localStorage 是否有用户信息
      if (!isAuthenticated()) {
        if (mounted) {
          setAuthenticated(false);
          setChecking(false);
        }
        return;
      }

      // 验证 token 是否有效
      try {
        const res = await getCurrentUser();
        if (mounted) {
          setAuthenticated(true);
          if (res.data) {
            setUserInfo(res.data);
            emitTokenChanged();
          }

          // 如果需要权限校验
          if (requiredPermission) {
            const userInfo = res.data;
            const permissions = userInfo?.permissions || [];
            const isAdmin = userInfo?.admin || false;
            setHasPermission(isAdmin || permissions.includes(requiredPermission));
          } else if (requiredPermissionPrefix) {
            // 检查是否有任一匹配前缀的权限
            const userInfo = res.data;
            const permissions = userInfo?.permissions || [];
            const isAdmin = userInfo?.admin || false;
            const hasPrefixPermission = permissions.some(p => p.startsWith(requiredPermissionPrefix));
            setHasPermission(isAdmin || hasPrefixPermission);
          } else {
            setHasPermission(true);
          }
          setChecking(false);
        }
      } catch {
        // Token 无效，清理并跳转登录
        if (mounted) {
          clearAuth();
          setAuthenticated(false);
          setChecking(false);
        }
      }
    };

    verifyAuth();

    // 监听 Token 变化事件
    const handleTokenChange = () => {
      if (!isAuthenticated()) {
        setAuthenticated(false);
      }
    };
    window.addEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);

    return () => {
      mounted = false;
      window.removeEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
    };
  }, [requiredPermission, requiredPermissionPrefix]);

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!checking && !hasPermission) {
    return (
      <Result
        status="403"
        title="无权访问该功能"
        subTitle={
          <span style={{ maxWidth: 440, display: 'inline-block', textAlign: 'left' }}>
            您已登录，但缺少访问本页所需的权限点。若应拥有该能力，请联系管理员调整角色授权后重新登录。
          </span>
        }
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
