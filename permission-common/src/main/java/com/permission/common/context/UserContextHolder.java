package com.permission.common.context;

import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;

/**
 * 用户上下文持有者
 * 使用 ThreadLocal 在请求范围内传递用户信息
 */
public class UserContextHolder {

    private UserContextHolder() {
        throw new UnsupportedOperationException("Utility class");
    }

    private static final ThreadLocal<UserInfoDTO> USER = new ThreadLocal<>();

    /**
     * 设置用户信息
     */
    public static void setUser(UserInfoDTO user) {
        USER.set(user);
    }

    /**
     * 获取用户信息
     */
    public static UserInfoDTO getUser() {
        return USER.get();
    }

    /**
     * 获取用户ID
     */
    public static String getUserId() {
        UserInfoDTO user = getUser();
        if (user == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return user.getUserId();
    }

    /**
     * 清除用户信息
     */
    public static void clear() {
        USER.remove();
    }

    /**
     * 判断当前是否有用户信息
     */
    public static boolean hasUser() {
        return USER.get() != null;
    }
}
