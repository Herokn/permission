package com.permission.web.controller;

import com.permission.biz.manager.UserAuthManager;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
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
import org.springframework.util.StringUtils;
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
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> assignRole(@RequestBody @Valid AssignUserRoleDTO dto) {
        userAuthManager.assignRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量分配用户角色")
    @PostMapping("/roles/batch-assign")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> batchAssignRole(@RequestBody @Valid BatchAssignRoleDTO dto) {
        userAuthManager.batchAssignRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量移除用户角色")
    @PostMapping("/roles/batch-revoke")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> batchRevokeRole(@RequestBody @Valid BatchAssignRoleDTO dto) {
        userAuthManager.batchRevokeRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "移除用户角色")
    @PostMapping("/roles/revoke")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> revokeRole(@RequestBody @Valid AssignUserRoleDTO dto) {
        userAuthManager.revokeRole(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "授予/排除用户直接权限")
    @PostMapping("/permissions/grant")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> grantPermission(@RequestBody @Valid GrantUserPermissionDTO dto) {
        userAuthManager.grantPermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量授予用户权限")
    @PostMapping("/permissions/batch-grant")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> batchGrantPermission(@RequestBody @Valid BatchGrantPermissionDTO dto) {
        userAuthManager.batchGrantPermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "批量移除用户权限")
    @PostMapping("/permissions/batch-revoke")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> batchRevokePermission(@RequestBody @Valid BatchGrantPermissionDTO dto) {
        userAuthManager.batchRevokePermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "移除用户直接权限")
    @PostMapping("/permissions/revoke")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_MANAGE")
    public ApiResponse<Void> revokePermission(@RequestBody @Valid GrantUserPermissionDTO dto) {
        userAuthManager.revokePermission(dto);
        return ApiResponse.success();
    }

    @Operation(summary = "查询用户授权详情（userId 或 loginAccount 二选一）")
    @GetMapping("/detail")
    @RequirePermission("PERMISSION_CENTER_USER_GRANT_VIEW")
    public ApiResponse<UserAuthDetailVO> detail(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String loginAccount) {
        if (StringUtils.hasText(loginAccount)) {
            return ApiResponse.success(userAuthManager.getUserAuthDetailByLoginAccount(loginAccount.trim()));
        }
        if (StringUtils.hasText(userId)) {
            return ApiResponse.success(userAuthManager.getUserAuthDetail(userId.trim()));
        }
        throw new BusinessException(ErrorCode.AUTHZ_PARAM_INVALID, "请传入 loginAccount 或 userId");
    }
}

