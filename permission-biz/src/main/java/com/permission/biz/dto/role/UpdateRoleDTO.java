package com.permission.biz.dto.role;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 编辑角色 DTO
 */
@Data
public class UpdateRoleDTO {

    @Size(max = 128, message = "角色名称长度不能超过128")
    private String name;

    private String roleScope;

    private String roleDomain;

    private String status;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

