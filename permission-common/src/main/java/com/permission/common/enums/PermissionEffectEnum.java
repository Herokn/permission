package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 权限效果枚举
 */
@Getter
@AllArgsConstructor
public enum PermissionEffectEnum {

    ALLOW("ALLOW", "授予"),
    DENY("DENY", "排除");

    private final String code;
    private final String desc;

    public static PermissionEffectEnum fromCode(String code) {
        for (PermissionEffectEnum e : values()) {
            if (e.code.equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("无效的权限效果: " + code);
    }
}

