package com.permission.config;

import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.result.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("业务异常, errorCode={}, errorMessage={}", e.getErrorCode(), e.getErrorMessage());
        
        HttpStatus status = mapToHttpStatus(e.getErrorCode());
        return ResponseEntity.status(status).body(ApiResponse.fail(e.getErrorCode(), e.getErrorMessage()));
    }

    /**
     * 根据错误码映射 HTTP 状态码
     */
    private HttpStatus mapToHttpStatus(String errorCode) {
        if (errorCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        
        // 认证相关：144xxx, 143xxx -> 401，但用户禁用(143002)返回 403
        if (errorCode.startsWith("143") || errorCode.startsWith("144")) {
            if ("144003".equals(errorCode) || "143002".equals(errorCode)) {
                return HttpStatus.FORBIDDEN;  // AUTH_FORBIDDEN 或 USER_DISABLED -> 403
            }
            return HttpStatus.UNAUTHORIZED;  // 其他认证错误 -> 401
        }
        
        // 资源不存在：xxx001 或 xxx003 -> 404
        if (errorCode.endsWith("001") || errorCode.endsWith("003")) {
            return HttpStatus.NOT_FOUND;
        }
        
        // 唯一键冲突：xxx002 -> 409
        if (errorCode.endsWith("002")) {
            return HttpStatus.CONFLICT;
        }
        
        // 参数校验失败：141xxx -> 400
        if (errorCode.startsWith("141")) {
            return HttpStatus.BAD_REQUEST;
        }
        
        // 业务规则冲突（如存在引用、循环引用等）-> 409
        if (errorCode.endsWith("004") || errorCode.endsWith("005") || errorCode.endsWith("006") 
                || errorCode.endsWith("007") || errorCode.endsWith("013") || errorCode.endsWith("014")) {
            return HttpStatus.CONFLICT;
        }
        
        // 默认返回 400
        return HttpStatus.BAD_REQUEST;
    }

    /**
     * 参数校验异常（@RequestBody + @Valid）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return ResponseEntity.badRequest().body(ApiResponse.fail("400", message));
    }

    /**
     * 约束违反异常（@RequestParam + @Validated）
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(v -> v.getMessage())
                .collect(Collectors.joining(", "));
        log.warn("约束违反: {}", message);
        return ResponseEntity.badRequest().body(ApiResponse.fail("400", message));
    }

    /**
     * 数据库唯一键冲突（并发重复插入兜底）
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ApiResponse<Void>> handleDuplicateKeyException(DuplicateKeyException e) {
        log.warn("数据库唯一键冲突: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.fail("409", "数据已存在，请勿重复操作"));
    }

    /**
     * 数据库访问异常兜底
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataAccessException(DataAccessException e) {
        log.error("数据库访问异常", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.fail("500", "数据库操作异常，请稍后重试"));
    }

    /**
     * 系统异常兜底
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("系统异常", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.systemError());
    }
}

