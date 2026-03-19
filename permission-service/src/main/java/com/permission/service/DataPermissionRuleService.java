package com.permission.service;

import com.permission.dal.dataobject.DataPermissionRuleDO;

import java.util.List;

/**
 * 数据权限规则 Service 接口
 */
public interface DataPermissionRuleService {

    /**
     * 根据角色ID查询数据权限规则
     */
    List<DataPermissionRuleDO> listByRoleId(Long roleId);

    /**
     * 根据角色ID列表批量查询数据权限规则
     */
    List<DataPermissionRuleDO> listByRoleIds(List<Long> roleIds);

    /**
     * 设置角色的数据权限规则（全量覆盖）
     */
    void setRules(Long roleId, List<DataPermissionRuleDO> rules);

    /**
     * 删除角色的所有数据权限规则
     */
    void removeByRoleId(Long roleId);

    /**
     * 根据角色ID和资源类型查询规则
     */
    DataPermissionRuleDO getByRoleIdAndResourceType(Long roleId, String resourceType);
}
