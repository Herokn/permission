import React from 'react';
import { Result, Typography } from 'antd';
import { useAuth } from '@/hooks/useAuth';

const { Paragraph, Text } = Typography;

const NoAccessPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Result
      status="info"
      title="暂无可访问功能"
      subTitle={
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'left' }}>
          <Paragraph>
            账号 <Text strong>{user?.userName ?? '-'}</Text> 已登录成功，但当前没有任何菜单级权限（既非超级管理员，也未被授予用户中心或权限中心相关角色）。
          </Paragraph>
          <Paragraph type="secondary">
            请管理员在「权限中心 → 角色管理」中维护角色，在「权限点管理」中为角色勾选所需权限（如仅用户管理、仅组织管理、仅权限点管理等），再在「用户授权」中把角色分配给您；分配后请重新登录以刷新权限列表。
          </Paragraph>
        </div>
      }
    />
  );
};

export default NoAccessPage;
