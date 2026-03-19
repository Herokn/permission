package com.permission.biz.dto.authz;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 单鉴权 DTO
 */
@Data
public class AuthzCheckDTO {

    @NotBlank(message = "用户ID不能为空")
    private String userId;

    @NotBlank(message = "权限编码不能为空")
    private String permissionCode;

    private String projectId;

    /** 是否返回鉴权原因，默认 false */
    private Boolean explain;
}

