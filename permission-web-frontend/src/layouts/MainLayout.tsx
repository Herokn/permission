import React, { useState, useMemo } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  TeamOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItemWithPermission {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission?: string;
}

const ALL_MENU_ITEMS: MenuItemWithPermission[] = [
  {
    key: '/projects',
    icon: <FolderOutlined />,
    label: '项目管理',
    permission: 'PROJECT_VIEW',
  },
  {
    key: '/permissions',
    icon: <SafetyOutlined />,
    label: '权限点管理',
    permission: 'PERMISSION_VIEW',
  },
  {
    key: '/roles',
    icon: <KeyOutlined />,
    label: '角色管理',
    permission: 'ROLE_VIEW',
  },
  {
    key: '/users',
    icon: <TeamOutlined />,
    label: '用户授权',
    permission: 'USER_AUTH_VIEW',
  },
  {
    key: '/authz-test',
    icon: <ThunderboltOutlined />,
    label: '权限测试',
  },
];

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userPermissions = useMemo(() => {
    return new Set(user?.permissions || []);
  }, [user]);

  const menuItems = useMemo(() => {
    // 超级管理员显示所有菜单
    if (user?.admin) {
      return ALL_MENU_ITEMS.map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
      }));
    }
    // 普通用户根据权限过滤菜单
    return ALL_MENU_ITEMS.filter((item) => {
      if (!item.permission) {
        return true;
      }
      return userPermissions.has(item.permission);
    }).map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    }));
  }, [userPermissions, user?.admin]);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <SafetyOutlined
            style={{ fontSize: collapsed ? 24 : 28, color: '#1890ff' }}
          />
          {!collapsed && (
            <Text
              strong
              style={{
                marginLeft: 8,
                fontSize: 16,
                color: '#1890ff',
              }}
            >
              权限中心
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text>{user?.userName || '用户'}</Text>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
