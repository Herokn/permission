import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Dropdown, Avatar, Space, Typography, Tabs, Menu } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  FolderOutlined,
  SafetyOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  KeyOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { canAccessPermission, canAccessPermissionPrefix } from '@/utils/permissions';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

type MainTabType = 'user-center' | 'permission-center';
type UserCenterSubTabType = 'users' | 'organizations' | 'positions';
type PermissionSubTabType = 'projects' | 'permissions' | 'roles' | 'user-grants' | 'audit-logs';

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hydrated } = useAuth();

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') logout();
  };

  const showUserCenter = !!user?.admin || !!user?.modules?.includes('user-center');
  const showPermCenter = !!user?.admin || !!user?.modules?.includes('permission-center');

  const userCenterSubTabsAll = useMemo(
    () =>
      [
        { key: 'users' as const, label: '用户管理', icon: <TeamOutlined />, permPrefix: 'USER_CENTER_USER_' },
        { key: 'organizations' as const, label: '组织管理', icon: <ApartmentOutlined />, permPrefix: 'USER_CENTER_ORG_' },
        { key: 'positions' as const, label: '岗位管理', icon: <IdcardOutlined />, permPrefix: 'USER_CENTER_POSITION_' },
      ] as const,
    []
  );

  const permissionSubTabsAll = useMemo(
    () =>
      [
        { key: 'projects' as const, label: '项目管理', icon: <FolderOutlined />, perm: 'PERMISSION_CENTER_PROJECT_VIEW' },
        { key: 'permissions' as const, label: '权限点管理', icon: <SafetyOutlined />, perm: 'PERMISSION_CENTER_PERMISSION_VIEW' },
        { key: 'roles' as const, label: '角色管理', icon: <KeyOutlined />, perm: 'PERMISSION_CENTER_ROLE_VIEW' },
        { key: 'user-grants' as const, label: '用户授权', icon: <UserSwitchOutlined />, perm: 'PERMISSION_CENTER_USER_GRANT_VIEW' },
        { key: 'audit-logs' as const, label: '审计日志', icon: <FileSearchOutlined />, perm: 'PERMISSION_CENTER_AUDIT_VIEW' },
      ] as const,
    []
  );

  const userCenterSubTabs = useMemo(() => {
    return userCenterSubTabsAll.filter(
      (t) => user?.admin || canAccessPermissionPrefix(user, t.permPrefix)
    );
  }, [user, userCenterSubTabsAll]);

  const permissionSubTabs = useMemo(() => {
    return permissionSubTabsAll.filter((t) => user?.admin || canAccessPermission(user, t.perm));
  }, [user, permissionSubTabsAll]);

  const sideMenuItems = useMemo(() => {
    const items: { key: string; icon: React.ReactNode; label: string }[] = [];
    if (showUserCenter) {
      items.push({ key: 'user-center', icon: <UserSwitchOutlined />, label: '用户中心' });
    }
    if (showPermCenter) {
      items.push({ key: 'permission-center', icon: <SafetyOutlined />, label: '权限中心' });
    }
    return items;
  }, [showUserCenter, showPermCenter]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user?.admin && sideMenuItems.length === 0 && !location.pathname.startsWith('/no-access')) {
      navigate('/no-access', { replace: true });
    }
  }, [hydrated, user, sideMenuItems.length, location.pathname, navigate]);

  const getActiveTabs = () => {
    if (location.pathname.startsWith('/user-center/users')) {
      return { mainTab: 'user-center' as MainTabType, subTab: 'users' as UserCenterSubTabType };
    }
    if (location.pathname.startsWith('/user-center/organizations')) {
      return { mainTab: 'user-center' as MainTabType, subTab: 'organizations' as UserCenterSubTabType };
    }
    if (location.pathname.startsWith('/user-center/positions')) {
      return { mainTab: 'user-center' as MainTabType, subTab: 'positions' as UserCenterSubTabType };
    }
    if (location.pathname.startsWith('/permission-center/projects')) {
      return { mainTab: 'permission-center' as MainTabType, subTab: 'projects' as PermissionSubTabType };
    }
    if (location.pathname.startsWith('/permission-center/permissions')) {
      return { mainTab: 'permission-center' as MainTabType, subTab: 'permissions' as PermissionSubTabType };
    }
    if (location.pathname.startsWith('/permission-center/roles')) {
      return { mainTab: 'permission-center' as MainTabType, subTab: 'roles' as PermissionSubTabType };
    }
    if (location.pathname.startsWith('/permission-center/user-grants')) {
      return { mainTab: 'permission-center' as MainTabType, subTab: 'user-grants' as PermissionSubTabType };
    }
    if (location.pathname.startsWith('/permission-center/audit-logs')) {
      return { mainTab: 'permission-center' as MainTabType, subTab: 'audit-logs' as PermissionSubTabType };
    }
    if (location.pathname.startsWith('/no-access')) {
      return { mainTab: 'user-center' as MainTabType, subTab: 'users' as UserCenterSubTabType };
    }
    return { mainTab: 'user-center' as MainTabType, subTab: 'users' as UserCenterSubTabType };
  };

  const activeTabs = getActiveTabs();

  useEffect(() => {
    if (location.pathname.startsWith('/no-access')) return;

    if (activeTabs.mainTab === 'user-center' && userCenterSubTabs.length > 0) {
      const allowed = new Set(userCenterSubTabs.map((t) => t.key));
      if (!allowed.has(activeTabs.subTab as (typeof userCenterSubTabs)[number]['key'])) {
        navigate(`/user-center/${userCenterSubTabs[0].key}`, { replace: true });
      }
    }
    if (activeTabs.mainTab === 'permission-center' && permissionSubTabs.length > 0) {
      const allowed = new Set(permissionSubTabs.map((t) => t.key));
      if (!allowed.has(activeTabs.subTab as (typeof permissionSubTabs)[number]['key'])) {
        navigate(`/permission-center/${permissionSubTabs[0].key}`, { replace: true });
      }
    }
  }, [location.pathname, activeTabs.mainTab, activeTabs.subTab, userCenterSubTabs, permissionSubTabs, navigate]);

  const handleMainMenuClick = (key: string) => {
    const newTab = key as MainTabType;
    if (newTab === 'permission-center') {
      const first = permissionSubTabs[0]?.key ?? 'projects';
      navigate(`/permission-center/${first}`);
    } else {
      const first = userCenterSubTabs[0]?.key ?? 'users';
      navigate(`/user-center/${first}`);
    }
  };

  const handleUserCenterSubTabChange = (key: string) => {
    navigate(`/user-center/${key}`);
  };

  const handlePermissionSubTabChange = (key: string) => {
    navigate(`/permission-center/${key}`);
  };

  const currentSubTabs =
    activeTabs.mainTab === 'user-center'
      ? userCenterSubTabs.map(({ key, label, icon }) => ({ key, label, icon }))
      : permissionSubTabs.map(({ key, label, icon }) => ({ key, label, icon }));

  const hideTabs = location.pathname.startsWith('/no-access');

  const selectedMain =
    sideMenuItems.some((i) => i.key === activeTabs.mainTab) ? activeTabs.mainTab : sideMenuItems[0]?.key;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
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
          <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          {!collapsed && (
            <Text strong style={{ fontSize: 16, color: '#1890ff', marginLeft: 8 }}>
              管理平台
            </Text>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedMain ? [selectedMain] : []}
          items={sideMenuItems}
          onClick={({ key }) => handleMainMenuClick(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text>{user?.userName || '用户'}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ padding: 16 }}>
            {!hideTabs && currentSubTabs.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 8, padding: '8px 24px 0' }}>
                <Tabs
                  activeKey={activeTabs.subTab as string}
                  onChange={(key) => {
                    if (activeTabs.mainTab === 'user-center') {
                      handleUserCenterSubTabChange(key);
                    } else {
                      handlePermissionSubTabChange(key);
                    }
                  }}
                  items={currentSubTabs}
                />
              </div>
            )}

            <div
              style={{
                marginTop: hideTabs || currentSubTabs.length === 0 ? 0 : 16,
                background: '#fff',
                borderRadius: 8,
                padding: 24,
                minHeight: 'calc(100vh - 180px)',
              }}
            >
              <Outlet />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
