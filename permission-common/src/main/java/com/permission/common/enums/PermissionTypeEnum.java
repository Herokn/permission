package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 权限类型枚举
 */
@Getter
@AllArgsConstructor
public enum PermissionTypeEnum {

    MENU("MENU", "菜单"),
    PAGE("PAGE", "页面"),
    ACTION("ACTION", "操作");

    private final String code;
    private final String desc;

    public static PermissionTypeEnum fromCode(String code) {
        for (PermissionTypeEnum e : values()) {
            if (e.code.equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("无效的权限类型: " + code);
    }
}

