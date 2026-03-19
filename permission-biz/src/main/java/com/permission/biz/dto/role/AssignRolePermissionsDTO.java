package com.permission.biz.dto.role;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * 角色权限分配 DTO
 */
@Data
public class AssignRolePermissionsDTO {

    @NotNull(message = "权限编码列表不能为空")
    private List<String> permissionCodes;
}

