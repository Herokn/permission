import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/layouts/MainLayout';
import LoginPage from '@/pages/LoginPage';
import PermissionPage from '@/pages/PermissionPage.tsx';
import RolePage from '@/pages/RolePage';
import UserGrantPage from '@/pages/UserGrantPage';
import AuthzTestPage from '@/pages/AuthzTestPage';
import ProjectPage from '@/pages/ProjectPage';
import { isAuthenticated } from '@/utils/request';

const TOKEN_CHANGED_EVENT = 'auth:token-changed';

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
            <Route
              path="/login"
              element={authed ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/projects" replace />} />
              <Route path="projects" element={<ProjectPage />} />
              <Route 
                path="permissions" 
                element={
                  <ProtectedRoute requiredPermission="PERMISSION_MANAGE">
                    <PermissionPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="roles" 
                element={
                  <ProtectedRoute requiredPermission="ROLE_MANAGE">
                    <RolePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute requiredPermission="USER_AUTH_MANAGE">
                    <UserGrantPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="authz-test" element={<AuthzTestPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

export default App;
