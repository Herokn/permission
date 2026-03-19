package com.permission.biz.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * SSO 登录请求 DTO
 */
@Data
@Schema(description = "SSO登录请求")
public class SsoLoginDTO {

    @Schema(description = "SSO授权码（回调时传入）")
    private String code;

    @Schema(description = "回调地址", required = true)
    @NotBlank(message = "回调地址不能为空")
    private String redirectUri;
}
