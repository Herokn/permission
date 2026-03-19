package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 登录类型枚举
 */
@Getter
@AllArgsConstructor
public enum LoginTypeEnum {

    PASSWORD("PASSWORD", "账号密码登录"),
    SSO("SSO", "SSO单点登录");

    private final String code;
    private final String desc;
}
