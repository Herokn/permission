package com.permission.common.config;

/**
 * 会话校验器接口
 * 用于解耦 common 模块和 service 模块
 */
public interface SessionValidator {

    /**
     * 校验会话是否有效
     *
     * @param sessionId 会话ID
     * @return true=会话有效，false=会话无效或已撤销
     */
    boolean isValid(String sessionId);
}
