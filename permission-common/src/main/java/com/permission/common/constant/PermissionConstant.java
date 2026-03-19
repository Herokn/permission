package com.permission.common.constant;

/**
 * 全局常量
 */
public final class PermissionConstant {

    private PermissionConstant() {}

    /** 默认页码 */
    public static final int DEFAULT_PAGE_NUM = 1;

    /** 默认每页条数 */
    public static final int DEFAULT_PAGE_SIZE = 20;

    /** 最大每页条数 */
    public static final int MAX_PAGE_SIZE = 100;

    /** 逻辑删除：未删除 */
    public static final int NOT_DELETED = 0;

    /** 逻辑删除：已删除 */
    public static final int DELETED = 1;

    /** 用户ID请求头 */
    public static final String HEADER_USER_ID = "X-User-Id";

    /** 全局项目标识（projectId 为 null 时的替代值） */
    public static final String GLOBAL_PROJECT = "_GLOBAL_";
}

