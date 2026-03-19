package com.permission.biz.dto.organization;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 编辑组织 DTO
 */
@Data
public class UpdateOrganizationDTO {

    @Size(max = 128, message = "组织名称长度不能超过128")
    private String name;

    private Long parentId;

    @Min(value = 0, message = "排序号不能小于0")
    private Integer sortOrder;

    private String status;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

