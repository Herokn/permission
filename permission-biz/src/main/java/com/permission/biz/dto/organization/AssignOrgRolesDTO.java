package com.permission.biz.dto.organization;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 为组织分配角色 DTO
 */
@Data
public class AssignOrgRolesDTO {

    @NotEmpty(message = "角色ID列表不能为空")
    private List<Long> roleIds;
}

