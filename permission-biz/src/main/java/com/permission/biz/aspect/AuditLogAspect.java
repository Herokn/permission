package com.permission.biz.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.permission.biz.audit.AuditLogRecorder;
import com.permission.common.annotation.AuditLog;
import com.permission.common.context.UserContextHolder;
import com.permission.dal.dataobject.AuditLogDO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Set;

/**
 * 审计日志 AOP 切面
 * 拦截标注了 @AuditLog 的 Manager 方法，自动记录操作日志
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogRecorder auditLogRecorder;
    private final ObjectMapper objectMapper;

    private static final Set<String> SENSITIVE_FIELDS = Set.of(
            "password", "newPassword", "oldPassword", "confirmPassword",
            "token", "accessToken", "refreshToken", "secret", "apiKey"
    );

    @Around("@annotation(auditLog)")
    public Object around(ProceedingJoinPoint pjp, AuditLog auditLog) throws Throwable {
        Object result = pjp.proceed();

        try {
            AuditLogDO logDO = new AuditLogDO();
            logDO.setOperator(extractOperator());
            logDO.setModule(auditLog.module());
            logDO.setAction(auditLog.action());
            logDO.setTargetType(auditLog.targetType());
            logDO.setTargetId(extractTargetId(pjp));
            logDO.setDetail(buildDetail(pjp));
            logDO.setIpAddress(getClientIp());
            // 异步落库，避免业务线程因连接池压力丢失审计时阻塞
            auditLogRecorder.persist(logDO);
        } catch (Exception e) {
            log.warn("审计日志入队失败: {}", e.getMessage());
        }

        return result;
    }

    /**
     * 从 UserContextHolder 获取操作人（更安全）
     */
    private String extractOperator() {
        try {
            String userId = UserContextHolder.getUserId();
            if (userId != null && !userId.isEmpty()) {
                return userId;
            }
        } catch (Exception e) {
            log.debug("从 UserContextHolder 获取操作人失败", e);
        }
        return "SYSTEM";
    }

    /**
     * 从方法参数中提取目标ID
     */
    private String extractTargetId(ProceedingJoinPoint pjp) {
        Object[] args = pjp.getArgs();
        if (args.length > 0) {
            Object firstArg = args[0];
            if (firstArg instanceof Long || firstArg instanceof String) {
                return String.valueOf(firstArg);
            }
            try {
                String json = maskSensitiveData(objectMapper.writeValueAsString(firstArg));
                return json.substring(0, Math.min(128, json.length()));
            } catch (Exception e) {
                return firstArg.toString();
            }
        }
        return "unknown";
    }

    /**
     * 构建操作详情（脱敏处理）
     */
    private String buildDetail(ProceedingJoinPoint pjp) {
        try {
            Object[] args = pjp.getArgs();
            String methodName = pjp.getSignature().getName();
            String argsJson = maskSensitiveData(objectMapper.writeValueAsString(args));
            if (argsJson.length() > 2000) {
                argsJson = argsJson.substring(0, 2000) + "...";
            }
            return String.format("{\"method\":\"%s\",\"args\":%s}", methodName, argsJson);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 脱敏敏感数据
     */
    private String maskSensitiveData(String json) {
        String result = json;
        for (String field : SENSITIVE_FIELDS) {
            result = result.replaceAll(
                    "(?i)(\"" + field + "\"\\s*:\\s*\")([^\"]*)(\")",
                    "$1******$3"
            );
        }
        return result;
    }

    /**
     * 获取客户端IP
     */
    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("X-Real-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                if (ip != null && ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        } catch (Exception e) {
            log.debug("获取客户端IP失败", e);
        }
        return null;
    }
}

