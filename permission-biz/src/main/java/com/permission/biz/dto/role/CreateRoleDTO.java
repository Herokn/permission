package com.permission.biz.dto.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 新增角色 DTO
 */
@Data
public class CreateRoleDTO {

    @NotBlank(message = "角色编码不能为空")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,63}$", message = "角色编码格式不正确")
    private String code;

    @NotBlank(message = "角色名称不能为空")
    @Size(max = 128, message = "角色名称长度不能超过128")
    private String name;

    @NotBlank(message = "角色范围不能为空")
    private String roleScope;

    @NotBlank(message = "角色域不能为空")
    private String roleDomain;

    /** 项目ID，项目管理员创建时自动设置 */
    private String projectId;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

