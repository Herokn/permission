package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 角色范围枚举
 */
@Getter
@AllArgsConstructor
public enum RoleScopeEnum {

    GLOBAL("GLOBAL", "全局角色"),
    PROJECT("PROJECT", "项目角色");

    private final String code;
    private final String desc;

    public static RoleScopeEnum fromCode(String code) {
        for (RoleScopeEnum e : values()) {
            if (e.code.equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("无效的角色范围: " + code);
    }
}

