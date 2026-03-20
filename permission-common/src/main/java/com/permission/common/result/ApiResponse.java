package com.permission.common.result;

import lombok.Data;

/**
 * 统一响应体
 */
@Data
public final class ApiResponse<T> {

    private int code;
    private String message;
    private T data;

    private ApiResponse() { }

    private ApiResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data);
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(200, "success", null);
    }

    public static <T> ApiResponse<T> fail(String errorCode, String message) {
        return new ApiResponse<>(Integer.parseInt(errorCode), message, null);
    }

    public static <T> ApiResponse<T> systemError() {
        return new ApiResponse<>(500, "系统内部错误", null);
    }
}

