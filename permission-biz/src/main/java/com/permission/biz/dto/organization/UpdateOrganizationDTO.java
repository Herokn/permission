package com.permission.biz.dto.organization;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 编辑组织 DTO
 */
@Data
public class UpdateOrganizationDTO {

    @Size(max = 128, message = "组织名称长度不能超过128")
    private String orgName;

    private String orgType;

    private Long parentId;

    private Integer status;
}
