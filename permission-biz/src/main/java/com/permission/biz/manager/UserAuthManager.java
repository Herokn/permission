package com.permission.biz.manager;

import com.permission.biz.dto.userauth.AssignUserRoleDTO;
import com.permission.biz.dto.userauth.BatchAssignRoleDTO;
import com.permission.biz.dto.userauth.BatchGrantPermissionDTO;
import com.permission.biz.dto.userauth.GrantUserPermissionDTO;
import com.permission.biz.vo.userauth.UserAuthDetailVO;

/**
 * 用户授权 Manager 接口
 */
public interface UserAuthManager {

    /**
     * 分配用户角色
     */
    void assignRole(AssignUserRoleDTO dto);

    /**
     * 批量分配用户角色
     */
    void batchAssignRole(BatchAssignRoleDTO dto);

    /**
     * 批量移除用户角色
     */
    void batchRevokeRole(BatchAssignRoleDTO dto);

    /**
     * 移除用户角色
     */
    void revokeRole(AssignUserRoleDTO dto);

    /**
     * 授予/排除用户直接权限
     */
    void grantPermission(GrantUserPermissionDTO dto);

    /**
     * 批量授予用户权限
     */
    void batchGrantPermission(BatchGrantPermissionDTO dto);

    /**
     * 批量移除用户权限
     */
    void batchRevokePermission(BatchGrantPermissionDTO dto);

    /**
     * 移除用户直接权限
     */
    void revokePermission(GrantUserPermissionDTO dto);

    /**
     * 查询用户授权详情
     */
    UserAuthDetailVO getUserAuthDetail(String userId);
}

