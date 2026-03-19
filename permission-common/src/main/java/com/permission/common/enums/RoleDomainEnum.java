package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 角色域枚举
 */
@Getter
@AllArgsConstructor
public enum RoleDomainEnum {

    APP("APP", "业务角色"),
    PERM_CENTER("PERM_CENTER", "权限中心管理角色");

    private final String code;
    private final String desc;

    public static RoleDomainEnum fromCode(String code) {
        for (RoleDomainEnum e : values()) {
            if (e.code.equals(code)) {
                return e;
            }
        }
        throw new IllegalArgumentException("无效的角色域: " + code);
    }
}

