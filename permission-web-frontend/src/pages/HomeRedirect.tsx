import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/services/api';
import { setUserInfo } from '@/utils/request';
import { getFirstAccessiblePath } from '@/utils/permissions';
import type { UserInfo } from '@/types';

/**
 * 根路径：拉取最新权限后跳到首个可访问页或「无权限」页
 */
const HomeRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getCurrentUser();
        const u = res.data as UserInfo;
        setUserInfo(u);
        const path = getFirstAccessiblePath(u);
        if (!cancelled) navigate(path, { replace: true });
      } catch {
        if (!cancelled) navigate('/login', { replace: true });
      } finally {
        if (!cancelled) setSpin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (spin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  return null;
};

export default HomeRedirect;
