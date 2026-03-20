package com.permission.web.controller;

import com.permission.biz.manager.RoleManager;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.common.result.PageResult;
import com.permission.biz.dto.role.AssignRolePermissionsDTO;
import com.permission.biz.dto.role.CreateRoleDTO;
import com.permission.biz.dto.role.UpdateRoleDTO;
import com.permission.biz.vo.role.RoleVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 角色管理 Controller
 */
@Tag(name = "角色管理")
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleManager roleManager;

    @Operation(summary = "新增角色")
    @PostMapping
    @RequirePermission("PERMISSION_CENTER_ROLE_CREATE")
    public ApiResponse<RoleVO> create(@RequestBody @Valid CreateRoleDTO dto) {
        return ApiResponse.success(roleManager.createRole(dto));
    }

    @Operation(summary = "编辑角色")
    @PostMapping("/{id}/update")
    @RequirePermission("PERMISSION_CENTER_ROLE_EDIT")
    public ApiResponse<RoleVO> update(@PathVariable Long id, @RequestBody @Valid UpdateRoleDTO dto) {
        return ApiResponse.success(roleManager.updateRole(id, dto));
    }

    @Operation(summary = "删除角色")
    @PostMapping("/{id}/delete")
    @RequirePermission("PERMISSION_CENTER_ROLE_DELETE")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        roleManager.deleteRole(id);
        return ApiResponse.success();
    }

    @Operation(summary = "查询角色列表（分页）")
    @GetMapping
    @RequirePermission("PERMISSION_CENTER_ROLE_VIEW")
    public ApiResponse<PageResult<RoleVO>> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String roleScope,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {
        // 如果传了 projectId，使用项目隔离查询
        if (projectId != null && !projectId.isEmpty()) {
            return ApiResponse.success(roleManager.listRolesWithProjectFilter(code, name, roleScope, status, projectId, pageNum, pageSize));
        }
        return ApiResponse.success(roleManager.listRoles(code, name, roleScope, status, pageNum, pageSize));
    }

    @Operation(summary = "查询角色详情（含权限列表）")
    @GetMapping("/{id}")
    @RequirePermission("PERMISSION_CENTER_ROLE_VIEW")
    public ApiResponse<RoleVO> detail(@PathVariable Long id) {
        return ApiResponse.success(roleManager.getRoleDetail(id));
    }

    @Operation(summary = "角色权限分配（全量覆盖）")
    @PostMapping("/{id}/permissions")
    @RequirePermission("PERMISSION_CENTER_ROLE_ASSIGN_PERM")
    public ApiResponse<Void> assignPermissions(@PathVariable Long id,
                                                @RequestBody @Valid AssignRolePermissionsDTO dto) {
        roleManager.assignPermissions(id, dto);
        return ApiResponse.success();
    }

    @Operation(summary = "查询所有角色（下拉选择用）。传 projectId 时按用户授权场景过滤：全局角色 + 绑定该项目的项目角色；权限中心域仅 PC。")
    @GetMapping("/all")
    @RequirePermission("PERMISSION_CENTER_ROLE_VIEW")
    public ApiResponse<List<RoleVO>> listAll(@RequestParam(required = false) String projectId) {
        if (StringUtils.hasText(projectId)) {
            return ApiResponse.success(roleManager.listAllRolesForGrantContext(projectId.trim()));
        }
        return ApiResponse.success(roleManager.listAllRoles());
    }
}

