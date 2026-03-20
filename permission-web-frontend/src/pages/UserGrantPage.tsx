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
  Alert,
} from 'antd';
import { 
  SafetyOutlined, 
  UserOutlined,
  ReloadOutlined,
  FolderOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import {
  getUserAuthDetailByLoginAccount,
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
  UserAuthDetail,
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

type AnyRec = Record<string, unknown>;

/** 网关/旧接口可能返回 snake_case，前端统一成 camelCase */
function normalizeRoleFromApi(raw: Role & AnyRec): Role {
  return {
    ...raw,
    roleScope: (raw.roleScope ?? raw.role_scope) as string | undefined,
    roleDomain: (raw.roleDomain ?? raw.role_domain) as string | undefined,
    projectId: (raw.projectId ?? raw.project_id) as string | undefined,
  };
}

function normalizeUserRoleFromApi(raw: UserRole & AnyRec): UserRole {
  const rid = raw.roleId ?? raw.role_id;
  return {
    roleId: typeof rid === 'number' ? rid : Number(rid),
    roleCode: String(raw.roleCode ?? raw.role_code ?? ''),
    roleName: String(raw.roleName ?? raw.role_name ?? ''),
    roleScope: (raw.roleScope ?? raw.role_scope) as string | undefined,
    projectId: (raw.projectId ?? raw.project_id) as string | undefined,
  };
}

function normalizeDirectPermFromApi(raw: UserDirectPermission & AnyRec): UserDirectPermission {
  const eff = String(raw.effect ?? '').toUpperCase();
  return {
    permissionCode: String(raw.permissionCode ?? raw.permission_code ?? ''),
    permissionName: (raw.permissionName ?? raw.permission_name) as string | undefined,
    effect: eff === 'DENY' ? 'DENY' : 'ALLOW',
    projectId: (raw.projectId ?? raw.project_id) as string | undefined,
  };
}

const UserGrantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loginAccount, setLoginAccount] = useState(
    () => searchParams.get('loginAccount') || searchParams.get('userId') || ''
  );
  /** 查询成功后由接口返回的业务 userId，用于分配角色/权限 */
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [resolvedDisplayName, setResolvedDisplayName] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => searchParams.get('projectId') || '');
  
  // 项目和角色数据
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectRoles, setProjectRoles] = useState<Role[]>([]);
  const [projectPermissions, setProjectPermissions] = useState<Permission[]>([]);
  
  // 用户当前授权数据
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [, setDirectPermissions] = useState<UserDirectPermission[]>([]);
  /** 后端返回：当前用户所有启用角色下的权限点并集（与左侧角色关联） */
  const [userRolePermissionCodes, setUserRolePermissionCodes] = useState<string[]>([]);
  
  // 已选中的角色和权限
  const [, setSelectedRoleIds] = useState<number[]>([]);
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<string[]>([]);

  // 加载项目列表（接口仅返回启用项目；若 URL 里带了已停用项目编码则清空）
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await listAllProjects();
        const list = (res.data || []).filter((p) => !p.status || p.status === 'ENABLED');
        setProjects(list);
        setSelectedProjectId((prev) => {
          if (prev && !list.some((p) => p.code === prev)) {
            message.warning('原选项目已停用或不存在，请重新选择');
            return '';
          }
          return prev;
        });
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
          listAllRoles(selectedProjectId),
          listAllPermissions(selectedProjectId),
        ]);
        // 角色列表由后端 /roles/all?projectId= 按项目过滤（避免 OR project_id IS NULL 把权限中心角色带进 UC）
        const allRoles = (rolesRes.data || []).map((r) => normalizeRoleFromApi(r as Role & AnyRec));
        setProjectRoles(allRoles);
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

  /** 角色带来的权限点中，属于当前项目权限树内的编码（用于右侧勾选展示） */
  const roleCodesInCurrentProject = useMemo(() => {
    const inProj = new Set(projectPermissions.map((p) => p.code));
    return new Set((userRolePermissionCodes || []).filter((c) => inProj.has(c)));
  }, [projectPermissions, userRolePermissionCodes]);

  const hasEffectivePerm = (code: string) =>
    selectedPermissionCodes.includes(code) || roleCodesInCurrentProject.has(code);

  const isOnlyFromRole = (code: string) =>
    roleCodesInCurrentProject.has(code) && !selectedPermissionCodes.includes(code);

  /** 将接口详情写入状态；勾选同步仅认「当前项目 + ALLOW」的直接授权 */
  const mergeAuthDetailIntoState = (
    data: UserAuthDetail,
    projectIdForPerms: string | null,
    syncRoleCheckmarks: boolean
  ) => {
    const roles = (data.roles || []).map((r) => normalizeUserRoleFromApi(r as UserRole & AnyRec));
    const perms = (data.directPermissions || []).map((p) =>
      normalizeDirectPermFromApi(p as UserDirectPermission & AnyRec)
    );
    const rawDetail = data as UserAuthDetail & AnyRec;
    const rpc = rawDetail.rolePermissionCodes ?? rawDetail.role_permission_codes;
    setUserRolePermissionCodes(Array.isArray(rpc) ? rpc.map((c) => String(c)) : []);
    setResolvedUserId(data.userId);
    setResolvedDisplayName(data.displayName || '');
    setUserRoles(roles);
    setDirectPermissions(perms);
    if (projectIdForPerms) {
      const pNorm = projectIdForPerms.trim();
      setSelectedPermissionCodes(
        perms
          .filter((p) => p.effect === 'ALLOW' && (p.projectId ?? '').trim() === pNorm)
          .map((p) => p.permissionCode)
      );
      if (syncRoleCheckmarks) {
        setSelectedRoleIds(
          projectRoles
            .filter((r) =>
              roles.some(
                (ur) => ur.roleCode === r.code && (!ur.projectId || ur.projectId === projectIdForPerms)
              )
            )
            .map((r) => r.id)
        );
      }
    }
  };

  const silentReloadAuthDetail = async (account: string, projectId: string) => {
    const res = await getUserAuthDetailByLoginAccount(account);
    if (res.data) {
      mergeAuthDetailIntoState(res.data, projectId, false);
    }
  };

  // 查询用户授权详情（按登录账号）
  const handleSearch = async () => {
    const acc = loginAccount.trim();
    if (!acc) {
      message.warning('请输入登录账号');
      return;
    }

    const nextParams: Record<string, string> = { loginAccount: acc };
    if (selectedProjectId) nextParams.projectId = selectedProjectId;
    setSearchParams(nextParams);

    setLoading(true);
    try {
      const res = await getUserAuthDetailByLoginAccount(acc);
      if (!res.data) {
        message.error('用户授权数据为空');
        return;
      }
      mergeAuthDetailIntoState(res.data, selectedProjectId || null, true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '查询失败');
      setResolvedUserId(null);
      setResolvedDisplayName('');
      setUserRoles([]);
      setDirectPermissions([]);
      setUserRolePermissionCodes([]);
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
    if (!initialLoadDone && loginAccount.trim() && selectedProjectId && projectRoles.length > 0) {
      setInitialLoadDone(true);
      const autoSearch = async () => {
        setLoading(true);
        try {
          const res = await getUserAuthDetailByLoginAccount(loginAccount.trim());
          mergeAuthDetailIntoState(res.data, selectedProjectId, true);
        } catch (error) {
          console.error('自动查询失败:', error);
        } finally {
          setLoading(false);
        }
      };
      autoSearch();
    }
  }, [initialLoadDone, loginAccount, selectedProjectId, projectRoles.length]);

  // 分配角色：全局角色（GLOBAL）不能带 projectId；仅项目范围角色（PROJECT）使用当前所选项目
  const handleAssignRole = async (role: Role) => {
    if (!resolvedUserId) return;
    const nr = normalizeRoleFromApi(role as Role & AnyRec);
    const isProjectScoped = nr.roleScope === 'PROJECT';
    if (isProjectScoped && !selectedProjectId) {
      message.warning('请先选择项目再分配该项目角色');
      return;
    }
    try {
      await assignUserRole({
        userId: resolvedUserId,
        roleId: nr.id,
        projectId: isProjectScoped ? selectedProjectId : undefined,
      });
      message.success('角色分配成功');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '分配失败');
    }
  };

  // 移除角色
  const handleRemoveRole = async (record: UserRole) => {
    if (!resolvedUserId) return;
    try {
      await revokeUserRole({
        userId: resolvedUserId,
        roleId: record.roleId,
        projectId: record.projectId || undefined,
      });
      message.success('角色已移除');
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '移除失败');
    }
  };

  // 模块勾选变化（整模块授权/取消）
  const handleModuleCheck = (menuCode: string, checked: boolean) => {
    const menuNode = permissionTree.find((n) => n.code === menuCode);
    if (!menuNode || !resolvedUserId || !selectedProjectId) return;
    const acc = loginAccount.trim();
    if (!acc) return;

    const allCodes: string[] = [];
    menuNode.children?.forEach((page) => {
      allCodes.push(page.code);
      page.children?.forEach((action) => {
        allCodes.push(action.code);
      });
    });

    void (async () => {
      try {
        if (checked) {
          for (const code of allCodes) {
            await grantUserPermission({
              userId: resolvedUserId,
              permissionCode: code,
              effect: 'ALLOW',
              projectId: selectedProjectId,
            });
          }
          message.success('权限授予成功');
        } else {
          for (const code of allCodes) {
            await revokeUserPermission({
              userId: resolvedUserId,
              permissionCode: code,
              effect: 'ALLOW',
              projectId: selectedProjectId,
            });
          }
          setSelectedPermissionCodes((prev) => prev.filter((c) => !allCodes.includes(c)));
          message.success('权限已移除');
        }
        await silentReloadAuthDetail(acc, selectedProjectId);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败');
      }
    })();
  };

  // 单个权限勾选
  const handlePermissionCheck = (permissionCode: string, checked: boolean) => {
    if (!resolvedUserId || !selectedProjectId) return;
    const acc = loginAccount.trim();
    if (!acc) return;
    void (async () => {
      try {
        if (checked) {
          await grantUserPermission({
            userId: resolvedUserId,
            permissionCode,
            effect: 'ALLOW',
            projectId: selectedProjectId,
          });
          message.success('权限授予成功');
        } else {
          await revokeUserPermission({
            userId: resolvedUserId,
            permissionCode,
            effect: 'ALLOW',
            projectId: selectedProjectId,
          });
          setSelectedPermissionCodes((prev) => prev.filter((c) => c !== permissionCode));
          message.success('权限已移除');
        }
        await silentReloadAuthDetail(acc, selectedProjectId);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败');
      }
    })();
  };

  /** 页面节点 + 其下所有操作，一并授权/撤销 */
  const handlePageTreeCheck = (
    pageNode: PermissionTreeNode,
    actionCodes: string[],
    checked: boolean
  ) => {
    if (!resolvedUserId || !selectedProjectId) return;
    const acc = loginAccount.trim();
    if (!acc) return;
    const codes = [pageNode.code, ...actionCodes];
    void (async () => {
      try {
        if (checked) {
          for (const code of codes) {
            await grantUserPermission({
              userId: resolvedUserId,
              permissionCode: code,
              effect: 'ALLOW',
              projectId: selectedProjectId,
            });
          }
          message.success('权限授予成功');
        } else {
          for (const code of codes) {
            await revokeUserPermission({
              userId: resolvedUserId,
              permissionCode: code,
              effect: 'ALLOW',
              projectId: selectedProjectId,
            });
          }
          setSelectedPermissionCodes((prev) => prev.filter((c) => !codes.includes(c)));
          message.success('权限已移除');
        }
        await silentReloadAuthDetail(acc, selectedProjectId);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '操作失败');
      }
    })();
  };

  return (
    <Card className={styles.pageCard}>
      {/* 搜索区域 */}
      <div className={styles.searchArea}>
        <Space size="middle">
          <Input
            placeholder="输入登录账号"
            value={loginAccount}
            onChange={(e) => setLoginAccount(e.target.value)}
            prefix={<UserOutlined />}
            style={{ width: 220 }}
            allowClear
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
            {projects.map((p) => (
              <Select.Option key={p.code} value={p.code}>
                {p.name}
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
      {resolvedUserId && (
        <div className={styles.userInfo}>
          <Tag color="blue" icon={<UserOutlined />}>
            登录账号：{loginAccount.trim()}
          </Tag>
          {resolvedDisplayName ? (
            <Tag color="cyan">显示名：{resolvedDisplayName}</Tag>
          ) : null}
          <Tag color="purple">业务用户ID：{resolvedUserId}</Tag>
          {selectedProjectId && (
            <Tag color="orange">
              项目：{projects.find((p) => p.code === selectedProjectId)?.name || selectedProjectId}
            </Tag>
          )}
        </div>
      )}

      <Divider />

      {/* 未选择项目时提示 */}
      {!selectedProjectId ? (
        <Empty description="请先选择项目" style={{ margin: '60px 0' }} />
      ) : !resolvedUserId ? (
        <Empty description="请输入登录账号并查询" style={{ margin: '60px 0' }} />
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
            {/* 仅「项目范围」且 * _ADMIN 的才是项目管理员；全局 *管理员 不在此组 */}
            {projectRoles
              .filter(
                (r) =>
                  r.roleScope === 'PROJECT' &&
                  r.code.endsWith('_ADMIN') &&
                  r.code !== 'SUPER_ADMIN'
              )
              .map((role) => {
              const isAssigned = currentProjectUserRoles.some((ur) => ur.roleCode === role.code);
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
                      <Tag color="gold" icon={<CrownOutlined />}>
                        项目管理员
                      </Tag>
                      <div style={{ fontWeight: 500, marginTop: 4 }}>{role.name}</div>
                    </div>
                    {isAssigned ? (
                      <Popconfirm
                        title="确定要移除该角色吗？"
                        onConfirm={() =>
                          handleRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!)
                        }
                      >
                        <Button size="small" danger>
                          移除
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button type="primary" size="small" onClick={() => handleAssignRole(role)}>
                        分配
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {projectRoles.filter((r) => r.roleScope === 'PROJECT' && !r.code.endsWith('_ADMIN')).length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ color: '#666', marginBottom: 8 }}>本项目其他角色</div>
              </>
            )}
            {projectRoles
              .filter((r) => r.roleScope === 'PROJECT' && !r.code.endsWith('_ADMIN'))
              .map((role) => {
                const isAssigned = currentProjectUserRoles.some((ur) => ur.roleCode === role.code);
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
                        onConfirm={() =>
                          handleRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!)
                        }
                      >
                        <Button type="link" size="small" danger>
                          移除
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Button type="link" size="small" onClick={() => handleAssignRole(role)}>
                        分配
                      </Button>
                    )}
                  </div>
                );
              })}

            {projectRoles.filter((r) => r.roleScope === 'GLOBAL').length > 0 && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ color: '#666', marginBottom: 8 }}>
                  全局角色（仅系统管理员）。接口分配时请省略 <code>projectId</code>，例如{' '}
                  <code>{`{ "userId":"...", "roleId":1 }`}</code>（具体 roleId 以角色列表为准）
                </div>
              </>
            )}
            {projectRoles.filter((r) => r.roleScope === 'GLOBAL').map((role) => {
              const isAssigned = currentProjectUserRoles.some((ur) => ur.roleCode === role.code);
              return (
                <div
                  key={role.id}
                  style={{
                    padding: '8px 12px',
                    marginBottom: 4,
                    borderRadius: 4,
                    background: isAssigned ? '#e6f7ff' : '#fafafa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{role.name}</span>
                  {isAssigned ? (
                    <Popconfirm
                      title="确定要移除该角色吗？"
                      onConfirm={() =>
                        handleRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!)
                      }
                    >
                      <Button type="link" size="small" danger>
                        移除
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Button type="link" size="small" onClick={() => handleAssignRole(role)}>
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
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="勾选状态 = 左侧角色带来的权限 ∪ 右侧直接授权（去重展示）。仅来自角色的项不可在此取消，请调整左侧角色。"
            />
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
                  const assignedCount = allMenuCodes.filter((c) => hasEffectivePerm(c)).length;
                  const isAllAssigned = allMenuCodes.length > 0 && assignedCount === allMenuCodes.length;
                  const moduleOnlyFromRole =
                    allMenuCodes.length > 0 && allMenuCodes.every((c) => isOnlyFromRole(c));

                  return (
                    <div key={menuNode.code} className={styles.moduleSection}>
                      {/* 模块头部 */}
                      <div className={styles.moduleHeader}>
                        <Checkbox
                          checked={isAllAssigned}
                          indeterminate={assignedCount > 0 && assignedCount < allMenuCodes.length}
                          disabled={moduleOnlyFromRole}
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
                          const pageAssigned = hasEffectivePerm(pageNode.code);
                          const actionAssignments = (pageNode.children || []).map(action => ({
                            ...action,
                            assigned: hasEffectivePerm(action.code),
                          }));
                          const allActionsAssigned = actionAssignments.length > 0 && 
                            actionAssignments.every(a => a.assigned);
                          const pageScopeCodes = [
                            pageNode.code,
                            ...actionAssignments.map((a) => a.code),
                          ];
                          const pageOnlyFromRole =
                            pageScopeCodes.length > 0 &&
                            pageScopeCodes.every((c) => isOnlyFromRole(c));

                          return (
                            <div key={pageNode.code} className={styles.pageSection}>
                              <Checkbox
                                checked={pageAssigned && allActionsAssigned}
                                indeterminate={
                                  (pageAssigned && !allActionsAssigned) ||
                                  (!pageAssigned && actionAssignments.some(a => a.assigned))
                                }
                                disabled={pageOnlyFromRole}
                                onChange={(e) =>
                                  handlePageTreeCheck(
                                    pageNode,
                                    actionAssignments.map((a) => a.code),
                                    e.target.checked
                                  )
                                }
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
                                      disabled={isOnlyFromRole(action.code)}
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
