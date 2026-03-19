package com.permission.service;

import com.permission.dal.dataobject.UserPermissionDO;

import java.util.List;

/**
 * 用户直接权限 Service 接口
 */
public interface UserPermissionService {

    /**
     * 查找用户直接 DENY 记录
     */
    UserPermissionDO findDeny(String userId, String permissionCode, String projectId);

    /**
     * 查找用户直接 ALLOW 记录
     */
    UserPermissionDO findAllow(String userId, String permissionCode, String projectId);

    /**
     * 根据权限编码统计引用数
     */
    long countByPermissionCode(String permissionCode);

    /**
     * 根据项目ID统计引用数
     */
    long countByProjectId(String projectId);

    /**
     * 根据用户ID查询所有直接权限
     */
    List<UserPermissionDO> listByUserId(String userId);

    /**
     * 授予/排除用户直接权限（幂等）
     */
    void grant(String userId, String permissionCode, String effect, String projectId);

    /**
     * 移除用户直接权限（幂等）
     */
    void revoke(String userId, String permissionCode, String effect, String projectId);
}

