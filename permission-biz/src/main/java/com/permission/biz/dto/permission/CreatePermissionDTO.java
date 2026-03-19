package com.permission.biz.dto.permission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 新增权限点 DTO
 */
@Data
public class CreatePermissionDTO {

    @NotBlank(message = "权限编码不能为空")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,63}$", message = "权限编码格式不正确，需以大写字母开头，仅含大写字母、数字、下划线")
    private String code;

    @NotBlank(message = "权限名称不能为空")
    @Size(max = 128, message = "权限名称长度不能超过128")
    private String name;

    @Size(max = 64, message = "系统编码长度不能超过64")
    private String systemCode;

    /** 项目ID，项目管理员创建时自动设置 */
    private String projectId;

    @NotBlank(message = "权限类型不能为空")
    private String type;

    @Size(max = 64, message = "父权限编码长度不能超过64")
    private String parentCode;

    @Min(value = 0, message = "排序号不能小于0")
    private Integer sortOrder;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

