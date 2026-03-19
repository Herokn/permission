package com.permission.common.exception;

import lombok.Getter;

/**
 * 系统异常
 */
@Getter
public class SystemException extends RuntimeException {

    private final String errorCode;
    private final String errorMessage;

    public SystemException(String message) {
        super(message);
        this.errorCode = "500";
        this.errorMessage = message;
    }

    public SystemException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "500";
        this.errorMessage = message;
    }
}

