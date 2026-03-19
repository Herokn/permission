package com.permission.biz.vo.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 登录响应 VO
 */
@Data
@Schema(description = "登录响应")
public class LoginVO {

    @Schema(description = "会话ID")
    private String sessionId;

    @Schema(description = "Access Token")
    private String accessToken;

    @Schema(description = "Refresh Token")
    private String refreshToken;

    @Schema(description = "Access Token 过期时间戳（秒）")
    private Long expiresAt;

    @Schema(description = "Refresh Token 过期时间戳（秒）")
    private Long refreshExpiresAt;

    @Schema(description = "用户信息")
    private UserInfoVO userInfo;
}
