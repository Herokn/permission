# 03 - 前端变更 (Git Diff)

以下是前端所有源码文件相对于 main 分支的完整 git diff，未做任何省略。

## 变更文件清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/components/ProtectedRoute.tsx` | 修改 | 异步 token 验证 |
| `src/layouts/MainLayout.tsx` | 修改 | 超级管理员菜单优化 |
| `src/pages/PermissionPage.txt` | 修改 | 权限页面整体重构为卡片式 |
| `src/pages/ProjectPage.tsx` | 修改 | 新增系统模块管理 |
| `src/pages/RolePage.tsx` | 修改 | 新增项目选择 |
| `src/pages/UserGrantPage.module.css` | 修改 | 新增权限树样式 |
| `src/pages/UserGrantPage.tsx` | 修改 | 整体重构为项目维度权限树 |
| `src/services/api.ts` | 修改 | API 支持 projectId 参数 |
| `src/types/index.ts` | 修改 | 类型新增 projectId、SystemModule |

---

## 完整 Git Diff

```diff

diff --git a/permission-web-frontend/src/components/ProtectedRoute.tsx b/permission-web-frontend/src/components/ProtectedRoute.tsx
index 8a7d322..af54ea4 100644
--- a/permission-web-frontend/src/components/ProtectedRoute.tsx
+++ b/permission-web-frontend/src/components/ProtectedRoute.tsx
@@ -1,7 +1,9 @@
 import { useEffect, useState } from 'react';
 import { Navigate, useLocation } from 'react-router-dom';
-import { Result, Button } from 'antd';
+import { Result, Button, Spin } from 'antd';
 import { isAuthenticated, getUserInfo } from '@/utils/request';
+import { getCurrentUser } from '@/services/api';
+import { clearAuth } from '@/utils/request';
 import type { UserInfo } from '@/types';
 
 const TOKEN_CHANGED_EVENT = 'auth:token-changed';
@@ -13,50 +15,74 @@ interface ProtectedRouteProps {
 
 const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
   const location = useLocation();
-  const [authenticated, setAuthenticated] = useState(isAuthenticated());
+  const [authenticated, setAuthenticated] = useState(false);
   const [hasPermission, setHasPermission] = useState(true);
   const [checking, setChecking] = useState(true);
 
   useEffect(() => {
-    const checkAuth = () => {
-      const isAuth = isAuthenticated();
-      setAuthenticated(isAuth);
-      
-      // 如果需要权限校验
-      if (isAuth && requiredPermission) {
-        const userInfo = getUserInfo() as UserInfo | null;
-        const permissions = userInfo?.permissions || [];
-        const isAdmin = userInfo?.admin || false;
-        // 超级管理员或有对应权限才能访问
-        setHasPermission(isAdmin || permissions.includes(requiredPermission));
-      } else {
-        setHasPermission(true);
+    let mounted = true;
+
+    const verifyAuth = async () => {
+      // 先检查 localStorage 是否有用户信息
+      if (!isAuthenticated()) {
+        if (mounted) {
+          setAuthenticated(false);
+          setChecking(false);
+        }
+        return;
+      }
+
+      // 验证 token 是否有效
+      try {
+        const res = await getCurrentUser();
+        if (mounted) {
+          setAuthenticated(true);
+          
+          // 如果需要权限校验
+          if (requiredPermission) {
+            const userInfo = res.data;
+            const permissions = userInfo?.permissions || [];
+            const isAdmin = userInfo?.admin || false;
+            setHasPermission(isAdmin || permissions.includes(requiredPermission));
+          } else {
+            setHasPermission(true);
+          }
+          setChecking(false);
+        }
+      } catch {
+        // Token 无效，清理并跳转登录
+        if (mounted) {
+          clearAuth();
+          setAuthenticated(false);
+          setChecking(false);
+        }
       }
-      setChecking(false);
     };
 
-    checkAuth();
+    verifyAuth();
 
     // 监听 Token 变化事件
     const handleTokenChange = () => {
-      checkAuth();
-    };
-    window.addEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
-
-    // 监听 storage 变化（用于多标签页同步）
-    const handleStorageChange = (e: StorageEvent) => {
-      if (e.key === 'access_token') {
-        checkAuth();
+      if (!isAuthenticated()) {
+        setAuthenticated(false);
       }
     };
-    window.addEventListener('storage', handleStorageChange);
+    window.addEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
 
     return () => {
+      mounted = false;
       window.removeEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
-      window.removeEventListener('storage', handleStorageChange);
     };
   }, [requiredPermission]);
 
+  if (checking) {
+    return (
+      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
+        <Spin size="large" />
+      </div>
+    );
+  }
+
   if (!authenticated) {
     return <Navigate to="/login" state={{ from: location }} replace />;
   }
diff --git a/permission-web-frontend/src/layouts/MainLayout.tsx b/permission-web-frontend/src/layouts/MainLayout.tsx
index d2684ad..149bed1 100644
--- a/permission-web-frontend/src/layouts/MainLayout.tsx
+++ b/permission-web-frontend/src/layouts/MainLayout.tsx
@@ -67,6 +67,15 @@ const MainLayout: React.FC = () => {
   }, [user]);
 
   const menuItems = useMemo(() => {
+    // 超级管理员显示所有菜单
+    if (user?.admin) {
+      return ALL_MENU_ITEMS.map((item) => ({
+        key: item.key,
+        icon: item.icon,
+        label: item.label,
+      }));
+    }
+    // 普通用户根据权限过滤菜单
     return ALL_MENU_ITEMS.filter((item) => {
       if (!item.permission) {
         return true;
@@ -77,7 +86,7 @@ const MainLayout: React.FC = () => {
       icon: item.icon,
       label: item.label,
     }));
-  }, [userPermissions]);
+  }, [userPermissions, user?.admin]);
 
   const userMenuItems = [
     {
diff --git a/permission-web-frontend/src/pages/PermissionPage.txt b/permission-web-frontend/src/pages/PermissionPage.txt
index d2f0036..9e63d87 100644
--- a/permission-web-frontend/src/pages/PermissionPage.txt
+++ b/permission-web-frontend/src/pages/PermissionPage.txt
@@ -1,4 +1,4 @@
-import React, { useState, useEffect, useCallback } from 'react';
+import React, { useState, useEffect, useCallback, useMemo } from 'react';
 import {
   Table,
   Button,
@@ -13,7 +13,6 @@ import {
   Card,
   InputNumber,
   Tabs,
-  Collapse,
 } from 'antd';
 import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UnorderedListOutlined, ApartmentOutlined, FolderOutlined } from '@ant-design/icons';
 import type { ColumnsType } from 'antd/es/table';
@@ -47,6 +46,20 @@ const PermissionPage: React.FC = () => {
   const [refreshKey, setRefreshKey] = useState(0);
   const [projects, setProjects] = useState<Project[]>([]);
 
+  // 根据表单中选中的项目获取系统模块列表（从项目配置读取）
+  const selectedProjectId = Form.useWatch('projectId', form);
+  const systemOptions = useMemo(() => {
+    const project = projects.find(p => p.code === selectedProjectId);
+    if (project?.systems && project.systems.length > 0) {
+      return project.systems.map(s => ({
+        value: s.code,
+        label: `${s.name} (${s.code})`,
+      }));
+    }
+    // 如果没有配置系统模块，返回默认选项
+    return [{ value: 'DEFAULT', label: '默认模块 (DEFAULT)' }];
+  }, [projects, selectedProjectId]);
+
   const loadData = useCallback(async () => {
     setLoading(true);
     try {
@@ -79,9 +92,61 @@ const PermissionPage: React.FC = () => {
     loadProjects();
   }, []);
 
-  const handleCreate = () => {
+  const selectedSystemCode = Form.useWatch('systemCode', form);
+  const selectedType = Form.useWatch('type', form);
+  
+  // 加载选中项目的权限，用于父级选择
+  const [projectPermissions, setProjectPermissions] = useState<Permission[]>([]);
+  useEffect(() => {
+    if (selectedProjectId) {
+      listAllPermissions(selectedProjectId).then(res => {
+        setProjectPermissions(res.data || []);
+      }).catch(() => {
+        setProjectPermissions([]);
+      });
+    } else {
+      setProjectPermissions([]);
+    }
+  }, [selectedProjectId]);
+  
+  // 根据类型和系统过滤可选的父级
+  const parentOptions = useMemo(() => {
+    if (!selectedSystemCode) return [];
+    
+    // 根据类型确定可选的父级类型
+    // MENU -> 无父级（顶级菜单）
+    // PAGE -> 父级必须是 MENU
+    // ACTION -> 父级必须是 PAGE
+    let allowedParentType: string | null = null;
+    if (selectedType === 'PAGE') {
+      allowedParentType = 'MENU';
+    } else if (selectedType === 'ACTION') {
+      allowedParentType = 'PAGE';
+    } else {
+      // MENU 类型不需要父级
+      return [];
+    }
+    
+    // 过滤：同一系统下、类型匹配的权限
+    return projectPermissions
+      .filter(p => p.systemCode === selectedSystemCode && p.type === allowedParentType)
+      .map(p => ({
+        value: p.code,
+        label: `${p.name} (${p.code})`,
+      }));
+  }, [projectPermissions, selectedSystemCode, selectedType]);
+
+  const handleCreate = (projectId?: string, parentCode?: string) => {
     setEditingPermission(null);
     form.resetFields();
+    // 如果传入了项目ID，设置到表单
+    if (projectId) {
+      form.setFieldsValue({ projectId });
+    }
+    // 如果传入了父级编码，设置到表单
+    if (parentCode) {
+      form.setFieldsValue({ parentCode });
+    }
     setModalVisible(true);
   };
 
@@ -153,13 +218,26 @@ const PermissionPage: React.FC = () => {
       },
     },
     {
-      title: '项目',
+      title: '所属系统',
       dataIndex: 'systemCode',
       key: 'systemCode',
-      width: 120,
-      render: (text: string) => {
-        const project = projects.find(p => p.code === text);
-        return <Tag color="geekblue">{project?.name || text}</Tag>;
+      width: 140,
+      render: (systemCode: string, record: Permission) => {
+        // 根据权限点的 projectId 查找对应项目的系统模块
+        const project = projects.find(p => p.code === record.projectId);
+        const system = project?.systems?.find(s => s.code === systemCode);
+        return <Tag color="geekblue">{system?.name || systemCode}</Tag>;
+      },
+    },
+    {
+      title: '项目隔离',
+      dataIndex: 'projectId',
+      key: 'projectId',
+      width: 100,
+      render: (projectId: string) => {
+        if (!projectId) return <Tag color="blue">全局</Tag>;
+        const project = projects.find(p => p.code === projectId);
+        return <Tag color="green">{project?.name || projectId}</Tag>;
       },
     },
     {
@@ -234,9 +312,11 @@ const PermissionPage: React.FC = () => {
         onChange={setActiveTab}
         tabBarExtraContent={
           <Space>
-            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
-              新建权限点
-            </Button>
+            {activeTab === 'table' && (
+              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreate()}>
+                新建权限点
+              </Button>
+            )}
             {activeTab === 'table' && (
               <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                 刷新
@@ -253,7 +333,7 @@ const PermissionPage: React.FC = () => {
                 树形视图
               </span>
             ),
-            children: <PermissionTreeView onEdit={handleEdit} onDelete={handleDelete} refreshKey={refreshKey} />,
+            children: <PermissionTreeView onEdit={handleEdit} onDelete={handleDelete} onCreate={handleCreate} refreshKey={refreshKey} />,
           },
           {
             key: 'table',
@@ -314,7 +394,7 @@ const PermissionPage: React.FC = () => {
           form={form}
           layout="vertical"
           onFinish={handleSubmit}
-          initialValues={{ type: 'ACTION', systemCode: 'PERM_CENTER', sortOrder: 1 }}
+          initialValues={{ type: 'ACTION', sortOrder: 1 }}
           className={styles.editForm}
         >
           <Form.Item
@@ -336,19 +416,37 @@ const PermissionPage: React.FC = () => {
             <Input placeholder="请输入权限名称" />
           </Form.Item>
 
-          <Form.Item
-            name="systemCode"
+          <Form.Item 
+            name="projectId" 
             label="所属项目"
+            tooltip="选择该项目后，下方的系统模块会根据项目动态显示"
             rules={[{ required: true, message: '请选择所属项目' }]}
+          >
+            <Select 
+              placeholder="请选择所属项目" 
+              showSearch 
+              optionFilterProp="label"
+            >
+              {projects.map(p => (
+                <Select.Option key={p.code} value={p.code} label={p.name}>
+                  {p.name} ({p.code})
+                </Select.Option>
+              ))}
+            </Select>
+          </Form.Item>
+
+          <Form.Item
+            name="systemCode"
+            label="所属系统"
+            tooltip="该权限点所属的业务系统模块，需要先选择项目"
+            rules={[{ required: true, message: '请选择所属系统' }]}
           >
             <Select
               showSearch
-              placeholder="请选择所属项目"
+              placeholder={selectedProjectId ? "请选择所属系统" : "请先选择项目"}
               optionFilterProp="label"
-              options={projects.map(p => ({ value: p.code, label: `${p.name} (${p.code})` }))}
-              filterOption={(input, option) =>
-                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
-              }
+              options={systemOptions}
+              disabled={!selectedProjectId}
             />
           </Form.Item>
 
@@ -360,8 +458,20 @@ const PermissionPage: React.FC = () => {
             <Select options={permissionTypes} />
           </Form.Item>
 
-          <Form.Item name="parentCode" label="父级编码">
-            <Input placeholder="父级权限编码（可选）" />
+          <Form.Item 
+            name="parentCode" 
+            label="父级权限" 
+            tooltip="MENU类型无父级；PAGE类型父级为MENU；ACTION类型父级为PAGE"
+            rules={[
+              { required: selectedType !== 'MENU', message: '请选择父级权限' },
+            ]}
+          >
+            <Select
+              placeholder={selectedType === 'MENU' ? "顶级菜单无需选择父级" : "请选择父级权限"}
+              options={parentOptions}
+              disabled={selectedType === 'MENU' || parentOptions.length === 0}
+              allowClear
+            />
           </Form.Item>
 
           <Form.Item name="sortOrder" label="排序">
@@ -380,33 +490,42 @@ const PermissionPage: React.FC = () => {
 interface PermissionTreeViewProps {
   onEdit: (record: Permission) => void;
   onDelete: (id: number) => void;
+  onCreate: (projectId: string, parentCode?: string) => void;
   refreshKey: number;
 }
 
-const PermissionTreeView: React.FC<PermissionTreeViewProps> = ({ onEdit, onDelete, refreshKey }) => {
+const PermissionTreeView: React.FC<PermissionTreeViewProps> = ({ onEdit, onDelete, onCreate, refreshKey }) => {
   const [loading, setLoading] = useState(false);
   const [permissions, setPermissions] = useState<Permission[]>([]);
   const [projects, setProjects] = useState<Project[]>([]);
-  const [projectTreeData, setProjectTreeData] = useState<Map<string, any[]>>(new Map());
+  const [searchKeyword, setSearchKeyword] = useState('');
   const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
+  const [selectedProject, setSelectedProject] = useState<string>(''); // 选中的项目
 
   const loadData = async () => {
     setLoading(true);
     try {
-      const [permRes, projectRes] = await Promise.all([
-        listAllPermissions(),
-        listAllProjects(),
-      ]);
-      const permList = permRes.data || [];
-      const projectList = projectRes.data || [];
-      setPermissions(permList);
-      setProjects(projectList);
-      
-      // 按项目分组构建树
-      const groupedTree = buildGroupedTree(permList, projectList);
-      setProjectTreeData(groupedTree);
+      const projectRes = await listAllProjects();
+      setProjects(projectRes.data || []);
     } catch {
-      message.error('加载数据失败');
+      message.error('加载项目列表失败');
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  // 根据选中的项目加载权限
+  const loadPermissions = async () => {
+    if (!selectedProject) {
+      setPermissions([]);
+      return;
+    }
+    setLoading(true);
+    try {
+      const permRes = await listAllPermissions(selectedProject);
+      setPermissions(permRes.data || []);
+    } catch {
+      message.error('加载权限数据失败');
     } finally {
       setLoading(false);
     }
@@ -416,231 +535,461 @@ const PermissionTreeView: React.FC<PermissionTreeViewProps> = ({ onEdit, onDelet
     loadData();
   }, [refreshKey]);
 
-  // 按项目分组构建树形结构
-  const buildGroupedTree = (permissions: Permission[], projects: Project[]): Map<string, any[]> => {
-    const projectMap = new Map<string, string>();
-    projects.forEach(p => projectMap.set(p.code, p.name));
+  useEffect(() => {
+    loadPermissions();
+  }, [selectedProject, refreshKey]);
+
+  // 构建分组卡片数据：一级菜单 -> 二级页面 -> 三级操作
+  // 同时支持游离的权限（没有完整层级结构的权限）
+  const buildGroupedCards = () => {
+    const menuMap = new Map<string, { menu: Permission; pages: Map<string, { page: Permission; actions: Permission[] }> }>();
+    const codeMap = new Map<string, Permission>();
     
-    // 按项目分组
-    const grouped = new Map<string, Permission[]>();
-    permissions.forEach(perm => {
-      const projectCode = perm.systemCode || 'OTHER';
-      if (!grouped.has(projectCode)) {
-        grouped.set(projectCode, []);
-      }
-      grouped.get(projectCode)!.push(perm);
-    });
+    // 先建立 code -> permission 映射
+    permissions.forEach(perm => codeMap.set(perm.code, perm));
 
-    // 为每个项目构建权限树
-    const result = new Map<string, any[]>();
-    grouped.forEach((perms, projectCode) => {
-      const tree = buildTree(perms);
-      result.set(projectCode, tree);
+    // 找出所有一级菜单
+    permissions.filter(p => p.type === 'MENU' && !p.parentCode).forEach(menu => {
+      menuMap.set(menu.code, { menu, pages: new Map() });
     });
 
-    return result;
-  };
+    // 找出所有二级页面，归属到对应菜单
+    permissions.filter(p => p.type === 'PAGE').forEach(page => {
+      // 找父级菜单
+      let parentCode = page.parentCode;
+      while (parentCode) {
+        const parent = codeMap.get(parentCode);
+        if (parent?.type === 'MENU') {
+          if (menuMap.has(parentCode)) {
+            menuMap.get(parentCode)!.pages.set(page.code, { page, actions: [] });
+          }
+          break;
+        }
+        parentCode = parent?.parentCode;
+      }
+    });
 
-  const buildTree = (list: Permission[]): any[] => {
-    const map = new Map<string, any>();
-    const roots: any[] = [];
-
-    list.forEach((perm) => {
-      const typeInfo = permissionTypes.find((t) => t.value === perm.type);
-      map.set(perm.code, {
-        key: perm.code,
-        title: (
-          <span>
-            <Tag style={{ backgroundColor: typeInfo?.color || '#d9d9d9', color: '#fff', border: 'none', marginRight: 4 }}>
-              {typeInfo?.icon} {typeInfo?.label || perm.type}
-            </Tag>
-            {perm.name}
-            <span style={{ color: '#999', marginLeft: 8, fontSize: 12 }}>({perm.code})</span>
-          </span>
-        ),
-        children: [],
-        data: perm,
-      });
+    // 独立页面（没有父菜单）也加到列表
+    permissions.filter(p => p.type === 'PAGE').forEach(page => {
+      const hasMenu = Array.from(menuMap.values()).some(m => m.pages.has(page.code));
+      if (!hasMenu) {
+        // 创建一个虚拟菜单
+        const virtualMenu: Permission = {
+          ...page,
+          type: 'MENU',
+          name: page.parentCode ? `${page.name}（游离页面）` : `${page.name}模块`,
+          code: `${page.code}_MODULE`,
+        };
+        menuMap.set(virtualMenu.code, { 
+          menu: virtualMenu, 
+          pages: new Map([[page.code, { page, actions: [] }]]) 
+        });
+      }
     });
 
-    list.forEach((perm) => {
-      const node = map.get(perm.code)!;
-      if (perm.parentCode && map.has(perm.parentCode)) {
-        const parent = map.get(perm.parentCode)!;
-        parent.children.push(node);
-      } else {
-        roots.push(node);
+    // 找出所有三级操作，归属到对应页面
+    const assignedActions = new Set<string>();
+    permissions.filter(p => p.type === 'ACTION').forEach(action => {
+      // 找父级页面
+      let parentCode: string | undefined = action.parentCode;
+      while (parentCode) {
+        const parent = codeMap.get(parentCode);
+        if (parent?.type === 'PAGE') {
+          // 遍历所有菜单，找到包含这个页面的
+          const pageCode = parentCode;
+          menuMap.forEach(m => {
+            if (m.pages.has(pageCode)) {
+              m.pages.get(pageCode)!.actions.push(action);
+              assignedActions.add(action.code);
+            }
+          });
+          break;
+        }
+        parentCode = parent?.parentCode;
       }
     });
 
-    return roots;
+    // 处理游离的操作（没有父页面的 ACTION）
+    const orphanActions = permissions.filter(p => p.type === 'ACTION' && !assignedActions.has(p.code));
+    if (orphanActions.length > 0) {
+      // 创建一个统一的"游离权限"模块，包含所有游离操作
+      const virtualMenuCode = 'VIRTUAL_ORPHAN_MODULE';
+      const orphanPages = new Map<string, { page: Permission; actions: Permission[] }>();
+      
+      orphanActions.forEach(action => {
+        const virtualPageCode = `VIRTUAL_PAGE_${action.code}`;
+        const virtualPage: Permission = {
+          ...action,
+          id: -1,
+          type: 'PAGE',
+          name: `${action.name}（游离操作）`,
+          code: virtualPageCode,
+          parentCode: undefined,
+        };
+        orphanPages.set(virtualPageCode, { page: virtualPage, actions: [action] });
+      });
+      
+      const virtualMenu: Permission = {
+        id: -1,
+        code: virtualMenuCode,
+        name: '游离权限',
+        type: 'MENU',
+        status: 'ENABLED',
+      };
+      menuMap.set(virtualMenuCode, {
+        menu: virtualMenu,
+        pages: orphanPages,
+      });
+    }
+
+    return menuMap;
   };
 
-  const handleSelect = (perm: Permission) => {
-    setSelectedPermission(perm);
+  const groupedCards = buildGroupedCards();
+
+  // 左侧导航菜单列表
+  const moduleList = Array.from(groupedCards.entries())
+    .map(([code, data]) => ({
+      code,
+      name: data.menu.name,
+      count: Array.from(data.pages.values()).reduce((sum, p) => sum + 1 + p.actions.length, 0),
+    }));
+
+  // 当前选中的模块
+  const [selectedModule, setSelectedModule] = useState<string>('');
+
+  // 初始化默认选中第一个模块
+  useEffect(() => {
+    if (!selectedModule && moduleList.length > 0) {
+      setSelectedModule(moduleList[0].code);
+    }
+  }, [selectedModule, moduleList]);
+
+  // 搜索过滤逻辑
+  const searchMatches = (keyword: string, data: { menu: Permission; pages: Map<string, { page: Permission; actions: Permission[] }> }): boolean => {
+    const kw = keyword.toLowerCase();
+    // 匹配菜单名
+    if (data.menu.name.toLowerCase().includes(kw)) return true;
+    // 匹配页面名或编码
+    for (const [, pageData] of data.pages) {
+      if (pageData.page.name.toLowerCase().includes(kw)) return true;
+      if (pageData.page.code.toLowerCase().includes(kw)) return true;
+      // 匹配操作名或编码
+      if (pageData.actions.some(a => a.name.toLowerCase().includes(kw) || a.code.toLowerCase().includes(kw))) return true;
+    }
+    return false;
   };
 
-  // 项目排序：按项目名称排序
-  const sortedProjectCodes = Array.from(projectTreeData.keys()).sort((a, b) => {
-    const nameA = projects.find(p => p.code === a)?.name || a;
-    const nameB = projects.find(p => p.code === b)?.name || b;
-    return nameA.localeCompare(nameB);
+  // 过滤逻辑：搜索时展示所有匹配的模块，否则只展示选中的模块
+  const filteredModules = Array.from(groupedCards.entries()).filter(([menuCode, data]) => {
+    // 有搜索关键词时，全局搜索
+    if (searchKeyword) {
+      return searchMatches(searchKeyword, data);
+    }
+    // 无搜索时，只展示选中的模块
+    return menuCode === selectedModule;
   });
 
+  // 左侧导航高亮：搜索时不高亮任何项
+  const highlightModule = searchKeyword ? '' : selectedModule;
+
   return (
     <div>
-      {loading ? (
+      {/* 项目选择器 */}
+      <Card size="small" style={{ marginBottom: 16 }}>
+        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
+          <span style={{ fontWeight: 500 }}>选择项目：</span>
+          <Select
+            style={{ width: 200 }}
+            placeholder="请选择项目"
+            value={selectedProject || undefined}
+            onChange={(value) => {
+              setSelectedProject(value);
+              setSelectedModule('');
+              setSearchKeyword('');
+            }}
+            allowClear
+          >
+            {projects.map(p => (
+              <Select.Option key={p.code} value={p.code}>
+                {p.name} ({p.code})
+              </Select.Option>
+            ))}
+          </Select>
+          {selectedProject && (
+            <>
+              <Tag color="blue">
+                当前项目：{projects.find(p => p.code === selectedProject)?.name || selectedProject}
+              </Tag>
+              <Button type="primary" icon={<PlusOutlined />} onClick={() => onCreate(selectedProject)}>
+                新建权限点
+              </Button>
+            </>
+          )}
+        </div>
+      </Card>
+
+      {!selectedProject ? (
+        <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
+          <FolderOutlined style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }} />
+          <div style={{ fontSize: 16, marginBottom: 8 }}>请先选择一个项目</div>
+          <div style={{ fontSize: 12 }}>选择项目后将展示该项目的权限配置</div>
+        </div>
+      ) : loading ? (
         <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
       ) : permissions.length === 0 ? (
         <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
-          暂无权限数据，请先创建
+          该项目暂无权限数据，请先创建
         </div>
       ) : (
-        <div style={{ display: 'flex', gap: 16 }}>
-          <div style={{ flex: 1, minHeight: 500, overflow: 'auto' }}>
-            <Collapse
-              defaultActiveKey={sortedProjectCodes}
-              style={{ background: '#fff', borderRadius: 8 }}
-            >
-              {sortedProjectCodes.map((projectCode) => {
-                const project = projects.find(p => p.code === projectCode);
-                const treeNodes = projectTreeData.get(projectCode) || [];
-                const projectName = project?.name || projectCode;
-                const permCount = treeNodes.length;
-                
-                return (
-                  <Collapse.Panel
-                    key={projectCode}
-                    header={
-                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
-                        <FolderOutlined style={{ color: '#1890ff' }} />
-                        <strong>{projectName}</strong>
-                        <Tag color="blue" style={{ marginLeft: 8 }}>{projectCode}</Tag>
-                        <span style={{ color: '#999', fontSize: 12 }}>({permCount} 个权限)</span>
-                      </span>
-                    }
-                    style={{ marginBottom: 8 }}
-                  >
-                    <div style={{ paddingLeft: 8 }}>
-                      {treeNodes.map((node) => (
-                        <TreeNodeItem
-                          key={node.key}
-                          node={node}
-                          level={0}
-                          onSelect={handleSelect}
-                          selectedCode={selectedPermission?.code}
-                        />
-                      ))}
-                    </div>
-                  </Collapse.Panel>
-                );
-              })}
-            </Collapse>
+        <div style={{ display: 'flex', gap: 16, minHeight: 500 }}>
+          {/* 左侧导航栏 */}
+          <div style={{ width: 200, flexShrink: 0 }}>
+            <Card size="small" style={{ marginBottom: 8 }}>
+              <Input.Search
+                placeholder="搜索权限..."
+                allowClear
+                value={searchKeyword}
+                onChange={e => setSearchKeyword(e.target.value)}
+                style={{ marginBottom: 8 }}
+              />
+            </Card>
+            <Card size="small" style={{ padding: 0 }}>
+              {moduleList.map(mod => (
+                <div
+                  key={mod.code}
+                  style={{
+                    padding: '8px 12px',
+                    cursor: 'pointer',
+                    backgroundColor: highlightModule === mod.code ? '#e6f7ff' : 'transparent',
+                    borderRadius: 4,
+                    marginBottom: 4,
+                    borderLeft: highlightModule === mod.code ? '3px solid #1890ff' : '3px solid transparent',
+                  }}
+                  onClick={() => {
+                    setSelectedModule(mod.code);
+                    setSearchKeyword(''); // 切换模块时清空搜索
+                  }}
+                >
+                  <span>{mod.name}</span>
+                  <span style={{ float: 'right', color: '#999', fontSize: 12 }}>{mod.count}</span>
+                </div>
+              ))}
+            </Card>
           </div>
 
-          {selectedPermission && (
-            <Card size="small" title="权限详情" style={{ width: 350 }}>
-              <div style={{ marginBottom: 16 }}>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>编码：</strong> {selectedPermission.code}
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>名称：</strong> {selectedPermission.name}
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>类型：</strong>{' '}
-                  <Tag color={selectedPermission.type === 'MENU' ? 'blue' : selectedPermission.type === 'PAGE' ? 'cyan' : selectedPermission.type === 'ACTION' ? 'green' : 'orange'}>
-                    {permissionTypes.find((t) => t.value === selectedPermission.type)?.label || selectedPermission.type}
-                  </Tag>
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>项目：</strong> {projects.find(p => p.code === selectedPermission.systemCode)?.name || selectedPermission.systemCode}
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>父级：</strong> {selectedPermission.parentCode || '-'}
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>排序：</strong> {selectedPermission.sortOrder || '-'}
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>状态：</strong>{' '}
-                  <Tag color={selectedPermission.status === 'ENABLED' ? 'success' : 'error'}>
-                    {selectedPermission.status === 'ENABLED' ? '启用' : '禁用'}
-                  </Tag>
-                </div>
-                <div style={{ marginBottom: 8 }}>
-                  <strong>描述：</strong> {selectedPermission.description || '-'}
+          {/* 右侧卡片区域 */}
+          <div style={{ flex: 1, overflow: 'auto', maxHeight: 'calc(100vh - 340px)' }}>
+            {filteredModules.map(([menuCode, data]) => (
+              <div key={menuCode} style={{ marginBottom: 24 }}>
+                {/* 模块标题 */}
+                <div style={{ 
+                  fontSize: 16, 
+                  fontWeight: 'bold', 
+                  marginBottom: 12,
+                  paddingBottom: 8,
+                  borderBottom: '1px solid #f0f0f0',
+                  display: 'flex',
+                  alignItems: 'center',
+                  gap: 8,
+                }}>
+                  <FolderOutlined style={{ color: '#1890ff' }} />
+                  {data.menu.name}
+                  <span style={{ color: '#999', fontWeight: 'normal', fontSize: 12 }}>
+                    ({data.pages.size} 个页面)
+                  </span>
                 </div>
+
+                {/* 页面卡片网格 */}
+                {data.pages.size > 0 ? (
+                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
+                    {Array.from(data.pages.entries()).map(([pageCode, pageData]) => (
+                      <PermissionCard
+                        key={pageCode}
+                        page={pageData.page}
+                        actions={pageData.actions}
+                        onEdit={onEdit}
+                        onDelete={onDelete}
+                        selectedPermission={selectedPermission}
+                        onSelect={setSelectedPermission}
+                      />
+                    ))}
+                  </div>
+                ) : (
+                  <div style={{ 
+                    textAlign: 'center', 
+                    padding: 40, 
+                    color: '#999', 
+                    backgroundColor: '#fafafa',
+                    borderRadius: 8,
+                    border: '1px dashed #d9d9d9',
+                  }}>
+                    <FolderOutlined style={{ fontSize: 32, marginBottom: 8, color: '#d9d9d9' }} />
+                    <div>暂无子权限，点击上方"添加子权限"按钮创建</div>
+                  </div>
+                )}
               </div>
-              <Space>
-                <Button size="small" type="primary" onClick={() => onEdit(selectedPermission)}>
-                  编辑
-                </Button>
-                <Popconfirm title="确定删除?" onConfirm={() => onDelete(selectedPermission.id)}>
-                  <Button size="small" danger>
-                    删除
-                  </Button>
-                </Popconfirm>
-              </Space>
-            </Card>
-          )}
+            ))}
+          </div>
         </div>
       )}
     </div>
   );
 };
 
-interface TreeNodeItemProps {
-  node: any;
-  level: number;
-  onSelect: (perm: Permission) => void;
-  selectedCode?: string;
+// 权限卡片组件
+interface PermissionCardProps {
+  page: Permission;
+  actions: Permission[];
+  onEdit: (perm: Permission) => void;
+  onDelete: (id: number) => void;
+  selectedPermission: Permission | null;
+  onSelect: (perm: Permission | null) => void;
 }
 
-const TreeNodeItem: React.FC<TreeNodeItemProps> = ({ node, level, onSelect, selectedCode }) => {
+const PermissionCard: React.FC<PermissionCardProps> = ({ 
+  page, 
+  actions, 
+  onEdit, 
+  onDelete, 
+  selectedPermission,
+  onSelect,
+}) => {
+  const isSelected = selectedPermission?.code === page.code;
   const [expanded, setExpanded] = useState(true);
-  const hasChildren = node.children && node.children.length > 0;
-  const isSelected = selectedCode === node.key;
 
   return (
-    <div style={{ marginBottom: 4 }}>
-      <div
-        style={{
-          padding: '4px 8px',
-          cursor: 'pointer',
-          borderRadius: 4,
-          backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
-          borderLeft: `3px solid ${level === 1 ? '#1890ff' : level === 2 ? '#52c41a' : '#fa8c16'}`,
-        }}
-        onClick={() => onSelect(node.data)}
-      >
-        {hasChildren && (
-          <span
-            onClick={(e) => {
-              e.stopPropagation();
-              setExpanded(!expanded);
-            }}
-            style={{ marginRight: 4 }}
-          >
-            {expanded ? '▼' : '▶'}
+    <Card
+      size="small"
+      hoverable
+      style={{ 
+        width: 280,
+        borderColor: isSelected ? '#1890ff' : undefined,
+        boxShadow: isSelected ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : undefined,
+      }}
+      onClick={() => onSelect(isSelected ? null : page)}
+    >
+      {/* 卡片标题栏 */}
+      <div style={{ 
+        display: 'flex', 
+        alignItems: 'center', 
+        justifyContent: 'space-between',
+        marginBottom: 8,
+      }}>
+        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
+          <Tag color="cyan" style={{ margin: 0 }}>📄 页面</Tag>
+          <strong>{page.name}</strong>
+        </div>
+        <Space size={0}>
+          <Button 
+            type="text" 
+            size="small" 
+            icon={<EditOutlined />}
+            onClick={(e) => { e.stopPropagation(); onEdit(page); }}
+          />
+        </Space>
+      </div>
+
+      {/* 操作列表 */}
+      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
+        <div 
+          style={{ 
+            display: 'flex', 
+            alignItems: 'center', 
+            justifyContent: 'space-between',
+            cursor: 'pointer',
+            marginBottom: 4,
+          }}
+          onClick={() => setExpanded(!expanded)}
+        >
+          <span style={{ color: '#666', fontSize: 12 }}>
+            操作权限 ({actions.length + 1})
           </span>
+          {expanded ? <span style={{ fontSize: 10 }}>▼</span> : <span style={{ fontSize: 10 }}>▶</span>}
+        </div>
+
+        {expanded && (
+          <>
+            {/* 页面访问权限 */}
+            <div
+              style={{
+                padding: '6px 8px',
+                margin: '4px 0',
+                backgroundColor: selectedPermission?.code === page.code ? '#e6f7ff' : '#fafafa',
+                borderRadius: 4,
+                display: 'flex',
+                alignItems: 'center',
+                justifyContent: 'space-between',
+              }}
+              onClick={() => onSelect(isSelected ? null : page)}
+            >
+              <span>
+                <Tag color="green" style={{ margin: 0, marginRight: 4 }}>⚡</Tag>
+                页面访问
+                <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }} title={page.code}>
+                  ({page.code})
+                </span>
+              </span>
+              <Button 
+                type="link" 
+                size="small"
+                onClick={(e) => { e.stopPropagation(); onEdit(page); }}
+              >
+                编辑
+              </Button>
+            </div>
+
+            {/* 其他操作权限 */}
+            {actions.map(action => (
+              <div
+                key={action.code}
+                style={{
+                  padding: '6px 8px',
+                  margin: '4px 0',
+                  backgroundColor: selectedPermission?.code === action.code ? '#e6f7ff' : '#fafafa',
+                  borderRadius: 4,
+                  display: 'flex',
+                  alignItems: 'center',
+                  justifyContent: 'space-between',
+                }}
+                onClick={() => onSelect(selectedPermission?.code === action.code ? null : action)}
+              >
+                <span>
+                  <Tag color="orange" style={{ margin: 0, marginRight: 4 }}>⚡</Tag>
+                  {action.name}
+                  <span style={{ color: '#999', fontSize: 11, marginLeft: 4 }} title={action.code}>
+                    ({action.code})
+                  </span>
+                </span>
+                <Space size={0}>
+                  <Button 
+                    type="link" 
+                    size="small"
+                    onClick={(e) => { e.stopPropagation(); onEdit(action); }}
+                  >
+                    编辑
+                  </Button>
+                  <Popconfirm
+                    title="确定删除该权限?"
+                    onConfirm={(e) => { e?.stopPropagation(); onDelete(action.id); }}
+                    onCancel={(e) => e?.stopPropagation()}
+                  >
+                    <Button 
+                      type="link" 
+                      size="small" 
+                      danger
+                      onClick={(e) => e.stopPropagation()}
+                    >
+                      删除
+                    </Button>
+                  </Popconfirm>
+                </Space>
+              </div>
+            ))}
+          </>
         )}
-        {node.title}
       </div>
-      {hasChildren && expanded && (
-        <div style={{ paddingLeft: 16 }}>
-          {node.children.map((child: any) => (
-            <TreeNodeItem
-              key={child.key}
-              node={child}
-              level={level + 1}
-              onSelect={onSelect}
-              selectedCode={selectedCode}
-            />
-          ))}
-        </div>
-      )}
-    </div>
+    </Card>
   );
 };
 
diff --git a/permission-web-frontend/src/pages/ProjectPage.tsx b/permission-web-frontend/src/pages/ProjectPage.tsx
index 9ba83f9..7b42a8a 100644
--- a/permission-web-frontend/src/pages/ProjectPage.tsx
+++ b/permission-web-frontend/src/pages/ProjectPage.tsx
@@ -1,9 +1,9 @@
 import React, { useState, useEffect, useCallback } from 'react';
-import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Card } from 'antd';
+import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Card, Tag, Divider } from 'antd';
 import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
 import type { ColumnsType } from 'antd/es/table';
 import { listProjects, createProject, updateProject, deleteProject } from '@/services/api';
-import type { Project, ProjectRequest } from '@/types';
+import type { Project, ProjectRequest, SystemModule } from '@/types';
 
 const ProjectPage: React.FC = () => {
   const [loading, setLoading] = useState(false);
@@ -14,6 +14,7 @@ const ProjectPage: React.FC = () => {
   const [modalVisible, setModalVisible] = useState(false);
   const [editingProject, setEditingProject] = useState<Project | null>(null);
   const [form] = Form.useForm();
+  const [systems, setSystems] = useState<SystemModule[]>([]);
 
   const loadData = useCallback(async () => {
     setLoading(true);
@@ -36,12 +37,14 @@ const ProjectPage: React.FC = () => {
   const handleCreate = () => {
     setEditingProject(null);
     form.resetFields();
+    setSystems([]);
     setModalVisible(true);
   };
 
   const handleEdit = (record: Project) => {
     setEditingProject(record);
     form.setFieldsValue(record);
+    setSystems(record.systems || []);
     setModalVisible(true);
   };
 
@@ -57,11 +60,12 @@ const ProjectPage: React.FC = () => {
 
   const handleSubmit = async (values: ProjectRequest) => {
     try {
+      const submitData = { ...values, systems };
       if (editingProject) {
-        await updateProject(editingProject.id, values);
+        await updateProject(editingProject.id, submitData);
         message.success('更新成功');
       } else {
-        await createProject(values);
+        await createProject(submitData);
         message.success('创建成功');
       }
       setModalVisible(false);
@@ -71,6 +75,25 @@ const ProjectPage: React.FC = () => {
     }
   };
 
+  // 添加系统模块
+  const handleAddSystem = () => {
+    setSystems([...systems, { code: '', name: '' }]);
+  };
+
+  // 删除系统模块
+  const handleRemoveSystem = (index: number) => {
+    const newSystems = [...systems];
+    newSystems.splice(index, 1);
+    setSystems(newSystems);
+  };
+
+  // 更新系统模块
+  const handleUpdateSystem = (index: number, field: 'code' | 'name', value: string) => {
+    const newSystems = [...systems];
+    newSystems[index] = { ...newSystems[index], [field]: value };
+    setSystems(newSystems);
+  };
+
   const columns: ColumnsType<Project> = [
     {
       title: '项目编码',
@@ -83,6 +106,25 @@ const ProjectPage: React.FC = () => {
       dataIndex: 'name',
       key: 'name',
     },
+    {
+      title: '系统模块',
+      dataIndex: 'systems',
+      key: 'systems',
+      width: 300,
+      render: (systems: SystemModule[]) => (
+        <>
+          {systems && systems.length > 0 ? (
+            systems.map((s, index) => (
+              <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
+                {s.name}
+              </Tag>
+            ))
+          ) : (
+            <span style={{ color: '#999' }}>暂无</span>
+          )}
+        </>
+      ),
+    },
     {
       title: '描述',
       dataIndex: 'description',
@@ -149,6 +191,7 @@ const ProjectPage: React.FC = () => {
         onCancel={() => setModalVisible(false)}
         onOk={() => form.submit()}
         destroyOnClose
+        width={600}
       >
         <Form form={form} layout="vertical" onFinish={handleSubmit}>
           <Form.Item
@@ -172,15 +215,49 @@ const ProjectPage: React.FC = () => {
             <Input placeholder="请输入项目名称" />
           </Form.Item>
           <Form.Item name="description" label="描述">
-            <Input.TextArea rows={3} placeholder="请输入描述" maxLength={256} />
+            <Input.TextArea rows={2} placeholder="请输入描述" maxLength={256} />
           </Form.Item>
+          
+          <Divider orientation="left">系统模块配置</Divider>
+          <div style={{ marginBottom: 16, color: '#666', fontSize: 12 }}>
+            系统模块用于权限分类，如：用户中心、订单中心等。配置后可在权限管理中选择。
+          </div>
+          
+          {systems.map((system, index) => (
+            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
+              <Input
+                style={{ flex: 1 }}
+                placeholder="模块编码（如 USER_CENTER）"
+                value={system.code}
+                onChange={(e) => handleUpdateSystem(index, 'code', e.target.value)}
+              />
+              <Input
+                style={{ flex: 1 }}
+                placeholder="模块名称（如 用户中心）"
+                value={system.name}
+                onChange={(e) => handleUpdateSystem(index, 'name', e.target.value)}
+              />
+              <Button 
+                danger 
+                icon={<DeleteOutlined />} 
+                onClick={() => handleRemoveSystem(index)}
+              />
+            </div>
+          ))}
+          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddSystem} block>
+            添加系统模块
+          </Button>
+          
           {editingProject && (
-            <Form.Item name="status" label="状态">
-              <Select>
-                <Select.Option value="ENABLED">启用</Select.Option>
-                <Select.Option value="DISABLED">禁用</Select.Option>
-              </Select>
-            </Form.Item>
+            <>
+              <Divider />
+              <Form.Item name="status" label="状态">
+                <Select>
+                  <Select.Option value="ENABLED">启用</Select.Option>
+                  <Select.Option value="DISABLED">禁用</Select.Option>
+                </Select>
+              </Form.Item>
+            </>
           )}
         </Form>
       </Modal>
diff --git a/permission-web-frontend/src/pages/RolePage.tsx b/permission-web-frontend/src/pages/RolePage.tsx
index 094cd31..2c563dc 100644
--- a/permission-web-frontend/src/pages/RolePage.tsx
+++ b/permission-web-frontend/src/pages/RolePage.tsx
@@ -22,8 +22,9 @@ import {
   getRoleDetail,
   grantPermissionsToRole,
   listPermissions,
+  listAllProjects,
 } from '@/services/api';
-import type { Role, RoleRequest, Permission } from '@/types';
+import type { Role, RoleRequest, Permission, Project } from '@/types';
 import styles from './RolePage.module.css';
 
 const RolePage: React.FC = () => {
@@ -38,6 +39,7 @@ const RolePage: React.FC = () => {
   const [selectedRole, setSelectedRole] = useState<Role | null>(null);
   const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
   const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);
+  const [projects, setProjects] = useState<Project[]>([]);
   const [form] = Form.useForm();
 
   // 加载角色列表
@@ -76,10 +78,21 @@ const RolePage: React.FC = () => {
     }
   }, []);
 
+  // 加载项目列表
+  const loadProjects = useCallback(async () => {
+    try {
+      const res = await listAllProjects();
+      setProjects(res.data || []);
+    } catch (error) {
+      console.error('加载项目列表失败', error);
+    }
+  }, []);
+
   useEffect(() => {
     loadData();
     loadAllPermissions();
-  }, [loadData, loadAllPermissions]);
+    loadProjects();
+  }, [loadData, loadAllPermissions, loadProjects]);
 
   // 打开新建弹窗
   const handleCreate = () => {
@@ -207,6 +220,16 @@ const RolePage: React.FC = () => {
         );
       },
     },
+    {
+      title: '所属项目',
+      dataIndex: 'projectId',
+      key: 'projectId',
+      width: 120,
+      render: (projectId: string) => {
+        if (!projectId) return <Tag color="blue">全局</Tag>;
+        return <Tag color="green">{projectId}</Tag>;
+      },
+    },
     {
       title: '描述',
       dataIndex: 'description',
@@ -400,6 +423,20 @@ const RolePage: React.FC = () => {
             </Select>
           </Form.Item>
 
+          <Form.Item 
+            name="projectId" 
+            label="所属项目"
+            tooltip="留空表示全局角色，所有项目可用；选择项目则只有该项目下的用户可用"
+          >
+            <Select placeholder="留空表示全局角色" allowClear showSearch optionFilterProp="label">
+              {projects.map(p => (
+                <Select.Option key={p.code} value={p.code} label={p.name}>
+                  {p.name} ({p.code})
+                </Select.Option>
+              ))}
+            </Select>
+          </Form.Item>
+
           <Form.Item name="description" label="描述">
             <Input.TextArea rows={3} placeholder="请输入描述" />
           </Form.Item>
diff --git a/permission-web-frontend/src/pages/UserGrantPage.module.css b/permission-web-frontend/src/pages/UserGrantPage.module.css
index a87bad5..a2be442 100644
--- a/permission-web-frontend/src/pages/UserGrantPage.module.css
+++ b/permission-web-frontend/src/pages/UserGrantPage.module.css
@@ -65,3 +65,50 @@
   font-size: 13px;
   color: #d46b08;
 }
+
+/* 权限树 */
+.permissionTree {
+  display: flex;
+  flex-direction: column;
+  gap: 16px;
+}
+
+.moduleSection {
+  border: 1px solid #e8e8e8;
+  border-radius: 8px;
+  overflow: hidden;
+}
+
+.moduleHeader {
+  padding: 12px 16px;
+  background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
+  border-bottom: 1px solid #e8e8e8;
+  display: flex;
+  align-items: center;
+}
+
+.moduleContent {
+  padding: 12px 16px;
+  background: #fff;
+}
+
+.pageSection {
+  padding: 8px 0;
+  border-bottom: 1px solid #f0f0f0;
+}
+
+.pageSection:last-child {
+  border-bottom: none;
+}
+
+.actionList {
+  margin-left: 24px;
+  margin-top: 8px;
+  display: flex;
+  flex-wrap: wrap;
+  gap: 8px;
+}
+
+.actionList > label {
+  margin-right: 16px;
+}
diff --git a/permission-web-frontend/src/pages/UserGrantPage.tsx b/permission-web-frontend/src/pages/UserGrantPage.tsx
index 38c6407..e7cbca2 100644
--- a/permission-web-frontend/src/pages/UserGrantPage.tsx
+++ b/permission-web-frontend/src/pages/UserGrantPage.tsx
@@ -1,6 +1,6 @@
-import React, { useState, useEffect } from 'react';
+import React, { useState, useEffect, useMemo } from 'react';
+import { useSearchParams } from 'react-router-dom';
 import {
-  Table,
   Button,
   Space,
   Modal,
@@ -11,20 +11,23 @@ import {
   Tag,
   Card,
   Select,
-  Tabs,
   Divider,
   Typography,
+  Tree,
+  Checkbox,
+  Empty,
+  Spin,
 } from 'antd';
 import { 
-  TeamOutlined, 
   DeleteOutlined, 
   SafetyOutlined, 
   BlockOutlined,
   UserOutlined,
   PlusOutlined,
   ReloadOutlined,
+  FolderOutlined,
+  CrownOutlined,
 } from '@ant-design/icons';
-import type { ColumnsType } from 'antd/es/table';
 import {
   getUserAuthDetail,
   assignUserRole,
@@ -33,58 +36,141 @@ import {
   revokeUserPermission,
   listAllRoles,
   listAllPermissions,
+  listAllProjects,
 } from '@/services/api';
 import type { 
   UserRole, 
   UserDirectPermission, 
   Role, 
   Permission,
+  Project,
   AssignUserRoleRequest,
   GrantUserPermissionRequest,
 } from '@/types';
 import styles from './UserGrantPage.module.css';
 
-const { Text } = Typography;
+const { Text, Title } = Typography;
+
+// 权限树节点
+interface PermissionTreeNode {
+  key: string;
+  title: string;
+  code: string;
+  type: string;
+  children?: PermissionTreeNode[];
+  permissionId?: number;
+}
 
 const UserGrantPage: React.FC = () => {
+  const [searchParams, setSearchParams] = useSearchParams();
   const [loading, setLoading] = useState(false);
-  const [userId, setUserId] = useState('');
-  const [projectId, setProjectId] = useState<string | undefined>(undefined);
+  const [userId, setUserId] = useState(() => searchParams.get('userId') || '');
+  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => searchParams.get('projectId') || '');
+  
+  // 项目和角色数据
+  const [projects, setProjects] = useState<Project[]>([]);
+  const [projectRoles, setProjectRoles] = useState<Role[]>([]);
+  const [projectPermissions, setProjectPermissions] = useState<Permission[]>([]);
   
-  // 授权数据
+  // 用户当前授权数据
   const [userRoles, setUserRoles] = useState<UserRole[]>([]);
   const [directPermissions, setDirectPermissions] = useState<UserDirectPermission[]>([]);
   
   // 弹窗
   const [roleModalVisible, setRoleModalVisible] = useState(false);
-  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
-  
-  // 选项数据
-  const [allRoles, setAllRoles] = useState<Role[]>([]);
-  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
   
-  // 表单
-  const [roleForm] = Form.useForm();
-  const [permissionForm] = Form.useForm();
-
-  // 加载选项数据
-  const loadOptions = async () => {
-    try {
-      const [rolesRes, permsRes] = await Promise.all([
-        listAllRoles(),
-        listAllPermissions(),
-      ]);
-      setAllRoles(rolesRes.data);
-      setAllPermissions(permsRes.data);
-    } catch {
-      // ignore
-    }
-  };
+  // 已选中的角色和权限
+  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
+  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);
+  const [checkedModuleKeys, setCheckedModuleKeys] = useState<string[]>([]);
 
+  // 加载项目列表
   useEffect(() => {
-    loadOptions();
+    const loadProjects = async () => {
+      try {
+        const res = await listAllProjects();
+        setProjects(res.data || []);
+      } catch {
+        message.error('加载项目列表失败');
+      }
+    };
+    loadProjects();
   }, []);
 
+  // 当选择项目时，加载该项目的角色和权限
+  useEffect(() => {
+    if (!selectedProjectId) {
+      setProjectRoles([]);
+      setProjectPermissions([]);
+      return;
+    }
+
+    const loadProjectData = async () => {
+      try {
+        const [rolesRes, permsRes] = await Promise.all([
+          listAllRoles(),
+          listAllPermissions(selectedProjectId),
+        ]);
+        // 过滤出该项目的角色（或全局角色）
+        const allRoles = rolesRes.data || [];
+        setProjectRoles(allRoles.filter(r => !r.projectId || r.projectId === selectedProjectId));
+        setProjectPermissions(permsRes.data || []);
+      } catch {
+        message.error('加载项目数据失败');
+      }
+    };
+    loadProjectData();
+  }, [selectedProjectId]);
+
+  // 构建权限树
+  const permissionTree = useMemo(() => {
+    if (!projectPermissions.length) return [];
+
+    // 构建 MENU -> PAGE -> ACTION 三层树
+    const menuMap = new Map<string, PermissionTreeNode>();
+    const pageMap = new Map<string, PermissionTreeNode>();
+    const actionMap = new Map<string, PermissionTreeNode>();
+
+    // 先分类
+    projectPermissions.forEach(perm => {
+      const node: PermissionTreeNode = {
+        key: perm.code,
+        title: perm.name,
+        code: perm.code,
+        type: perm.type,
+        permissionId: perm.id,
+      };
+
+      if (perm.type === 'MENU') {
+        menuMap.set(perm.code, { ...node, children: [] });
+      } else if (perm.type === 'PAGE') {
+        pageMap.set(perm.code, { ...node, children: [] });
+      } else if (perm.type === 'ACTION') {
+        actionMap.set(perm.code, node);
+      }
+    });
+
+    // ACTION 归属到 PAGE
+    projectPermissions.filter(p => p.type === 'ACTION').forEach(perm => {
+      const actionNode = actionMap.get(perm.code);
+      const pageNode = pageMap.get(perm.parentCode || '');
+      if (actionNode && pageNode && pageNode.children) {
+        pageNode.children.push(actionNode);
+      }
+    });
+
+    // PAGE 归属到 MENU
+    projectPermissions.filter(p => p.type === 'PAGE').forEach(perm => {
+      const pageNode = pageMap.get(perm.code);
+      const menuNode = menuMap.get(perm.parentCode || '');
+      if (pageNode && menuNode && menuNode.children) {
+        menuNode.children.push(pageNode);
+      }
+    });
+
+    return Array.from(menuMap.values());
+  }, [projectPermissions]);
+
   // 查询用户授权详情
   const handleSearch = async () => {
     if (!userId) {
@@ -92,11 +178,30 @@ const UserGrantPage: React.FC = () => {
       return;
     }
 
+    // 更新 URL 参数
+    setSearchParams({ userId, projectId: selectedProjectId });
+
     setLoading(true);
     try {
       const res = await getUserAuthDetail(userId);
-      setUserRoles(res.data.roles || []);
-      setDirectPermissions(res.data.directPermissions || []);
+      const roles = res.data.roles || [];
+      const perms = res.data.directPermissions || [];
+      
+      setUserRoles(roles);
+      setDirectPermissions(perms);
+      
+      // 同步勾选状态
+      if (selectedProjectId) {
+        const projectRoleIds = projectRoles
+          .filter(r => roles.some(ur => ur.roleCode === r.code && (!ur.projectId || ur.projectId === selectedProjectId)))
+          .map(r => r.id);
+        setSelectedRoleIds(projectRoleIds);
+
+        const projectPermCodes = perms
+          .filter(p => p.projectId === selectedProjectId || !p.projectId)
+          .map(p => p.permissionCode);
+        setSelectedPermissionCodes(projectPermCodes);
+      }
     } catch (error) {
       message.error(error instanceof Error ? error.message : '查询失败');
       setUserRoles([]);
@@ -106,30 +211,59 @@ const UserGrantPage: React.FC = () => {
     }
   };
 
-  // 打开角色授权弹窗
-  const handleOpenRoleModal = () => {
-    if (!userId) {
-      message.warning('请先输入用户ID');
-      return;
+  // 当项目切换时，计算当前项目的用户权限数据
+  const currentProjectUserRoles = useMemo(() => {
+    if (!selectedProjectId) return [];
+    return userRoles.filter(r => !r.projectId || r.projectId === selectedProjectId);
+  }, [userRoles, selectedProjectId]);
+
+  const currentProjectUserPermissions = useMemo(() => {
+    if (!selectedProjectId) return [];
+    return directPermissions.filter(p => !p.projectId || p.projectId === selectedProjectId);
+  }, [directPermissions, selectedProjectId]);
+
+  // 从 URL 参数恢复时自动查询（放在 handleSearch 定义之后）
+  const [initialLoadDone, setInitialLoadDone] = useState(false);
+  useEffect(() => {
+    if (!initialLoadDone && userId && selectedProjectId && projectRoles.length > 0) {
+      setInitialLoadDone(true);
+      // 自动触发查询（复用 handleSearch 的逻辑）
+      const autoSearch = async () => {
+        setLoading(true);
+        try {
+          const res = await getUserAuthDetail(userId);
+          const roles = res.data.roles || [];
+          const perms = res.data.directPermissions || [];
+          setUserRoles(roles);
+          setDirectPermissions(perms);
+          
+          const projectPermCodes = perms
+            .filter(p => p.projectId === selectedProjectId || !p.projectId)
+            .map(p => p.permissionCode);
+          setSelectedPermissionCodes(projectPermCodes);
+        } catch (error) {
+          console.error('自动查询失败:', error);
+        } finally {
+          setLoading(false);
+        }
+      };
+      autoSearch();
     }
-    roleForm.resetFields();
-    roleForm.setFieldsValue({ projectId: projectId || undefined });
-    setRoleModalVisible(true);
-  };
+  }, [initialLoadDone, userId, selectedProjectId, projectRoles.length]);
 
-  // 提交角色授权
-  const handleSubmitRole = async (values: AssignUserRoleRequest) => {
+  // 分配角色
+  const handleAssignRole = async (roleId: number) => {
+    if (!userId) return;
     try {
       await assignUserRole({
         userId,
-        roleId: values.roleId,
-        projectId: values.projectId || undefined,
+        roleId,
+        projectId: selectedProjectId,
       });
       message.success('角色分配成功');
-      setRoleModalVisible(false);
       handleSearch();
     } catch (error) {
-      message.error(error instanceof Error ? error.message : '授权失败');
+      message.error(error instanceof Error ? error.message : '分配失败');
     }
   };
 
@@ -148,34 +282,20 @@ const UserGrantPage: React.FC = () => {
     }
   };
 
-  // 打开权限授权弹窗
-  const handleOpenPermissionModal = () => {
-    if (!userId) {
-      message.warning('请先输入用户ID');
-      return;
-    }
-    permissionForm.resetFields();
-    permissionForm.setFieldsValue({ 
-      projectId: projectId || undefined,
-      effect: 'ALLOW' 
-    });
-    setPermissionModalVisible(true);
-  };
-
-  // 提交权限授权
-  const handleSubmitPermission = async (values: GrantUserPermissionRequest) => {
+  // 授予权限
+  const handleGrantPermission = async (permissionCode: string, effect: 'ALLOW' | 'DENY' = 'ALLOW') => {
+    if (!userId) return;
     try {
       await grantUserPermission({
         userId,
-        permissionCode: values.permissionCode,
-        effect: values.effect,
-        projectId: values.projectId || undefined,
+        permissionCode,
+        effect,
+        projectId: selectedProjectId,
       });
-      message.success(`${values.effect === 'ALLOW' ? '授权' : '排除'}权限成功`);
-      setPermissionModalVisible(false);
+      message.success('权限授予成功');
       handleSearch();
     } catch (error) {
-      message.error(error instanceof Error ? error.message : '操作失败');
+      message.error(error instanceof Error ? error.message : '授权失败');
     }
   };
 
@@ -195,102 +315,49 @@ const UserGrantPage: React.FC = () => {
     }
   };
 
-  // 角色表格列
-  const roleColumns: ColumnsType<UserRole> = [
-    {
-      title: '角色编码',
-      dataIndex: 'roleCode',
-      key: 'roleCode',
-      width: 150,
-      render: (text: string) => <span className={styles.codeText}>{text}</span>,
-    },
-    {
-      title: '角色名称',
-      dataIndex: 'roleName',
-      key: 'roleName',
-      width: 150,
-    },
-    {
-      title: '范围',
-      dataIndex: 'roleScope',
-      key: 'roleScope',
-      width: 80,
-      render: (scope: string) => (
-        <Tag color={scope === 'GLOBAL' ? 'blue' : 'green'}>
-          {scope === 'GLOBAL' ? '全局' : '项目'}
-        </Tag>
-      ),
-    },
-    {
-      title: '项目ID',
-      dataIndex: 'projectId',
-      key: 'projectId',
-      width: 120,
-      render: (text: string) => text ? <Tag>{text}</Tag> : <Text type="secondary">全局</Text>,
-    },
-    {
-      title: '操作',
-      key: 'action',
-      width: 80,
-      render: (_, record) => (
-        <Popconfirm
-          title="确定要移除该角色吗？"
-          onConfirm={() => handleRemoveRole(record)}
-        >
-          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
-            移除
-          </Button>
-        </Popconfirm>
-      ),
-    },
-  ];
-
-  // 权限表格列
-  const permissionColumns: ColumnsType<UserDirectPermission> = [
-    {
-      title: '权限编码',
-      dataIndex: 'permissionCode',
-      key: 'permissionCode',
-      width: 180,
-      render: (text: string) => <span className={styles.codeText}>{text}</span>,
-    },
-    {
-      title: '效果',
-      dataIndex: 'effect',
-      key: 'effect',
-      width: 100,
-      render: (effect: string) => (
-        <Tag 
-          color={effect === 'ALLOW' ? 'success' : 'error'}
-          icon={effect === 'ALLOW' ? <SafetyOutlined /> : <BlockOutlined />}
-        >
-          {effect === 'ALLOW' ? '允许' : '拒绝'}
-        </Tag>
-      ),
-    },
-    {
-      title: '项目ID',
-      dataIndex: 'projectId',
-      key: 'projectId',
-      width: 120,
-      render: (text: string) => text ? <Tag>{text}</Tag> : <Text type="secondary">全局</Text>,
-    },
-    {
-      title: '操作',
-      key: 'action',
-      width: 80,
-      render: (_, record) => (
-        <Popconfirm
-          title="确定要移除该权限吗？"
-          onConfirm={() => handleRemovePermission(record)}
-        >
-          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
-            移除
-          </Button>
-        </Popconfirm>
-      ),
-    },
-  ];
+  // 模块勾选变化（整模块授权/取消）
+  const handleModuleCheck = (menuCode: string, checked: boolean) => {
+    // 找到该模块下所有权限
+    const menuNode = permissionTree.find(n => n.code === menuCode);
+    if (!menuNode) return;
+
+    const allCodes: string[] = [];
+    menuNode.children?.forEach(page => {
+      allCodes.push(page.code);
+      page.children?.forEach(action => {
+        allCodes.push(action.code);
+      });
+    });
+
+    if (checked) {
+      // 批量授权
+      setSelectedPermissionCodes(prev => [...new Set([...prev, ...allCodes])]);
+      allCodes.forEach(code => {
+        if (!selectedPermissionCodes.includes(code)) {
+          handleGrantPermission(code);
+        }
+      });
+    } else {
+      // 批量取消
+      setSelectedPermissionCodes(prev => prev.filter(c => !allCodes.includes(c)));
+      allCodes.forEach(code => {
+        if (selectedPermissionCodes.includes(code)) {
+          handleRemovePermission({ permissionCode: code, effect: 'ALLOW' } as UserDirectPermission);
+        }
+      });
+    }
+  };
+
+  // 单个权限勾选
+  const handlePermissionCheck = (permissionCode: string, checked: boolean) => {
+    if (checked) {
+      setSelectedPermissionCodes(prev => [...prev, permissionCode]);
+      handleGrantPermission(permissionCode);
+    } else {
+      setSelectedPermissionCodes(prev => prev.filter(c => c !== permissionCode));
+      handleRemovePermission({ permissionCode, effect: 'ALLOW' } as UserDirectPermission);
+    }
+  };
 
   return (
     <Card className={styles.pageCard}>
@@ -304,13 +371,23 @@ const UserGrantPage: React.FC = () => {
             prefix={<UserOutlined />}
             style={{ width: 200 }}
           />
-          <Input
-            placeholder="项目ID（可选）"
-            value={projectId}
-            onChange={(e) => setProjectId(e.target.value || undefined)}
+          <Select
+            placeholder="选择项目"
+            value={selectedProjectId || undefined}
+            onChange={(value) => {
+              setSelectedProjectId(value);
+              setSelectedRoleIds([]);
+              setSelectedPermissionCodes([]);
+            }}
             style={{ width: 200 }}
             allowClear
-          />
+          >
+            {projects.map(p => (
+              <Select.Option key={p.code} value={p.code}>
+                {p.name} ({p.code})
+              </Select.Option>
+            ))}
+          </Select>
           <Button type="primary" onClick={handleSearch} loading={loading}>
             查询
           </Button>
@@ -326,175 +403,224 @@ const UserGrantPage: React.FC = () => {
           <Tag color="blue" icon={<UserOutlined />}>
             用户：{userId}
           </Tag>
-          {projectId && <Tag color="orange">项目：{projectId}</Tag>}
-          <Tag>角色：{userRoles.length} 个</Tag>
-          <Tag>直接权限：{directPermissions.length} 个</Tag>
+          {selectedProjectId && (
+            <Tag color="orange">
+              项目：{projects.find(p => p.code === selectedProjectId)?.name || selectedProjectId}
+            </Tag>
+          )}
         </div>
       )}
 
       <Divider />
 
-      {/* 数据展示 */}
-      <Tabs 
-        defaultActiveKey="roles"
-        items={[
-          {
-            key: 'roles',
-            label: (
+      {/* 未选择项目时提示 */}
+      {!selectedProjectId ? (
+        <Empty description="请先选择项目" style={{ margin: '60px 0' }} />
+      ) : !userId ? (
+        <Empty description="请输入用户ID并查询" style={{ margin: '60px 0' }} />
+      ) : (
+        <div style={{ display: 'flex', gap: 24 }}>
+          {/* 左侧：角色分配 */}
+          <Card 
+            title={
               <span>
-                <TeamOutlined />
-                角色授权 ({userRoles.length})
+                <CrownOutlined style={{ marginRight: 8, color: '#faad14' }} />
+                角色分配
               </span>
-            ),
-            children: (
-              <div className={styles.tabContent}>
-                <div className={styles.tabToolbar}>
-                  <Button 
-                    type="primary" 
-                    icon={<PlusOutlined />} 
-                    onClick={handleOpenRoleModal}
-                  >
-                    分配角色
-                  </Button>
+            }
+            style={{ width: 300, flexShrink: 0 }}
+            size="small"
+          >
+            {/* 项目管理员角色 - 置顶 */}
+            {projectRoles.filter(r => r.code.endsWith('_ADMIN')).map(role => {
+              const isAssigned = currentProjectUserRoles.some(ur => ur.roleCode === role.code);
+              return (
+                <div 
+                  key={role.id} 
+                  style={{ 
+                    padding: '12px', 
+                    marginBottom: 8,
+                    borderRadius: 8,
+                    border: '1px solid #faad14',
+                    background: isAssigned ? '#fffbe6' : '#fff',
+                  }}
+                >
+                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
+                    <div>
+                      <Tag color="gold" icon={<CrownOutlined />}>项目管理员</Tag>
+                      <div style={{ fontWeight: 500, marginTop: 4 }}>{role.name}</div>
+                    </div>
+                    {isAssigned ? (
+                      <Popconfirm
+                        title="确定要移除该角色吗？"
+                        onConfirm={() => handleRemoveRole(currentProjectUserRoles.find(ur => ur.roleCode === role.code)!)}
+                      >
+                        <Button size="small" danger>移除</Button>
+                      </Popconfirm>
+                    ) : (
+                      <Button 
+                        type="primary" 
+                        size="small"
+                        onClick={() => handleAssignRole(role.id)}
+                      >
+                        分配
+                      </Button>
+                    )}
+                  </div>
                 </div>
-                <Table
-                  columns={roleColumns}
-                  dataSource={userRoles}
-                  rowKey="id"
-                  loading={loading}
-                  pagination={false}
-                  size="middle"
-                  className={styles.dataTable}
-                />
-              </div>
-            ),
-          },
-          {
-            key: 'permissions',
-            label: (
+              );
+            })}
+
+            {/* 其他角色 */}
+            {projectRoles.filter(r => !r.code.endsWith('_ADMIN')).length > 0 && (
+              <>
+                <Divider style={{ margin: '12px 0' }} />
+                <div style={{ color: '#666', marginBottom: 8 }}>其他角色</div>
+              </>
+            )}
+            {projectRoles.filter(r => !r.code.endsWith('_ADMIN')).map(role => {
+              const isAssigned = currentProjectUserRoles.some(ur => ur.roleCode === role.code);
+              return (
+                <div 
+                  key={role.id} 
+                  style={{ 
+                    padding: '8px 12px',
+                    marginBottom: 4,
+                    borderRadius: 4,
+                    background: isAssigned ? '#f6ffed' : '#fafafa',
+                    display: 'flex',
+                    justifyContent: 'space-between',
+                    alignItems: 'center',
+                  }}
+                >
+                  <span>{role.name}</span>
+                  {isAssigned ? (
+                    <Popconfirm
+                      title="确定要移除该角色吗？"
+                      onConfirm={() => handleRemoveRole(currentProjectUserRoles.find(ur => ur.roleCode === role.code)!)}
+                    >
+                      <Button type="link" size="small" danger>移除</Button>
+                    </Popconfirm>
+                  ) : (
+                    <Button 
+                      type="link" 
+                      size="small"
+                      onClick={() => handleAssignRole(role.id)}
+                    >
+                      分配
+                    </Button>
+                  )}
+                </div>
+              );
+            })}
+          </Card>
+
+          {/* 右侧：权限授权 */}
+          <Card 
+            title={
               <span>
-                <SafetyOutlined />
-                直接权限 ({directPermissions.length})
+                <SafetyOutlined style={{ marginRight: 8, color: '#52c41a' }} />
+                权限授权
               </span>
-            ),
-            children: (
-              <div className={styles.tabContent}>
-                <div className={styles.tabToolbar}>
-                  <Button 
-                    type="primary" 
-                    icon={<PlusOutlined />} 
-                    onClick={handleOpenPermissionModal}
-                  >
-                    添加直接权限
-                  </Button>
-                </div>
-                <Table
-                  columns={permissionColumns}
-                  dataSource={directPermissions}
-                  rowKey="id"
-                  loading={loading}
-                  pagination={false}
-                  size="middle"
-                  className={styles.dataTable}
-                />
-              </div>
-            ),
-          },
-        ]}
-      />
-
-      {/* 角色分配弹窗 */}
-      <Modal
-        title="分配角色"
-        open={roleModalVisible}
-        onCancel={() => setRoleModalVisible(false)}
-        onOk={() => roleForm.submit()}
-        width={500}
-      >
-        <Form form={roleForm} layout="vertical" onFinish={handleSubmitRole}>
-          <Form.Item
-            name="roleId"
-            label="选择角色"
-            rules={[{ required: true, message: '请选择角色' }]}
-          >
-            <Select
-              placeholder="请选择角色"
-              showSearch
-              optionFilterProp="children"
-            >
-              {allRoles.map((role) => (
-                <Select.Option key={role.id} value={role.id}>
-                  {role.name} ({role.code})
-                </Select.Option>
-              ))}
-            </Select>
-          </Form.Item>
-
-          <Form.Item 
-            name="projectId" 
-            label="项目ID"
-            extra="留空表示全局角色，填写项目ID表示仅在该项目内生效"
-          >
-            <Input placeholder="项目ID（留空表示全局）" allowClear />
-          </Form.Item>
-        </Form>
-      </Modal>
-
-      {/* 权限授权弹窗 */}
-      <Modal
-        title="添加直接权限"
-        open={permissionModalVisible}
-        onCancel={() => setPermissionModalVisible(false)}
-        onOk={() => permissionForm.submit()}
-        width={500}
-      >
-        <Form form={permissionForm} layout="vertical" onFinish={handleSubmitPermission}>
-          <Form.Item
-            name="permissionCode"
-            label="选择权限"
-            rules={[{ required: true, message: '请选择权限' }]}
-          >
-            <Select
-              placeholder="请选择权限"
-              showSearch
-              optionFilterProp="children"
-            >
-              {allPermissions.map((perm) => (
-                <Select.Option key={perm.code} value={perm.code}>
-                  {perm.name} ({perm.code})
-                </Select.Option>
-              ))}
-            </Select>
-          </Form.Item>
-
-          <Form.Item
-            name="effect"
-            label="效果"
-            rules={[{ required: true, message: '请选择效果' }]}
+            }
+            style={{ flex: 1 }}
+            size="small"
           >
-            <Select>
-              <Select.Option value="ALLOW">
-                <Tag color="success">
-                  <SafetyOutlined /> ALLOW - 允许访问
-                </Tag>
-              </Select.Option>
-              <Select.Option value="DENY">
-                <Tag color="error">
-                  <BlockOutlined /> DENY - 拒绝访问（优先级最高）
-                </Tag>
-              </Select.Option>
-            </Select>
-          </Form.Item>
+            {permissionTree.length === 0 ? (
+              <Empty description="该项目暂无权限配置" />
+            ) : (
+              <div className={styles.permissionTree}>
+                {permissionTree.map(menuNode => {
+                  // 计算模块下所有权限码
+                  const allMenuCodes: string[] = [];
+                  menuNode.children?.forEach(page => {
+                    allMenuCodes.push(page.code);
+                    page.children?.forEach(action => {
+                      allMenuCodes.push(action.code);
+                    });
+                  });
+                  const assignedCount = allMenuCodes.filter(c => selectedPermissionCodes.includes(c)).length;
+                  const isAllAssigned = allMenuCodes.length > 0 && assignedCount === allMenuCodes.length;
 
-          <Form.Item 
-            name="projectId" 
-            label="项目ID"
-            extra="留空表示全局生效，填写项目ID表示仅在该项目内生效"
-          >
-            <Input placeholder="项目ID（留空表示全局）" allowClear />
-          </Form.Item>
-        </Form>
-      </Modal>
+                  return (
+                    <div key={menuNode.code} className={styles.moduleSection}>
+                      {/* 模块头部 */}
+                      <div className={styles.moduleHeader}>
+                        <Checkbox
+                          checked={isAllAssigned}
+                          indeterminate={assignedCount > 0 && assignedCount < allMenuCodes.length}
+                          onChange={(e) => handleModuleCheck(menuNode.code, e.target.checked)}
+                        >
+                          <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
+                          <span style={{ fontWeight: 500 }}>{menuNode.title}</span>
+                        </Checkbox>
+                        <Tag color="blue" style={{ marginLeft: 8 }}>
+                          {assignedCount}/{allMenuCodes.length}
+                        </Tag>
+                      </div>
+
+                      {/* 页面和操作 */}
+                      <div className={styles.moduleContent}>
+                        {menuNode.children?.map(pageNode => {
+                          const pageAssigned = selectedPermissionCodes.includes(pageNode.code);
+                          const actionAssignments = (pageNode.children || []).map(action => ({
+                            ...action,
+                            assigned: selectedPermissionCodes.includes(action.code),
+                          }));
+                          const allActionsAssigned = actionAssignments.length > 0 && 
+                            actionAssignments.every(a => a.assigned);
+
+                          return (
+                            <div key={pageNode.code} className={styles.pageSection}>
+                              <Checkbox
+                                checked={pageAssigned && allActionsAssigned}
+                                indeterminate={
+                                  (pageAssigned && !allActionsAssigned) ||
+                                  (!pageAssigned && actionAssignments.some(a => a.assigned))
+                                }
+                                onChange={(e) => {
+                                  // 页面+所有操作一起勾选
+                                  const codes = [pageNode.code, ...actionAssignments.map(a => a.code)];
+                                  if (e.target.checked) {
+                                    setSelectedPermissionCodes(prev => [...new Set([...prev, ...codes])]);
+                                    codes.filter(c => !selectedPermissionCodes.includes(c)).forEach(c => handleGrantPermission(c));
+                                  } else {
+                                    setSelectedPermissionCodes(prev => prev.filter(c => !codes.includes(c)));
+                                    codes.filter(c => selectedPermissionCodes.includes(c)).forEach(c => handleRemovePermission({ permissionCode: c, effect: 'ALLOW' } as UserDirectPermission));
+                                  }
+                                }}
+                              >
+                                <Tag color="cyan">页面</Tag>
+                                {pageNode.title}
+                              </Checkbox>
+
+                              {/* 操作权限 */}
+                              {actionAssignments.length > 0 && (
+                                <div className={styles.actionList}>
+                                  {actionAssignments.map(action => (
+                                    <Checkbox
+                                      key={action.code}
+                                      checked={action.assigned}
+                                      onChange={(e) => handlePermissionCheck(action.code, e.target.checked)}
+                                    >
+                                      <Tag color="orange">操作</Tag>
+                                      {action.title}
+                                    </Checkbox>
+                                  ))}
+                                </div>
+                              )}
+                            </div>
+                          );
+                        })}
+                      </div>
+                    </div>
+                  );
+                })}
+              </div>
+            )}
+          </Card>
+        </div>
+      )}
     </Card>
   );
 };
diff --git a/permission-web-frontend/src/services/api.ts b/permission-web-frontend/src/services/api.ts
index 05c27a7..be1e53c 100644
--- a/permission-web-frontend/src/services/api.ts
+++ b/permission-web-frontend/src/services/api.ts
@@ -40,7 +40,7 @@ export const getCurrentUser = (): Promise<ApiResponse<UserInfo>> => {
 
 // ==================== 权限点管理 ====================
 
-export const listPermissions = (params?: PageRequest & { permissionName?: string }): Promise<ApiResponse<PageResponse<Permission>>> => {
+export const listPermissions = (params?: PageRequest & { permissionName?: string; projectId?: string }): Promise<ApiResponse<PageResponse<Permission>>> => {
   return get<PageResponse<Permission>>(`${API_PREFIX}/permissions`, { params });
 };
 
@@ -60,8 +60,9 @@ export const deletePermission = (id: number): Promise<ApiResponse<void>> => {
   return post<void>(`${API_PREFIX}/permissions/${id}/delete`);
 };
 
-export const listAllPermissions = (): Promise<ApiResponse<Permission[]>> => {
-  return get<Permission[]>(`${API_PREFIX}/permissions/all`);
+export const listAllPermissions = (projectId?: string): Promise<ApiResponse<Permission[]>> => {
+  const params = projectId ? { projectId } : undefined;
+  return get<Permission[]>(`${API_PREFIX}/permissions/all`, { params });
 };
 
 // ==================== 角色管理 ====================
diff --git a/permission-web-frontend/src/types/index.ts b/permission-web-frontend/src/types/index.ts
index 7c102d3..fdc1824 100644
--- a/permission-web-frontend/src/types/index.ts
+++ b/permission-web-frontend/src/types/index.ts
@@ -52,6 +52,7 @@ export interface Permission {
   code: string;
   name: string;
   systemCode: string;
+  projectId?: string;
   type: string;
   parentCode?: string;
   sortOrder?: number;
@@ -68,6 +69,7 @@ export interface PermissionRequest {
   code: string;
   name: string;
   systemCode: string;
+  projectId?: string;
   type: string;
   parentCode?: string;
   sortOrder?: number;
@@ -83,6 +85,7 @@ export interface Role {
   name: string;
   roleScope?: string;
   roleDomain?: string;
+  projectId?: string;
   status: string;
   description?: string;
   permissionCodes?: string[];
@@ -98,6 +101,7 @@ export interface RoleRequest {
   name: string;
   roleScope?: string;
   roleDomain?: string;
+  projectId?: string;
   description?: string;
 }
 
@@ -183,11 +187,20 @@ export interface Project {
   code: string;
   name: string;
   description?: string;
+  systems?: SystemModule[];
   status: string;
   gmtCreate?: string;
   gmtModified?: string;
 }
 
+/**
+ * 系统模块
+ */
+export interface SystemModule {
+  code: string;
+  name: string;
+}
+
 /**
  * 项目创建/更新请求
  */
@@ -195,5 +208,6 @@ export interface ProjectRequest {
   code?: string;
   name?: string;
   description?: string;
+  systems?: SystemModule[];
   status?: string;
 }
```
