package com.permission.dal.dataobject;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 登录会话实体
 */
@Data
@TableName("login_session")
public class LoginSessionDO {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 会话ID（UUID） */
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

    /** 浏览器UA */
    private String userAgent;

    /** 状态：ACTIVE/EXPIRED/REVOKED */
    private String status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime gmtCreate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime gmtModified;

    @TableLogic
    private Integer deleted;
}
