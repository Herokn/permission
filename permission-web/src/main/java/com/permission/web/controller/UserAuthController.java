package com.permission.web.controller;

import com.permission.biz.manager.UserAuthManager;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.biz.dto.userauth.AssignUserRoleDTO;
import com.permission.biz.dto.userauth.BatchAssignRoleDTO;
import com.permission.biz.dto.userauth.BatchGrantPermissionDTO;
import com.permission.biz.dto.userauth.GrantUserPermissionDTO;
import com.permission.biz.vo.userauth.UserAuthDetailVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户授权 Controller
 */
@Tag(name = "用户授权")
@RestController
@RequestMapping("/user-auth")
@RequiredArgsConstructor
public class UserAuthController {

    private final UserAuthManager userAuthManager;

    @Operation(summary = "分配用户角色")
    @PostMapping("/roles/assign")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> assignRole(@RequestBody @Valid AssignUserRoleDTO dto) {
        userAuthManager.assignRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量分配用户角色")
    @PostMapping("/roles/batch-assign")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> batchAssignRole(@RequestBody @Valid BatchAssignRoleDTO dto) {
        userAuthManager.batchAssignRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量移除用户角色")
    @PostMapping("/roles/batch-revoke")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> batchRevokeRole(@RequestBody @Valid BatchAssignRoleDTO dto) {
        userAuthManager.batchRevokeRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "移除用户角色")
    @PostMapping("/roles/revoke")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> revokeRole(@RequestBody @Valid AssignUserRoleDTO dto) {
        userAuthManager.revokeRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "授予/排除用户直接权限")
    @PostMapping("/permissions/grant")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> grantPermission(@RequestBody @Valid GrantUserPermissionDTO dto) {
        userAuthManager.grantPermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量授予用户权限")
    @PostMapping("/permissions/batch-grant")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> batchGrantPermission(@RequestBody @Valid BatchGrantPermissionDTO dto) {
        userAuthManager.batchGrantPermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量移除用户权限")
    @PostMapping("/permissions/batch-revoke")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> batchRevokePermission(@RequestBody @Valid BatchGrantPermissionDTO dto) {
        userAuthManager.batchRevokePermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "移除用户直接权限")
    @PostMapping("/permissions/revoke")
    @RequirePermission("USER_AUTH_MANAGE")
    public ApiResponse<Void> revokePermission(@RequestBody @Valid GrantUserPermissionDTO dto) {
        userAuthManager.revokePermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "查询用户授权详情")
    @GetMapping("/{userId}")
    @RequirePermission("USER_AUTH_VIEW")
    public ApiResponse<UserAuthDetailVO> detail(@PathVariable String userId) {
        return ApiResponse.success(userAuthManager.getUserAuthDetail(userId));
    }
}

