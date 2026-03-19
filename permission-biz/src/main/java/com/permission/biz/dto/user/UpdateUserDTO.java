package com.permission.biz.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新用户DTO
 */
@Data
public class UpdateUserDTO {

    @Size(max = 128, message = "显示名称长度不能超过128")
    private String displayName;

    @Size(max = 128, message = "全名长度不能超过128")
    private String fullName;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String mobile;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String avatarUrl;

    private Long primaryOrgId;

    private Long positionId;

    private String employeeNo;
}
