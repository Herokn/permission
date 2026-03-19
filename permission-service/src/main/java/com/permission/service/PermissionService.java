package com.permission.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.permission.dal.dataobject.PermissionDO;

import java.util.List;

/**
 * 权限点 Service 接口
 */
public interface PermissionService {

    /**
     * 根据 ID 查询
     */
    PermissionDO getById(Long id);

    /**
     * 根据编码查询
     */
    PermissionDO getByCode(String code);

    /**
     * 保存权限点
     */
    void save(PermissionDO permissionDO);

    /**
     * 更新权限点
     */
    void updateById(PermissionDO permissionDO);

    /**
     * 删除权限点（逻辑删除）
     */
    void removeById(Long id);

    /**
     * 根据父编码统计子节点数
     */
    long countByParentCode(String parentCode);

    /**
     * 根据状态查询列表
     */
    List<PermissionDO> listByStatus(String status);

    /**
     * 分页查询
     */
    IPage<PermissionDO> page(Page<PermissionDO> page, String code, String name, String type, String status);

    /**
     * 分页查询（支持项目隔离）
     * @param page 分页参数
     * @param code 权限编码
     * @param name 权限名称
     * @param type 权限类型
     * @param status 状态
     * @param projectId 项目ID，查询该项目的权限点 + 全局权限点（projectId=null）
     * @return 分页结果
     */
    IPage<PermissionDO> pageWithProjectFilter(Page<PermissionDO> page, String code, String name, String type, String status, String projectId);

    /**
     * 查询所有权限点
     */
    List<PermissionDO> listAll();

    /**
     * 查询所有权限点（支持项目隔离）
     * @param projectId 项目ID，只返回该项目的权限点 + 全局权限点
     * @return 权限点列表
     */
    List<PermissionDO> listAllWithProjectFilter(String projectId);

    /**
     * 根据编码列表批量查询
     */
    List<PermissionDO> listByCodes(List<String> codes);
}

