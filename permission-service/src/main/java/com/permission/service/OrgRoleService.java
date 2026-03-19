package com.permission.service;

import com.permission.dal.dataobject.OrgRoleDO;

import java.util.List;

/**
 * 组织-角色 Service 接口
 */
public interface OrgRoleService {

    /**
     * 根据组织ID查询角色关联列表
     */
    List<OrgRoleDO> listByOrgId(Long orgId);

    /**
     * 根据多个组织ID查询角色关联列表
     */
    List<OrgRoleDO> listByOrgIds(List<Long> orgIds);

    /**
     * 根据多个组织ID和项目ID查询角色关联列表
     * projectId 为 null 时，查询全局组织角色（project_id 为 null）
     */
    List<OrgRoleDO> listByOrgIdsAndProjectId(List<Long> orgIds, Long projectId);

    /**
     * 根据组织ID统计关联角色数
     */
    long countByOrgId(Long orgId);

    /**
     * 根据角色ID统计引用数（删除角色时检查）
     */
    long countByRoleId(Long roleId);

    /**
     * 判断是否已存在关联
     */
    boolean exists(Long orgId, Long roleId);

    /**
     * 保存组织-角色关联
     */
    void save(OrgRoleDO orgRoleDO);

    /**
     * 删除组织-角色关联
     */
    void remove(Long orgId, Long roleId);

    /**
     * 删除组织的所有角色关联
     */
    void removeByOrgId(Long orgId);
}

