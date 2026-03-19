package com.permission.biz.dto.permission;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 编辑权限点 DTO
 */
@Data
public class UpdatePermissionDTO {

    @Size(max = 128, message = "权限名称长度不能超过128")
    private String name;

    @Size(max = 64, message = "系统编码长度不能超过64")
    private String systemCode;

    private String type;

    @Size(max = 64, message = "父权限编码长度不能超过64")
    private String parentCode;

    @Min(value = 0, message = "排序号不能小于0")
    private Integer sortOrder;

    private String status;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

