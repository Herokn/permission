package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 通用状态枚举
 */
@Getter
@AllArgsConstructor
public enum CommonStatusEnum {

    ENABLED("ENABLED", "启用"),
    DISABLED("DISABLED", "禁用");

    private final String code;
    private final String desc;

    public static CommonStatusEnum fromCode(String code) {
        for (CommonStatusEnum e : values()) {
            if (e.code.equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("无效的状态: " + code);
    }
}

