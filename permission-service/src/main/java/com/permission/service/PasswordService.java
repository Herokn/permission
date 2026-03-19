package com.permission.service;

/**
 * 密码服务接口
 */
public interface PasswordService {

    /**
     * 加密密码
     *
     * @param rawPassword 原始密码
     * @return 加密后的密码
     */
    String encode(String rawPassword);

    /**
     * 校验密码
     *
     * @param rawPassword       原始密码
     * @param encodedPassword   加密后的密码
     * @return 是否匹配
     */
    boolean matches(String rawPassword, String encodedPassword);
}
