package com.permission.service;

import com.permission.service.model.AuthzResult;

import java.util.Set;

/**
 * 鉴权 Service 接口
 */
public interface AuthzService {

    /**
     * 核心鉴权方法
     *
     * @param userId         用户ID
     * @param permissionCode 权限编码
     * @param projectId      项目ID（null 表示全局鉴权）
     * @return AuthzResult 鉴权结果（含 reason）
     */
    AuthzResult check(String userId, String permissionCode, String projectId);

    /**
     * 获取用户所有权限编码
     *
     * @param userId    用户ID
     * @param projectId 项目ID（null 表示全局）
     * @return 权限编码集合
     */
    Set<String> getUserPermissionCodes(String userId, String projectId);
}

