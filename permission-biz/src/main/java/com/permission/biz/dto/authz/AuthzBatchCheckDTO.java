package com.permission.biz.dto.authz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 批量鉴权 DTO
 */
@Data
public class AuthzBatchCheckDTO {

    @NotBlank(message = "用户ID不能为空")
    private String userId;

    @NotEmpty(message = "权限编码列表不能为空")
    private List<String> permissionCodes;

    private String projectId;
}

