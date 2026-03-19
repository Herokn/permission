package com.permission.biz.dto.organization;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建组织 DTO
 */
@Data
public class CreateOrganizationDTO {

    @NotBlank(message = "组织编码不能为空")
    @Pattern(regexp = "^[A-Z][A-Z0-9_]{1,63}$", message = "组织编码格式不正确，需以大写字母开头，仅含大写字母、数字、下划线")
    private String code;

    @NotBlank(message = "组织名称不能为空")
    @Size(max = 128, message = "组织名称长度不能超过128")
    private String name;

    private Long parentId;

    @Min(value = 0, message = "排序号不能小于0")
    private Integer sortOrder;

    @Size(max = 256, message = "描述长度不能超过256")
    private String description;
}

