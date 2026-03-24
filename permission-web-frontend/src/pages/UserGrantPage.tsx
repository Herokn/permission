import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Space,
  Input,
  message,
  Modal,
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
  CrownOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  getUserAuthDetailByLoginAccount,
  assignUserRole,
  revokeUserRole,
  listAllRoles,
  listAllPermissions,
  listAllProjects,
  getRole,
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
    permissionCodes: (raw.permissionCodes ?? raw.permission_codes) as string[] | undefined,
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
  
  // 所有权限（不限项目，用于角色预览）
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  
  // 已选中的角色和权限
  const [, setSelectedRoleIds] = useState<number[]>([]);
  
  // 预览选中的角色（用于查看角色权限，只读模式）
  const [previewRole, setPreviewRole] = useState<Role | null>(null);

  // 加载所有权限（用于角色预览）
  useEffect(() => {
    const loadAllPerms = async () => {
      try {
        const res = await listAllPermissions();
        setAllPermissions(res.data || []);
      } catch {
        // ignore
      }
    };
    loadAllPerms();
  }, []);

  // 处理角色预览（点击角色时调用详情接口获取权限码）
  const handlePreviewRole = async (role: Role | null) => {
    if (role === null) {
      setPreviewRole(null);
      return;
    }
    if (previewRole?.id === role.id) {
      setPreviewRole(null);
      return;
    }
    try {
      const res = await getRole(role.id);
      const normalized = normalizeRoleFromApi(res.data as Role & AnyRec);
      setPreviewRole(normalized);
    } catch (error) {
      message.error('获取角色权限失败');
      setPreviewRole(role);
    }
  };

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

  /** 是否处于角色预览模式 */
  const isPreviewMode = previewRole !== null;

  /** 预览角色的权限码列表（不过滤，直接使用角色的所有权限码） */
  const previewRolePermissionCodes = useMemo(() => {
    if (!previewRole || !previewRole.permissionCodes) return [];
    return previewRole.permissionCodes;
  }, [previewRole]);

  // 构建权限树（预览模式用所有权限且只显示USER_CENTER相关，否则用当前项目权限）
  const permissionTree = useMemo(() => {
    let perms = isPreviewMode ? allPermissions : projectPermissions;
    if (!perms.length) return [];

    // 预览模式下：获取用户中心相关的权限点
    // ACTION 的 systemCode 是 USER_CENTER，PAGE 的 systemCode 是 UC_USER/UC_ORG/UC_POSITION
    if (isPreviewMode) {
      // 获取所有 USER_CENTER 的 ACTION
      const userCenterActions = perms.filter(p => p.systemCode === 'USER_CENTER' && p.type === 'ACTION');
      // 获取这些 ACTION 的 parentCode 对应的所有 PAGE（不限 systemCode）
      const parentCodes = new Set(userCenterActions.map(a => a.parentCode).filter(Boolean));
      const relatedPages = perms.filter(p => parentCodes.has(p.code) && p.type === 'PAGE');
      // 合并
      perms = [...userCenterActions, ...relatedPages];
    }

    // 构建 PAGE -> ACTION 二层树（用户中心结构）
    const pageMap = new Map<string, PermissionTreeNode>();
    const actionMap = new Map<string, PermissionTreeNode>();

    // 先分类
    perms.forEach(perm => {
      const node: PermissionTreeNode = {
        key: perm.code,
        title: perm.name,
        code: perm.code,
        type: perm.type,
        permissionId: perm.id,
      };

      if (perm.type === 'PAGE') {
        pageMap.set(perm.code, { ...node, children: [] });
      } else if (perm.type === 'ACTION') {
        actionMap.set(perm.code, node);
      }
    });

    // ACTION 归属到 PAGE
    perms.filter(p => p.type === 'ACTION').forEach(perm => {
      const actionNode = actionMap.get(perm.code);
      const pageNode = pageMap.get(perm.parentCode || '');
      if (actionNode && pageNode && pageNode.children) {
        pageNode.children.push(actionNode);
      }
    });

    // 预览模式下：只保留有角色权限的页面
    if (isPreviewMode && previewRolePermissionCodes.length > 0) {
      const rolePermSet = new Set(previewRolePermissionCodes);
      
      const filteredPages: PermissionTreeNode[] = [];
      Array.from(pageMap.values()).forEach(page => {
        // 过滤出该角色有权限的操作
        const filteredActions = (page.children || []).filter(action => 
          rolePermSet.has(action.code)
        );
        if (filteredActions.length > 0) {
          filteredPages.push({
            ...page,
            children: filteredActions,
          });
        }
      });
      return filteredPages;
    }

    return Array.from(pageMap.values());
  }, [isPreviewMode, allPermissions, projectPermissions, previewRolePermissionCodes]);

  /** 角色带来的权限点中，属于当前项目权限树内的编码（用于右侧勾选展示） */
  const roleCodesInCurrentProject = useMemo(() => {
    // 预览模式：使用所有权限过滤
    const permSet = isPreviewMode ? allPermissions : projectPermissions;
    const inProj = new Set(permSet.map((p) => p.code));
    return new Set((userRolePermissionCodes || []).filter((c) => inProj.has(c)));
  }, [isPreviewMode, allPermissions, projectPermissions, userRolePermissionCodes]);

  // 勾选状态：显示用户当前拥有的权限
  const hasEffectivePerm = (code: string) => {
    return roleCodesInCurrentProject.has(code);
  };

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
    if (projectIdForPerms && syncRoleCheckmarks) {
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
      setPreviewRole(null);
      handleSearch();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '移除失败');
    }
  };

  // 带确认的移除角色
  const confirmRemoveRole = (record: UserRole) => {
    Modal.confirm({
      title: '确认移除',
      content: `确定要移除角色「${record.roleName}」吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => handleRemoveRole(record),
    });
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
              setPreviewRole(null);
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
              const isSelected = previewRole?.id === role.id;
              return (
                <div
                  key={role.id}
                  className={`${styles.roleItem} ${isSelected ? styles.roleItemSelected : ''}`}
                  style={{
                    padding: '12px',
                    marginBottom: 8,
                    borderRadius: 8,
                    border: isSelected ? '2px solid #722ed1' : '1px solid #faad14',
                    background: isAssigned ? '#fffbe6' : '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePreviewRole(isSelected ? null : role)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Tag color="gold" icon={<CrownOutlined />}>
                        项目管理员
                      </Tag>
                      <div style={{ fontWeight: 500, marginTop: 4 }}>
                        {role.name}
                        {isSelected && <EyeOutlined style={{ marginLeft: 8, color: '#722ed1' }} />}
                      </div>
                    </div>
                    <Button
                      size="small"
                      danger={isAssigned}
                      type={isAssigned ? undefined : 'primary'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAssigned) {
                          confirmRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!);
                        } else {
                          handleAssignRole(role);
                        }
                      }}
                    >
                      {isAssigned ? '移除' : '分配'}
                    </Button>
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
                const isSelected = previewRole?.id === role.id;
                return (
                  <div
                    key={role.id}
                    className={`${styles.roleItem} ${isSelected ? styles.roleItemSelected : ''}`}
                    style={{
                      padding: '8px 12px',
                      marginBottom: 4,
                      borderRadius: 4,
                      background: isSelected ? '#f9f0ff' : (isAssigned ? '#f6ffed' : '#fafafa'),
                      border: isSelected ? '2px solid #722ed1' : '1px solid transparent',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreviewRole(isSelected ? null : role)}
                  >
                    <span>
                      {role.name}
                      {isSelected && <EyeOutlined style={{ marginLeft: 8, color: '#722ed1' }} />}
                    </span>
                    <Button
                      type="link"
                      size="small"
                      danger={isAssigned}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAssigned) {
                          confirmRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!);
                        } else {
                          handleAssignRole(role);
                        }
                      }}
                    >
                      {isAssigned ? '移除' : '分配'}
                    </Button>
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
              const isSelected = previewRole?.id === role.id;
              return (
                <div
                  key={role.id}
                  className={`${styles.roleItem} ${isSelected ? styles.roleItemSelected : ''}`}
                  style={{
                    padding: '8px 12px',
                    marginBottom: 4,
                    borderRadius: 4,
                    background: isSelected ? '#f9f0ff' : (isAssigned ? '#e6f7ff' : '#fafafa'),
                    border: isSelected ? '2px solid #722ed1' : '1px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePreviewRole(isSelected ? null : role)}
                >
                  <span>
                    {role.name}
                    {isSelected && <EyeOutlined style={{ marginLeft: 8, color: '#722ed1' }} />}
                  </span>
                  <Button
                    type="link"
                    size="small"
                    danger={isAssigned}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAssigned) {
                        confirmRemoveRole(currentProjectUserRoles.find((ur) => ur.roleCode === role.code)!);
                      } else {
                        handleAssignRole(role);
                      }
                    }}
                  >
                    {isAssigned ? '移除' : '分配'}
                  </Button>
                </div>
              );
            })}
          </Card>

          {/* 右侧：权限授权 */}
          <Card 
            title={
              <span>
                {isPreviewMode ? (
                  <>
                    <EyeOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                    角色权限预览：{previewRole.name}
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setPreviewRole(null)}
                      style={{ marginLeft: 8 }}
                    >
                      退出预览
                    </Button>
                  </>
                ) : (
                  <>
                    <SafetyOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                    权限授权
                  </>
                )}
              </span>
            }
            style={{ flex: 1 }}
            size="small"
          >
            {isPreviewMode ? (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message={`当前展示角色「${previewRole.name}」包含的权限点（只读），点击左侧其他角色可切换预览。`}
              />
            ) : (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
                message="请点击左侧角色预览该角色的权限配置。"
              />
            )}
            {!isPreviewMode ? (
              <Empty description="请点击左侧角色查看权限配置" style={{ marginTop: 40 }} />
            ) : permissionTree.length === 0 ? (
              <Empty description="该角色暂无用户中心权限配置" />
            ) : (
              <div className={styles.permissionTree}>
                {permissionTree.map(pageNode => {
                  const allPageCodes: string[] = [pageNode.code];
                  (pageNode.children || []).forEach(action => {
                    allPageCodes.push(action.code);
                  });
                  const assignedCount = allPageCodes.filter((c) => hasEffectivePerm(c)).length;
                  const isAllAssigned = allPageCodes.length > 0 && assignedCount === allPageCodes.length;

                  return (
                    <div key={pageNode.code} className={styles.moduleSection}>
                      {/* 页面头部 */}
                      <div className={styles.moduleHeader}>
                        <Checkbox
                          checked={isAllAssigned}
                          indeterminate={assignedCount > 0 && assignedCount < allPageCodes.length}
                          disabled
                        >
                          <span style={{ fontWeight: 500 }}>{pageNode.title}</span>
                        </Checkbox>
                        <Tag color="blue" style={{ marginLeft: 8 }}>
                          {assignedCount}/{allPageCodes.length}
                        </Tag>
                      </div>

                      {/* 操作权限 */}
                      <div className={styles.moduleContent}>
                        <div className={styles.actionList}>
                          {pageNode.children?.map(action => (
                            <Checkbox
                              key={action.code}
                              checked={hasEffectivePerm(action.code)}
                              disabled
                            >
                              {action.title}
                            </Checkbox>
                          ))}
                        </div>
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
