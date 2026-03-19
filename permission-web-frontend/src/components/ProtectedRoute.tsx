import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button, Spin } from 'antd';
import { isAuthenticated } from '@/utils/request';
import { getCurrentUser } from '@/services/api';
import { clearAuth } from '@/utils/request';

const TOKEN_CHANGED_EVENT = 'auth:token-changed';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;  // 可选的权限编码
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
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
          
          // 如果需要权限校验
          if (requiredPermission) {
            const userInfo = res.data;
            const permissions = userInfo?.permissions || [];
            const isAdmin = userInfo?.admin || false;
            setHasPermission(isAdmin || permissions.includes(requiredPermission));
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
  }, [requiredPermission]);

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
        title="403"
        subTitle="抱歉，您没有权限访问此页面"
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
