package com.permission.service;

import com.permission.dal.dataobject.RolePermissionDO;

import java.util.List;
import java.util.Set;

/**
 * 角色-权限 Service 接口
 */
public interface RolePermissionService {

    /**
     * 根据角色ID查询权限编码列表
     */
    List<RolePermissionDO> listByRoleId(Long roleId);

    /**
     * 批量根据角色ID列表查询权限编码列表
     */
    List<RolePermissionDO> listByRoleIds(List<Long> roleIds);

    /**
     * 根据权限编码统计引用数
     */
    long countByPermissionCode(String permissionCode);

    /**
     * 判断角色是否拥有指定权限
     */
    boolean exists(Long roleId, String permissionCode);

    /**
     * 全量覆盖角色权限
     */
    void replacePermissions(Long roleId, List<String> permissionCodes);

    /**
     * 删除角色的所有权限关系
     */
    void removeByRoleId(Long roleId);

    /**
     * 批量查询哪些角色拥有指定权限
     * @return 返回拥有该权限的角色ID字符串集合
     */
    Set<String> listByRoleIdsAndPermissionCode(Set<Long> roleIds, String permissionCode);
}

