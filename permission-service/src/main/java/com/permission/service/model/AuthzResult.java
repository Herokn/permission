package com.permission.service.model;

import lombok.Getter;

/**
 * 鉴权内部结果对象（Service 层使用，不对外暴露）
 */
@Getter
public final class AuthzResult {

    private final boolean allowed;
    private final String reason;

    private AuthzResult(boolean allowed, String reason) {
        this.allowed = allowed;
        this.reason = reason;
    }

    public static AuthzResult allowed(String reason) {
        return new AuthzResult(true, reason);
    }

    public static AuthzResult denied(String reason) {
        return new AuthzResult(false, reason);
    }
}

