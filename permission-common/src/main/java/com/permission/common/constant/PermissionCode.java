package com.permission.common.constant;

/**
 * 权限编码常量
 */
public final class PermissionCode {

    private PermissionCode() {}

    /**
     * 权限中心管理权限
     * 用于判断是否为超级管理员，可在鉴权接口中查询任意用户权限
     */
    public static final String PERM_CENTER_MANAGE = "PERM_CENTER_MANAGE";

    /**
     * 用户管理权限
     */
    public static final String USER_MANAGE = "USER_MANAGE";

    /**
     * 角色管理权限
     */
    public static final String ROLE_MANAGE = "ROLE_MANAGE";

    /**
     * 权限管理权限
     */
    public static final String PERMISSION_MANAGE = "PERMISSION_MANAGE";

    /**
     * 组织管理权限
     */
    public static final String ORG_MANAGE = "ORG_MANAGE";

    /**
     * 项目管理权限
     */
    public static final String PROJECT_MANAGE = "PROJECT_MANAGE";
}
