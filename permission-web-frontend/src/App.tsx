import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/LoginPage';
import HomeRedirect from '@/pages/HomeRedirect';
import NoAccessPage from '@/pages/NoAccessPage';
import PermissionPage from '@/pages/PermissionPage.tsx';
import ProjectPage from '@/pages/ProjectPage';
import RolePage from '@/pages/RolePage';
import UserGrantPage from '@/pages/UserGrantPage';
import AuditLogPage from '@/pages/AuditLogPage';
import UserCenterUserPage from '@/pages/user-center/UserCenterUserPage';
import OrganizationPage from '@/pages/user-center/OrganizationPage';
import PositionPage from '@/pages/user-center/PositionPage';
import { isAuthenticated, safeRedirect } from '@/utils/request';

const TOKEN_CHANGED_EVENT = 'auth:token-changed';

const LoginEntry: React.FC<{ authed: boolean }> = ({ authed }) => {
  const location = useLocation();
  if (!authed) {
    return <LoginPage />;
  }
  const redirect = new URLSearchParams(location.search).get('redirect');
  if (redirect) {
    safeRedirect(redirect);
    return null;
  }
  return <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const [authed, setAuthed] = useState(isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthed(isAuthenticated());
    };

    handleAuthChange();
    window.addEventListener(TOKEN_CHANGED_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener(TOKEN_CHANGED_EVENT, handleAuthChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginEntry authed={authed} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HomeRedirect />} />
              <Route path="no-access" element={<NoAccessPage />} />

              <Route
                path="user-center/users"
                element={
                  <ProtectedRoute requiredPermissionPrefix="USER_CENTER_USER_">
                    <UserCenterUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-center/organizations"
                element={
                  <ProtectedRoute requiredPermissionPrefix="USER_CENTER_ORG_">
                    <OrganizationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="user-center/positions"
                element={
                  <ProtectedRoute requiredPermissionPrefix="USER_CENTER_POSITION_">
                    <PositionPage />
                  </ProtectedRoute>
                }
              />
              <Route path="user-center" element={<Navigate to="/user-center/users" replace />} />

              <Route
                path="permission-center/projects"
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_CENTER_PROJECT_VIEW">
                    <ProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission-center/permissions"
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_CENTER_PERMISSION_VIEW">
                    <PermissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission-center/roles"
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_CENTER_ROLE_VIEW">
                    <RolePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission-center/user-grants"
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_CENTER_USER_GRANT_VIEW">
                    <UserGrantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="permission-center/audit-logs"
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_CENTER_AUDIT_VIEW">
                    <AuditLogPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
