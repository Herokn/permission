package com.permission.biz.dto.userauth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 用户-角色分配/移除 DTO
 */
@Data
public class AssignUserRoleDTO {

    @NotBlank(message = "用户ID不能为空")
    private String userId;

    @NotNull(message = "角色ID不能为空")
    private Long roleId;

    /** 项目ID，NULL 表示全局 */
    private String projectId;
}

