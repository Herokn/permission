package com.permission.common.context;

/**
 * 数据权限上下文持有者
 * 使用 ThreadLocal 在请求范围内传递数据权限信息
 */
public final class DataPermissionContextHolder {

    private DataPermissionContextHolder() {
        throw new UnsupportedOperationException("Utility class");
    }

    private static final ThreadLocal<DataPermissionContext> CONTEXT = new ThreadLocal<>();

    /**
     * 设置数据权限上下文
     */
    public static void setContext(DataPermissionContext context) {
        CONTEXT.set(context);
    }

    /**
     * 获取数据权限上下文
     */
    public static DataPermissionContext getContext() {
        return CONTEXT.get();
    }

    /**
     * 清除数据权限上下文
     */
    public static void clear() {
        CONTEXT.remove();
    }

    /**
     * 判断当前是否有数据权限上下文
     */
    public static boolean hasContext() {
        return CONTEXT.get() != null;
    }
}
