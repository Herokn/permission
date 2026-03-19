package com.permission.common.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 数据权限范围类型枚举
 */
@Getter
@AllArgsConstructor
public enum DataScopeTypeEnum {

    ALL("ALL", "全部数据"),
    DEPARTMENT("DEPARTMENT", "本部门数据"),
    DEPARTMENT_AND_SUB("DEPARTMENT_AND_SUB", "本部门及子部门数据"),
    SELF("SELF", "仅本人数据"),
    CUSTOM("CUSTOM", "自定义范围");

    private final String code;
    private final String desc;

    public static DataScopeTypeEnum fromCode(String code) {
        for (DataScopeTypeEnum value : values()) {
            if (value.getCode().equals(code)) {
                return value;
            }
        }
        throw new IllegalArgumentException("Invalid DataScopeType: " + code);
    }
}
