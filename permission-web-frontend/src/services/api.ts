import type { AxiosRequestConfig } from 'axios';
import { get, post } from '@/utils/request';
import { 
  ApiResponse, 
  LoginRequest, 
  UserInfo,
  Permission, 
  PermissionRequest,
  Role, 
  RoleRequest,
  UserAuthDetail,
  AssignUserRoleRequest,
  GrantUserPermissionRequest,
  AuthzRequest,
  AuthzResponse,
  PageRequest,
  PageResponse,
  Project,
  ProjectRequest
} from '@/types';

const API_PREFIX = '/api';

// ==================== 认证相关 ====================

export const login = (data: LoginRequest): Promise<ApiResponse<UserInfo>> => {
  return post<UserInfo>(`${API_PREFIX}/auth/login`, data);
};

export const logout = (): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/auth/logout`);
};

export const refreshToken = (): Promise<ApiResponse<UserInfo>> => {
  return post<UserInfo>(`${API_PREFIX}/auth/refresh`);
};

export const getCurrentUser = (): Promise<ApiResponse<UserInfo>> => {
  return get<UserInfo>(`${API_PREFIX}/auth/current-user`);
};

// ==================== 权限点管理 ====================

export const listPermissions = (params?: PageRequest & { permissionName?: string; projectId?: string }): Promise<ApiResponse<PageResponse<Permission>>> => {
  return get<PageResponse<Permission>>(`${API_PREFIX}/permissions`, { params });
};

export const getPermission = (id: number): Promise<ApiResponse<Permission>> => {
  return get<Permission>(`${API_PREFIX}/permissions/${id}`);
};

export const createPermission = (data: PermissionRequest): Promise<ApiResponse<Permission>> => {
  return post<Permission>(`${API_PREFIX}/permissions`, data);
};

export const updatePermission = (id: number, data: PermissionRequest): Promise<ApiResponse<Permission>> => {
  return post<Permission>(`${API_PREFIX}/permissions/${id}/update`, data);
};

export const deletePermission = (id: number): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/permissions/${id}/delete`);
};

export const listAllPermissions = (projectId?: string): Promise<ApiResponse<Permission[]>> => {
  const params = projectId ? { projectId } : undefined;
  return get<Permission[]>(`${API_PREFIX}/permissions/all`, { params });
};

// ==================== 角色管理 ====================

export const listRoles = (params?: PageRequest & { roleName?: string }): Promise<ApiResponse<PageResponse<Role>>> => {
  return get<PageResponse<Role>>(`${API_PREFIX}/roles`, { params });
};

export const listAllRoles = (projectId?: string): Promise<ApiResponse<Role[]>> => {
  const params = projectId ? { projectId } : undefined;
  return get<Role[]>(`${API_PREFIX}/roles/all`, { params });
};

export const getRole = (roleId: number): Promise<ApiResponse<Role>> => {
  return get<Role>(`${API_PREFIX}/roles/${roleId}`);
};

export const createRole = (data: RoleRequest): Promise<ApiResponse<Role>> => {
  return post<Role>(`${API_PREFIX}/roles`, data);
};

export const updateRole = (roleId: number, data: RoleRequest): Promise<ApiResponse<Role>> => {
  return post<Role>(`${API_PREFIX}/roles/${roleId}/update`, data);
};

export const deleteRole = (roleId: number): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/roles/${roleId}/delete`);
};

export const getRoleDetail = (roleId: number): Promise<ApiResponse<Role>> => {
  return get<Role>(`${API_PREFIX}/roles/${roleId}`);
};

export const grantPermissionsToRole = (roleId: number, permissionCodes: string[]): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/roles/${roleId}/permissions`, { permissionCodes });
};

// ==================== 用户授权 ====================

export const getUserAuthDetail = (userId: string): Promise<ApiResponse<UserAuthDetail>> => {
  return get<UserAuthDetail>(`${API_PREFIX}/user-auth/detail`, { params: { userId } });
};

/** 用户授权详情变更后若仍打勾，多为浏览器/代理缓存了 GET；每次带时间戳并禁用缓存 */
export const getUserAuthDetailByLoginAccount = (loginAccount: string): Promise<ApiResponse<UserAuthDetail>> => {
  const config: AxiosRequestConfig = {
    params: { loginAccount, _: Date.now() },
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  };
  return get<UserAuthDetail>(`${API_PREFIX}/user-auth/detail`, config);
};

export const assignUserRole = (data: AssignUserRoleRequest): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/roles/assign`, data);
};

export const revokeUserRole = (data: AssignUserRoleRequest): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/roles/revoke`, data);
};

export const grantUserPermission = (data: GrantUserPermissionRequest): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/permissions/grant`, data);
};

export const revokeUserPermission = (data: GrantUserPermissionRequest): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/permissions/revoke`, data);
};

export const batchAssignUserRole = (data: { userIds: string[]; roleId: number; projectId?: string }): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/roles/batch-assign`, data);
};

export const batchRevokeUserRole = (data: { userIds: string[]; roleId: number; projectId?: string }): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/roles/batch-revoke`, data);
};

export const batchGrantUserPermission = (data: { userIds: string[]; permissionCode: string; effect: 'ALLOW' | 'DENY'; projectId?: string }): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/permissions/batch-grant`, data);
};

export const batchRevokeUserPermission = (data: { userIds: string[]; permissionCode: string; effect: 'ALLOW' | 'DENY'; projectId?: string }): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/user-auth/permissions/batch-revoke`, data);
};

// ==================== 统一鉴权 ====================

export const checkPermission = (data: AuthzRequest): Promise<ApiResponse<AuthzResponse>> => {
  return post<AuthzResponse>(`${API_PREFIX}/authz/check`, data);
};

export const batchCheckPermissions = (data: { userId: string; permissionCodes: string[]; projectId?: string }): Promise<ApiResponse<{ results: Record<string, boolean> }>> => {
  return post<{ results: Record<string, boolean> }>(`${API_PREFIX}/authz/check-batch`, data);
};

// ==================== 项目管理 ====================

export const listProjects = (params?: PageRequest): Promise<ApiResponse<PageResponse<Project>>> => {
  return get<PageResponse<Project>>(`${API_PREFIX}/projects`, { params });
};

export const listAllProjects = (): Promise<ApiResponse<Project[]>> => {
  return get<Project[]>(`${API_PREFIX}/projects/all`);
};

export const createProject = (data: ProjectRequest): Promise<ApiResponse<Project>> => {
  return post<Project>(`${API_PREFIX}/projects`, data);
};

export const updateProject = (id: number, data: ProjectRequest): Promise<ApiResponse<Project>> => {
  return post<Project>(`${API_PREFIX}/projects/${id}/update`, data);
};

export const deleteProject = (id: number): Promise<ApiResponse<void>> => {
  return post<void>(`${API_PREFIX}/projects/${id}/delete`);
};
