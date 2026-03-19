package com.permission.service;

import com.permission.dal.dataobject.UserOrgDO;

import java.util.List;

/**
 * 用户-组织 Service 接口
 */
public interface UserOrgService {

    /**
     * 根据用户ID查询所属组织列表
     */
    List<UserOrgDO> listByUserId(String userId);

    /**
     * 根据组织ID查询成员列表
     */
    List<UserOrgDO> listByOrgId(Long orgId);

    /**
     * 根据组织ID统计成员数
     */
    long countByOrgId(Long orgId);

    /**
     * 判断是否已存在关联
     */
    boolean exists(String userId, Long orgId);

    /**
     * 保存用户-组织关联
     */
    void save(UserOrgDO userOrgDO);

    /**
     * 删除用户-组织关联
     */
    void remove(String userId, Long orgId);
}

