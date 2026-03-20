package com.permission.biz.manager;

import com.permission.common.result.PageResult;
import com.permission.biz.dto.role.AssignRolePermissionsDTO;
import com.permission.biz.dto.role.CreateRoleDTO;
import com.permission.biz.dto.role.UpdateRoleDTO;
import com.permission.biz.vo.role.RoleVO;

import java.util.List;

/**
 * 角色 Manager 接口
 */
public interface RoleManager {

    RoleVO createRole(CreateRoleDTO dto);

    RoleVO updateRole(Long id, UpdateRoleDTO dto);

    void deleteRole(Long id);

    PageResult<RoleVO> listRoles(String code, String name, String roleScope, String status,
                                  Integer pageNum, Integer pageSize);

    /**
     * 分页查询角色（支持项目隔离）
     * @param code 角色编码
     * @param name 角色名称
     * @param roleScope 角色范围
     * @param status 状态
     * @param projectId 项目ID，查询该项目的角色 + 全局角色
     * @param pageNum 页码
     * @param pageSize 每页数量
     * @return 分页结果
     */
    PageResult<RoleVO> listRolesWithProjectFilter(String code, String name, String roleScope, String status,
                                                    String projectId, Integer pageNum, Integer pageSize);

    RoleVO getRoleDetail(Long id);

    void assignPermissions(Long roleId, AssignRolePermissionsDTO dto);

    /**
     * 查询所有角色（下拉选择用）
     */
    List<RoleVO> listAllRoles();

    /**
     * 用户授权场景：按当前项目列出可分配角色。
     * 规则：全局角色 + 仅绑定到该项目的项目范围角色；权限中心域角色仅出现在 PC 项目。
     */
    List<RoleVO> listAllRolesForGrantContext(String projectCode);
}

