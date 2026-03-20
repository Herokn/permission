package com.permission.biz.dto.organization;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建组织 DTO
 */
@Data
public class CreateOrganizationDTO {

    @NotBlank(message = "组织编码不能为空")
    @Size(max = 64, message = "组织编码长度不能超过64")
    private String orgCode;

    @NotBlank(message = "组织名称不能为空")
    @Size(max = 128, message = "组织名称长度不能超过128")
    private String orgName;

    private String orgType;

    private Long parentId;
}
