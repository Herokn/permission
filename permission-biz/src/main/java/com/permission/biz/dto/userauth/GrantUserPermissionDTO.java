package com.permission.biz.dto.userauth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 用户直接权限授予/移除 DTO
 */
@Data
public class GrantUserPermissionDTO {

    @NotBlank(message = "用户ID不能为空")
    private String userId;

    @NotBlank(message = "权限编码不能为空")
    private String permissionCode;

    @NotBlank(message = "权限效果不能为空")
    private String effect;

    /** 项目ID，NULL 表示全局 */
    private String projectId;
}

