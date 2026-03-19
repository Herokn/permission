package com.permission.web.controller;

import com.permission.biz.manager.AuthzManager;
import com.permission.common.config.PermissionConfig;
import com.permission.common.context.UserContextHolder;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.result.ApiResponse;
import com.permission.biz.dto.authz.AuthzBatchCheckDTO;
import com.permission.biz.dto.authz.AuthzCheckDTO;
import com.permission.biz.vo.authz.AuthzBatchResultVO;
import com.permission.biz.vo.authz.AuthzResultVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 统一鉴权 Controller
 * 注意：鉴权接口只允许查询当前登录用户自身的权限，超级管理员可查询任意用户
 */
@Tag(name = "统一鉴权")
@RestController
@RequestMapping("/authz")
@RequiredArgsConstructor
public class AuthzController {

    private final AuthzManager authzManager;
    private final PermissionConfig permissionConfig;

    @Operation(summary = "单权限鉴权")
    @PostMapping("/check")
    public ApiResponse<AuthzResultVO> check(@RequestBody @Valid AuthzCheckDTO dto) {
        validateSelfOnly(dto.getUserId());
        return ApiResponse.success(authzManager.check(dto));
    }

    @Operation(summary = "批量鉴权")
    @PostMapping("/check-batch")
    public ApiResponse<AuthzBatchResultVO> checkBatch(@RequestBody @Valid AuthzBatchCheckDTO dto) {
        validateSelfOnly(dto.getUserId());
        return ApiResponse.success(authzManager.checkBatch(dto));
    }

    private void validateSelfOnly(String requestUserId) {
        String currentUserId = UserContextHolder.getUserId();
        if (currentUserId.equals(requestUserId)) {
            return;
        }
        // 超级管理员可以查询任何用户的权限
        if (permissionConfig.isSuperAdmin(currentUserId)) {
            return;
        }
        throw new BusinessException(ErrorCode.AUTH_FORBIDDEN, "只能查询自身权限");
    }
}

