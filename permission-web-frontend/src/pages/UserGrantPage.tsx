import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Space,
  Input,
  message,
  Popconfirm,
  Tag,
  Card,
  Select,
  Divider,
  Checkbox,
  Empty,
} from 'antd';
import { 
  SafetyOutlined, 
  UserOutlined,
  ReloadOutlined,
  FolderOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import {
  getUserAuthDetail,
  assignUserRole,
  revokeUserRole,
  grantUserPermission,
  revokeUserPermission,
  listAllRoles,
  listAllPermissions,
  listAllProjects,
} from '@/services/api';
import type { 
  UserRole, 
  UserDirectPermission, 
  Role, 
  Permission,
  Project,
} from '@/types';
import styles from './UserGrantPage.module.css';

// 权限树节点
interface PermissionTreeNode {
  key: string;
  title: string;
  code: string;
  type: string;
  children?: PermissionTreeNode[];
  permissionId?: number;
}

const UserGrantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(() => searchParams.get('userId') || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => searchParams.get('projectId') || '');
  
  // 项目和角色数据
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectRoles, setProjectRoles] = useState<Role[]>([]);
  const [projectPermissions, setProjectPermissions] = useState<Permission[]>([]);
  
  // 用户当前授权数据
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [, setDirectPermissions] = useState<UserDirectPermission[]>([]);
  
  // 已选中的角色和权限
  const [, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);

  // 加载项目列表
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await listAllProjects();
        setProjects(res.data || []);
      } catch {
        message.error('加载项目列表失败');
      }
    };
    loadProjects();
  }, []);

  // 当选择项目时，加载该项目的角色和权限
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectRoles([]);
      setProjectPermissions([]);
      return;
    }

    const loadProjectData = async () => {
      try {
        const [rolesRes, permsRes] = await Promise.all([
          listAllRoles(),
          listAllPermissions(selectedProjectId),
        ]);
        // 过滤出该项目的角色（或全局角色）
        const allRoles = rolesRes.data || [];
        setProjectRoles(allRoles.filter(r => !r.projectId || r.projectId === selectedProjectId));
        setProjectPermissions(permsRes.data || []);
      } catch {
        message.error('加载项目数据失败');
      }
    };
    loadProjectData();
  }, [selectedProjectId]);

  // 构建权限树
  const permissionTree = useMemo(() => {
    if (!projectPermissions.length) return [];

    // 构建 MENU -> PAGE -> ACTION 三层树
    const menuMap = new Map<string, PermissionTreeNode>();
    const pageMap = new Map<string, PermissionTreeNode>();
    const actionMap = new Map<string, PermissionTreeNode>();

    // 先分类
    projectPermissions.forEach(perm => {
      const node: PermissionTreeNode = {
        key: perm.code,
        title: perm.name,
        code: perm.code,
        type: perm.type,
        permissionId: perm.id,
      };

      if (perm.type === 'MENU') {
        menuMap.set(perm.code, { ...node, children: [] });
      } else if (perm.type === 'PAGE') {
        pageMap.set(perm.code, { ...node, children: [] });
      } else if (perm.type === 'ACTION') {
        actionMap.set(perm.code, node);
      }
    });

    // ACTION 归属到 PAGE
    projectPermissions.filter(p => p.type === 'ACTION').forEach(perm => {
      const actionNode = actionMap.get(perm.code);
      const pageNode = pageMap.get(perm.parentCode || '');
      if (actionNode && pageNode && pageNode.children) {
        pageNode.children.push(actionNode);
      }
    });

    // PAGE 归属到 MENU
    projectPermissions.filter(p => p.type === 'PAGE').forEach(perm => {
      const pageNode = pageMap.get(perm.code);
      const menuNode = menuMap.get(perm.parentCode || '');
      if (pageNode && menuNode && menuNode.children) {
        menuNode.children.push(pageNode);
      }
    });

    return Array.from(menuMap.values());
  }, [projectPermissions]);

  // 查询用户授权详情
  const handleSearch = async () => {
    if (!userId) {
      message.warning('请输入用户ID');
      return;
    }

    // 更新 URL 参数
    setSearchParams({ userId, projectId: selectedProjectId });

    setLoading(true);
    try {
      // 更新 URL 参数
      setSearchParams({ userId, projectId: selectedProjectId });

      const res = await getUserAuthDetail(userId);
      const roles = res.data.roles || [];
      const perms = res.data.directPermissions || [];
      console.log('[DEBUG] handleSearch - roles:', roles);
      console.log('[DEBUG] handleSearch - perms:', perms);
      
      setUserRoles(roles);
      setDirectPermissions(perms);
      
      // 同步勾选状态
      if (selectedProjectId) {
        const projectRoleIds = projectRoles
          .filter(r => roles.some(ur => ur.roleCode === r.code && (!ur.projectId || ur.projectId === selectedProjectId)))
          .map(r => r.id);
        setSelectedRoleIds(projectRoleIds);

        const projectPermCodes = perms
          .filter(p => p.projectId === selectedProjectId || !p.projectId)
          .map(p => p.permissionCode);
        setSelectedPermissionCodes(projectPermCodes);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '查询失败');
      setUserRoles([]);
      setDirectPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // 当项目切换时，计算当前项目的用户权限数据
  const currentProjectUserRoles = useMemo(() => {
    if (!selectedProjectId) return [];
    return userRoles.filter(r => !r.projectId || r.projectId === selectedProjectId);
  }, [userRoles, selectedProjectId]);

  // 从 URL 参数恢复时自动查询（放在 handleSearch 定义之后）
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  useEffect(() => {
    if (!initialLoadDone && userId && selectedProjectId && projectRoles.length > 0) {
      setInitialLoadDone(true);
      // 自动触发查询（复用 handleSearch 的逻辑）
      const autoSearch = async () => {
        setLoading(true);
        try {
          const res = await getUserAuthDetail(userId);
          const roles = res.data.roles || [];
          const perms = res.data.directPermissions || [];
          setUserRoles(roles);
          setDirectPermissions(perms);
          
          const projectPermCodes = perms
            .filter(p => p.projectId === selectedProjectId || !p.projectId)
            .map(p => p.permissionCode);
          setSelectedPermissionCodes(projectPermCodes);
        } catch (error) {
          console.error('自动查询失败:', error);
        } finally {
          setLoading(false);
        }
      };
      autoSearch();
    }
  }, [initialLoadDone, userId, selectedProjectId, projectRoles.length]);

  // 分配角色
  const handleAssignRole = async (roleId: number) => {
    if (!userId) return;
    try {
      await assignUserRole({
        userId,
        roleId,
        projectId: selectedProjectId,
      });
      message.success('角色分配成功');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '分配失败');
    }
  };

  // 移除角色
  const handleRemoveRole = async (record: UserRole) => {
    try {
      await revokeUserRole({
        userId,
        roleId: record.roleId,
        projectId: record.projectId || undefined,
      });
      message.success('角色已移除');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '移除失败');
    }
  };

  // 授予权限
  const handleGrantPermission = async (permissionCode: string, effect: 'ALLOW' | 'DENY' = 'ALLOW') => {
    if (!userId) return;
    try {
      await grantUserPermission({
        userId,
        permissionCode,
        effect,
        projectId: selectedProjectId,
      });
      message.success('权限授予成功');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '授权失败');
    }
  };

  // 移除权限
  const handleRemovePermission = async (record: UserDirectPermission) => {
    try {
      await revokeUserPermission({
        userId,
        permissionCode: record.permissionCode,
        effect: record.effect,
        projectId: record.projectId || undefined,
      });
      message.success('权限已移除');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '移除失败');
    }
  };

  // 模块勾选变化（整模块授权/取消）
  const handleModuleCheck = (menuCode: string, checked: boolean) => {
    // 找到该模块下所有权限
    const menuNode = permissionTree.find(n => n.code === menuCode);
    if (!menuNode) return;

    const allCodes: string[] = [];
    menuNode.children?.forEach(page => {
      allCodes.push(page.code);
      page.children?.forEach(action => {
        allCodes.push(action.code);
      });
    });

    if (checked) {
      // 批量授权
      setSelectedPermissionCodes(prev => [...new Set([...prev, ...allCodes])]);
      allCodes.forEach(code => {
        if (!selectedPermissionCodes.includes(code)) {
          handleGrantPermission(code);
        }
      });
    } else {
      // 批量取消
      setSelectedPermissionCodes(prev => prev.filter(c => !allCodes.includes(c)));
      allCodes.forEach(code => {
        if (selectedPermissionCodes.includes(code)) {
          handleRemovePermission({ permissionCode: code, effect: 'ALLOW' } as UserDirectPermission);
        }
      });
    }
  };

  // 单个权限勾选
  const handlePermissionCheck = (permissionCode: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissionCodes(prev => [...prev, permissionCode]);
      handleGrantPermission(permissionCode);
    } else {
      setSelectedPermissionCodes(prev => prev.filter(c => c !== permissionCode));
      handleRemovePermission({ permissionCode, effect: 'ALLOW' } as UserDirectPermission);
    }
  };

  return (
    <Card className={styles.pageCard}>
      {/* 搜索区域 */}
      <div className={styles.searchArea}>
        <Space size="middle">
          <Input
            placeholder="输入用户ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            prefix={<UserOutlined />}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择项目"
            value={selectedProjectId || undefined}
            onChange={(value) => {
              setSelectedProjectId(value);
              setSelectedRoleIds([]);
              setSelectedPermissionCodes([]);
            }}
            style={{ width: 200 }}
            allowClear
          >
            {projects.map(p => (
              <Select.Option key={p.code} value={p.code}>
                {p.name} ({p.code})
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch} loading={loading}>
            查询
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 用户信息展示 */}
      {userId && (
        <div className={styles.userInfo}>
          <Tag color="blue" icon={<UserOutlined />}>
            用户：{userId}
          </Tag>
          {selectedProjectId && (
            <Tag color="orange">
              项目：{projects.find(p => p.code === selectedProjectId)?.name || selectedProjectId}
            </Tag>
          )}
        </div>
      )}

      <Divider />

      {/* 未选择项目时提示 */}
      {!selectedProjectId ? (
        <Empty description="请先选择项目" style={{ margin: '60px 0' }} />
      ) : !userId ? (
        <Empty description="请输入用户ID并查询" style={{ margin: '60px 0' }} />
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          {/* 左侧：角色分配 */}
          <Card 
            title={
              <span>
                <CrownOutlined style={{ marginRight: 8, color: '#faad14' }} />
                角色分配
              </span>
            }
            style={{ width: 300, flexShrink: 0 }}
            size="small"
          >
            {/* 项目管理员角色 - 置顶 */}
            {projectRoles.filter(r => r.code.endsWith('_ADMIN')).map(role => {
              const isAssigned = currentProjectUserRoles.some(ur => ur.roleCode === role.code);
              return (
                <div 
                  key={role.id} 
                  style={{ 
                    padding: '12px', 
                    marginBottom: 8,
                    borderRadius: 8,
                    border: '1px solid #faad14',
                    background: isAssigned ? '#fffbe6' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color="gold" icon={<CrownOutlined />}>项目管理员</Tag>
                      <div style={{ fontWeight: 500, marginTop: 4 }}>{role.name}</div>
                    </div>
                    {isAssigned ? (
                      <Popconfirm
                        title="确定要移除该角色吗？"
                        onConfirm={() => handleRemoveRole(currentProjectUserRoles.find(ur => ur.roleCode === role.code)!)}
                      >
                        <Button size="small" danger>移除</Button>
                      </Popconfirm>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => handleAssignRole(role.id)}
                      >
                        分配
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 其他角色 */}
            {projectRoles.filter(r => !r.code.endsWith('_ADMIN')).length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ color: '#666', marginBottom: 8 }}>其他角色</div>
              </>
            )}
            {projectRoles.filter(r => !r.code.endsWith('_ADMIN')).map(role => {
              const isAssigned = currentProjectUserRoles.some(ur => ur.roleCode === role.code);
              return (
                <div 
                  key={role.id} 
                  style={{ 
                    padding: '8px 12px',
                    marginBottom: 4,
                    borderRadius: 4,
                    background: isAssigned ? '#f6ffed' : '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{role.name}</span>
                  {isAssigned ? (
                    <Popconfirm
                      title="确定要移除该角色吗？"
                      onConfirm={() => handleRemoveRole(currentProjectUserRoles.find(ur => ur.roleCode === role.code)!)}
                    >
                      <Button type="link" size="small" danger>移除</Button>
                    </Popconfirm>
                  ) : (
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleAssignRole(role.id)}
                    >
                      分配
                    </Button>
                  )}
                </div>
              );
            })}
          </Card>

          {/* 右侧：权限授权 */}
          <Card 
            title={
              <span>
                <SafetyOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                权限授权
              </span>
            }
            style={{ flex: 1 }}
            size="small"
          >
            {permissionTree.length === 0 ? (
              <Empty description="该项目暂无权限配置" />
            ) : (
              <div className={styles.permissionTree}>
                {permissionTree.map(menuNode => {
                  // 计算模块下所有权限码
                  const allMenuCodes: string[] = [];
                  menuNode.children?.forEach(page => {
                    allMenuCodes.push(page.code);
                    page.children?.forEach(action => {
                      allMenuCodes.push(action.code);
                    });
                  });
                  const assignedCount = allMenuCodes.filter(c => selectedPermissionCodes.includes(c)).length;
                  const isAllAssigned = allMenuCodes.length > 0 && assignedCount === allMenuCodes.length;

                  return (
                    <div key={menuNode.code} className={styles.moduleSection}>
                      {/* 模块头部 */}
                      <div className={styles.moduleHeader}>
                        <Checkbox
                          checked={isAllAssigned}
                          indeterminate={assignedCount > 0 && assignedCount < allMenuCodes.length}
                          onChange={(e) => handleModuleCheck(menuNode.code, e.target.checked)}
                        >
                          <FolderOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                          <span style={{ fontWeight: 500 }}>{menuNode.title}</span>
                        </Checkbox>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {assignedCount}/{allMenuCodes.length}
                        </Tag>
                      </div>

                      {/* 页面和操作 */}
                      <div className={styles.moduleContent}>
                        {menuNode.children?.map(pageNode => {
                          const pageAssigned = selectedPermissionCodes.includes(pageNode.code);
                          const actionAssignments = (pageNode.children || []).map(action => ({
                            ...action,
                            assigned: selectedPermissionCodes.includes(action.code),
                          }));
                          const allActionsAssigned = actionAssignments.length > 0 && 
                            actionAssignments.every(a => a.assigned);

                          return (
                            <div key={pageNode.code} className={styles.pageSection}>
                              <Checkbox
                                checked={pageAssigned && allActionsAssigned}
                                indeterminate={
                                  (pageAssigned && !allActionsAssigned) ||
                                  (!pageAssigned && actionAssignments.some(a => a.assigned))
                                }
                                onChange={(e) => {
                                  // 页面+所有操作一起勾选
                                  const codes = [pageNode.code, ...actionAssignments.map(a => a.code)];
                                  if (e.target.checked) {
                                    setSelectedPermissionCodes(prev => [...new Set([...prev, ...codes])]);
                                    codes.filter(c => !selectedPermissionCodes.includes(c)).forEach(c => handleGrantPermission(c));
                                  } else {
                                    setSelectedPermissionCodes(prev => prev.filter(c => !codes.includes(c)));
                                    codes.filter(c => selectedPermissionCodes.includes(c)).forEach(c => handleRemovePermission({ permissionCode: c, effect: 'ALLOW' } as UserDirectPermission));
                                  }
                                }}
                              >
                                <Tag color="cyan">页面</Tag>
                                {pageNode.title}
                              </Checkbox>

                              {/* 操作权限 */}
                              {actionAssignments.length > 0 && (
                                <div className={styles.actionList}>
                                  {actionAssignments.map(action => (
                                    <Checkbox
                                      key={action.code}
                                      checked={action.assigned}
                                      onChange={(e) => handlePermissionCheck(action.code, e.target.checked)}
                                    >
                                      <Tag color="orange">操作</Tag>
                                      {action.title}
                                    </Checkbox>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </Card>
  );
};

export default UserGrantPage;
