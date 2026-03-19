package com.permission.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.dal.dataobject.RoleDO;

import java.util.List;

/**
 * 角色 Service 接口
 */
public interface RoleService {

    RoleDO getById(Long id);

    RoleDO getByCode(String code);

    boolean existsByCode(String code);

    void save(RoleDO roleDO);

    void updateById(RoleDO roleDO);

    void removeById(Long id);

    IPage<RoleDO> page(Page<RoleDO> page, String code, String name, String roleScope, String status);

    /**
     * 分页查询（支持项目隔离）
     * @param page 分页参数
     * @param code 角色编码
     * @param name 角色名称
     * @param roleScope 角色范围
     * @param status 状态
     * @param projectId 项目ID，查询该项目的角色 + 全局角色（projectId=null）
     * @return 分页结果
     */
    IPage<RoleDO> pageWithProjectFilter(Page<RoleDO> page, String code, String name, String roleScope, String status, String projectId);

    List<RoleDO> listAll();

    /**
     * 按状态查询角色列表
     */
    List<RoleDO> listByStatus(String status);

    /**
     * 批量查询角色
     */
    List<RoleDO> listByIds(List<Long> ids);
}

