package com.permission.service.dto;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 会话缓存 DTO（用于 Redis 存储）
 */
@Data
public class SessionCacheDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 会话ID */
    private String sessionId;

    /** 用户ID */
    private String userId;

    /** 用户名 */
    private String userName;

    /** 登录类型：PASSWORD/SSO */
    private String loginType;

    /** Access Token */
    private String accessToken;

    /** Refresh Token */
    private String refreshToken;

    /** Access Token 过期时间 */
    private LocalDateTime expiresAt;

    /** Refresh Token 过期时间 */
    private LocalDateTime refreshExpiresAt;

    /** 登录IP */
    private String loginIp;

    /** 状态：ACTIVE/REVOKED */
    private String status;

    /** 创建时间 */
    private LocalDateTime gmtCreate;
}
