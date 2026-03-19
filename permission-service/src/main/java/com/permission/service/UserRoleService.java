package com.permission.service;

import com.permission.dal.dataobject.UserRoleDO;

import java.util.List;

/**
 * 用户-角色 Service 接口
 */
public interface UserRoleService {

    /**
     * 根据用户ID和项目ID查询用户角色列表
     * 同时查询 projectId 匹配的和 projectId=NULL（全局）的
     */
    List<UserRoleDO> listByUserIdAndProjectId(String userId, String projectId);

    /**
     * 根据用户ID查询所有角色
     */
    List<UserRoleDO> listByUserId(String userId);

    /**
     * 根据角色ID查询所有用户角色
     */
    List<UserRoleDO> listByRoleId(Long roleId);

    /**
     * 根据角色ID统计引用数
     */
    long countByRoleId(Long roleId);

    /**
     * 根据项目ID统计引用数
     */
    long countByProjectId(String projectId);

    /**
     * 分配用户角色（幂等）
     */
    void assign(String userId, Long roleId, String projectId);

    /**
     * 移除用户角色（幂等）
     */
    void revoke(String userId, Long roleId, String projectId);

    /**
     * 判断是否存在
     */
    boolean exists(String userId, Long roleId, String projectId);
}

