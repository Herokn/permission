package com.permission.web.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.permission.biz.dto.user.CreateUserDTO;
import com.permission.biz.dto.user.UpdateUserDTO;
import com.permission.biz.dto.user.UserQueryDTO;
import com.permission.biz.manager.UserManager;
import com.permission.biz.vo.user.CreateUserResultVO;
import com.permission.biz.vo.user.UserVO;
import com.permission.common.annotation.RequirePermission;
import com.permission.common.result.ApiResponse;
import com.permission.common.result.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户管理 Controller
 */
@Tag(name = "用户管理")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserManager userManager;

    @Operation(summary = "分页查询用户")
    @GetMapping
    @RequirePermission("USER_CENTER_USER_VIEW")
    public ApiResponse<PageResult<UserVO>> listUsers(UserQueryDTO dto) {
        IPage<UserVO> result = userManager.listUsers(dto);
        return ApiResponse.success(PageResult.of(
                result.getTotal(),
                dto.getPageNum(),
                dto.getPageSize(),
                result.getRecords()
        ));
    }

    @Operation(summary = "查询用户详情")
    @GetMapping("/{userId}")
    @RequirePermission("USER_CENTER_USER_VIEW")
    public ApiResponse<UserVO> getUserDetail(@PathVariable String userId) {
        return ApiResponse.success(userManager.getUserByUserId(userId));
    }

    @Operation(summary = "创建用户")
    @PostMapping
    @RequirePermission("USER_CENTER_USER_CREATE")
    public ApiResponse<CreateUserResultVO> createUser(@RequestBody @Valid CreateUserDTO dto) {
        return ApiResponse.success(userManager.createUser(dto));
    }

    @Operation(summary = "更新用户")
    @PutMapping("/{userId}")
    @RequirePermission("USER_CENTER_USER_EDIT")
    public ApiResponse<UserVO> updateUser(
            @PathVariable String userId,
            @RequestBody @Valid UpdateUserDTO dto
    ) {
        return ApiResponse.success(userManager.updateUser(userId, dto));
    }

    @Operation(summary = "启用用户")
    @PostMapping("/{userId}/enable")
    @RequirePermission("USER_CENTER_USER_ENABLE")
    public ApiResponse<Void> enableUser(@PathVariable String userId) {
        userManager.enableUser(userId);
        return ApiResponse.success();
    }

    @Operation(summary = "禁用用户")
    @PostMapping("/{userId}/disable")
    @RequirePermission("USER_CENTER_USER_ENABLE")
    public ApiResponse<Void> disableUser(@PathVariable String userId) {
        userManager.disableUser(userId);
        return ApiResponse.success();
    }

    @Operation(summary = "删除用户")
    @DeleteMapping("/{userId}")
    @RequirePermission("USER_CENTER_USER_DELETE")
    public ApiResponse<Void> deleteUser(@PathVariable String userId) {
        userManager.deleteUser(userId);
        return ApiResponse.success();
    }

    @Operation(summary = "重置密码")
    @PostMapping("/{userId}/reset-password")
    @RequirePermission("USER_CENTER_USER_RESET_PWD")
    public ApiResponse<String> resetPassword(
            @PathVariable String userId,
            @RequestParam(required = false) String newPassword
    ) {
        String temporaryPassword = userManager.resetPassword(userId, newPassword);
        return ApiResponse.success(temporaryPassword);
    }
}
