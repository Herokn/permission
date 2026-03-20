export interface LoginParams {
  username: string;
  password: string;
  projectId?: string;
}

export interface UserInfoResult {
  userId?: string;
  username?: string;
  nickName?: string;
  roles?: string[];
  avatar?: string;
  email?: string;
  mobile?: string;
  enabled?: boolean;
  description?: string;
  birthday?: string;
  orgId?: string;
  tenantCode?: string;
  tenantName?: string;
}
