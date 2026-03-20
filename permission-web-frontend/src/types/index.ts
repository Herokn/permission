/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页请求参数
 */
export interface PageRequest {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 分页响应数据
 */
export interface PageResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 登录请求
 */
export interface LoginRequest {
  userName: string;
  password: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: string;
  userName: string;
  loginType?: string;
  permissions?: string[];
  admin?: boolean;
  modules?: string[];
}

/**
 * 权限点
 */
export interface Permission {
  id: number;
  code: string;
  name: string;
  systemCode: string;
  projectId?: string;
  type: string;
  parentCode?: string;
  sortOrder?: number;
  status: string;
  description?: string;
  gmtCreate?: string;
  gmtModified?: string;
}

/**
 * 权限点创建/更新请求
 */
export interface PermissionRequest {
  code: string;
  name: string;
  systemCode: string;
  projectId?: string;
  type: string;
  parentCode?: string;
  sortOrder?: number;
  description?: string;
}

/**
 * 角色
 */
export interface Role {
  id: number;
  code: string;
  name: string;
  roleScope?: string;
  roleDomain?: string;
  projectId?: string;
  status: string;
  description?: string;
  permissionCodes?: string[];
  gmtCreate?: string;
  gmtModified?: string;
}

/**
 * 角色创建/更新请求
 */
export interface RoleRequest {
  code: string;
  name: string;
  roleScope?: string;
  roleDomain?: string;
  projectId?: string;
  description?: string;
}

/**
 * 用户角色
 */
export interface UserRole {
  roleId: number;
  roleCode: string;
  roleName: string;
  roleScope?: string;
  projectId?: string;
}

/**
 * 用户直接权限
 */
export interface UserDirectPermission {
  permissionCode: string;
  permissionName?: string;
  effect: 'ALLOW' | 'DENY';
  projectId?: string;
}

/**
 * 用户授权详情
 */
export interface UserAuthDetail {
  userId: string;
  loginAccount?: string;
  displayName?: string;
  roles: UserRole[];
  directPermissions: UserDirectPermission[];
  /** 启用角色下的权限点编码并集（去重），与 directPermissions 一起反映生效范围 */
  rolePermissionCodes?: string[];
}

/**
 * 用户角色分配请求
 */
export interface AssignUserRoleRequest {
  userId: string;
  roleId: number;
  projectId?: string;
}

/**
 * 用户直接权限请求
 */
export interface GrantUserPermissionRequest {
  userId: string;
  permissionCode: string;
  effect: 'ALLOW' | 'DENY';
  projectId?: string;
}

/**
 * 角色权限授权请求
 */
export interface RolePermissionRequest {
  roleCode: string;
  permissionCodes: string[];
}

/**
 * 鉴权请求
 */
export interface AuthzRequest {
  userId: string;
  permissionCode: string;
  projectId?: string;
}

/**
 * 鉴权响应
 */
export interface AuthzResponse {
  allowed: boolean;
  reason?: string;
}

/**
 * 项目
 */
export interface Project {
  id: number;
  code: string;
  name: string;
  description?: string;
  systems?: SystemModule[];
  status: string;
  gmtCreate?: string;
  gmtModified?: string;
}

/**
 * 系统模块
 */
export interface SystemModule {
  code: string;
  name: string;
}

/**
 * 项目创建/更新请求
 */
export interface ProjectRequest {
  code?: string;
  name?: string;
  description?: string;
  systems?: SystemModule[];
  status?: string;
}
