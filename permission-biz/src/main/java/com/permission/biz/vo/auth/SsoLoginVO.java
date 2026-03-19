package com.permission.biz.vo.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * SSO登录响应 VO
 */
@Data
@Schema(description = "SSO登录响应")
public class SsoLoginVO {

    @Schema(description = "SSO授权URL（首次请求返回）")
    private String authUrl;

    @Schema(description = "登录结果（回调成功后返回）")
    private LoginVO loginResult;
}
