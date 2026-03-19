package com.permission.biz.manager;

import com.permission.common.result.PageResult;
import com.permission.biz.dto.permission.CreatePermissionDTO;
import com.permission.biz.dto.permission.UpdatePermissionDTO;
import com.permission.biz.vo.permission.PermissionTreeVO;
import com.permission.biz.vo.permission.PermissionVO;

import java.util.List;

/**
 * 权限点 Manager 接口
 */
public interface PermissionManager {

    /**
     * 新增权限点
     */
    PermissionVO createPermission(CreatePermissionDTO dto);

    /**
     * 编辑权限点
     */
    PermissionVO updatePermission(Long id, UpdatePermissionDTO dto);

    /**
     * 删除权限点
     */
    void deletePermission(Long id);

    /**
     * 分页查询权限点
     */
    PageResult<PermissionVO> listPermissions(String code, String name, String type, String status,
                                              Integer pageNum, Integer pageSize);

    /**
     * 分页查询权限点（支持项目隔离）
     * @param code 权限编码
     * @param name 权限名称
     * @param type 权限类型
     * @param status 状态
     * @param projectId 项目ID，查询该项目的权限点 + 全局权限点
     * @param pageNum 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    PageResult<PermissionVO> listPermissionsWithProjectFilter(String code, String name, String type, String status,
                                                                String projectId, Integer pageNum, Integer pageSize);

    /**
     * 查询权限树
     */
    List<PermissionTreeVO> getPermissionTree();

    /**
     * 查询权限树（支持项目隔离）
     * @param projectId 项目ID，只返回该项目的权限树
     * @return 权限树
     */
    List<PermissionTreeVO> getPermissionTreeWithProjectFilter(String projectId);

    /**
     * 查询所有权限点（下拉选择用）
     */
    List<PermissionVO> listAllPermissions();

    /**
     * 查询所有权限点（支持项目隔离）
     * @param projectId 项目ID，只返回该项目的权限点 + 全局权限点
     * @return 权限点列表
     */
    List<PermissionVO> listAllPermissionsWithProjectFilter(String projectId);
}

