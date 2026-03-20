package com.permission.biz.dto.user;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建用户DTO
 */
@Data
public class CreateUserDTO {

    @NotBlank(message = "登录账号不能为空")
    @Size(min = 3, max = 64, message = "登录账号长度为3-64")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z0-9_]{2,63}$", message = "登录账号须以字母开头，仅含字母数字下划线")
    private String loginAccount;

    /**
     * 可选；为空则服务端生成随机初始密码（6-64 位，由服务端校验）
     */
    @Size(max = 64, message = "密码长度不能超过64")
    private String password;

    @NotBlank(message = "显示名称不能为空")
    @Size(max = 128, message = "显示名称长度不能超过128")
    private String displayName;

    @Size(max = 128, message = "全名长度不能超过128")
    private String fullName;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String mobile;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String avatarUrl;

    @JsonAlias("orgId")
    private Long primaryOrgId;

    private Long positionId;

    private String employeeNo;
}
