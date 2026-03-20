package com.permission.web.controller;

import com.permission.biz.manager.PermissionManager;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.common.result.PageResult;
import com.permission.biz.dto.permission.CreatePermissionDTO;
import com.permission.biz.dto.permission.UpdatePermissionDTO;
import com.permission.biz.vo.permission.PermissionTreeVO;
import com.permission.biz.vo.permission.PermissionVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 权限点管理 Controller
 */
@Tag(name = "权限点管理")
@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionManager permissionManager;

    @Operation(summary = "新增权限点")
    @PostMapping
    @RequirePermission("PERMISSION_CENTER_PERMISSION_CREATE")
    public ApiResponse<PermissionVO> create(@RequestBody @Valid CreatePermissionDTO dto) {
        return ApiResponse.success(permissionManager.createPermission(dto));
    }

    @Operation(summary = "编辑权限点")
    @PostMapping("/{id}/update")
    @RequirePermission("PERMISSION_CENTER_PERMISSION_EDIT")
    public ApiResponse<PermissionVO> update(@PathVariable Long id,
                                             @RequestBody @Valid UpdatePermissionDTO dto) {
        return ApiResponse.success(permissionManager.updatePermission(id, dto));
    }

    @Operation(summary = "删除权限点")
    @PostMapping("/{id}/delete")
    @RequirePermission("PERMISSION_CENTER_PERMISSION_DELETE")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        permissionManager.deletePermission(id);
        return ApiResponse.success();
    }

    @Operation(summary = "查询权限点列表（分页）")
    @GetMapping
    @RequirePermission("PERMISSION_CENTER_PERMISSION_VIEW")
    public ApiResponse<PageResult<PermissionVO>> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) Integer pageNum,
            @RequestParam(required = false) Integer pageSize) {
        // 如果传了 projectId，使用项目隔离查询
        if (projectId != null && !projectId.isEmpty()) {
            return ApiResponse.success(permissionManager.listPermissionsWithProjectFilter(code, name, type, status, projectId, pageNum, pageSize));
        }
        return ApiResponse.success(permissionManager.listPermissions(code, name, type, status, pageNum, pageSize));
    }

    @Operation(summary = "查询权限树")
    @GetMapping("/tree")
    @RequirePermission("PERMISSION_CENTER_PERMISSION_VIEW")
    public ApiResponse<List<PermissionTreeVO>> tree(
            @RequestParam(required = false) String projectId) {
        // 如果传了 projectId，使用项目隔离查询
        if (projectId != null && !projectId.isEmpty()) {
            return ApiResponse.success(permissionManager.getPermissionTreeWithProjectFilter(projectId));
        }
        return ApiResponse.success(permissionManager.getPermissionTree());
    }

    @Operation(summary = "查询所有权限点（下拉选择用）")
    @GetMapping("/all")
    @RequirePermission("PERMISSION_CENTER_PERMISSION_VIEW")
    public ApiResponse<List<PermissionVO>> listAll(
            @RequestParam(required = false) String projectId) {
        // 如果传了 projectId，使用项目隔离查询
        if (projectId != null && !projectId.isEmpty()) {
            return ApiResponse.success(permissionManager.listAllPermissionsWithProjectFilter(projectId));
        }
        return ApiResponse.success(permissionManager.listAllPermissions());
    }
}

