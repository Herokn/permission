package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 会话状态枚举
 */
@Getter
@AllArgsConstructor
public enum SessionStatusEnum {

    ACTIVE("ACTIVE", "有效"),
    EXPIRED("EXPIRED", "已过期"),
    REVOKED("REVOKED", "已撤销");

    private final String code;
    private final String desc;
}
