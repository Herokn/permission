package com.permission.service;

import com.permission.dal.dataobject.OrganizationDO;

import java.util.List;

/**
 * 组织 Service 接口
 */
public interface OrganizationService {

    OrganizationDO getById(Long id);

    OrganizationDO getByCode(String code);

    void save(OrganizationDO organizationDO);

    void updateById(OrganizationDO organizationDO);

    void removeById(Long id);

    /**
     * 根据父组织ID统计子组织数
     */
    long countByParentId(Long parentId);

    /**
     * 查询所有组织
     */
    List<OrganizationDO> listAll();

    /**
     * 根据父组织ID查询子组织列表
     */
    List<OrganizationDO> listByParentId(Long parentId);
}

