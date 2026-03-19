package com.permission.biz.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.permission.common.annotation.AuditLog;
import com.permission.common.constant.PermissionConstant;
import com.permission.dal.dataobject.AuditLogDO;
import com.permission.dal.mapper.AuditLogMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 审计日志 AOP 切面
 * 拦截标注了 @AuditLog 的 Manager 方法，自动记录操作日志
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogMapper auditLogMapper;
    private final ObjectMapper objectMapper;

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
            auditLogMapper.insert(logDO);
        } catch (Exception e) {
            // 审计日志记录失败不影响业务
            log.warn("审计日志记录失败: {}", e.getMessage());
        }

        return result;
    }

    /**
     * 从请求头 X-User-Id 获取操作人
     */
    private String extractOperator() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String userId = request.getHeader(PermissionConstant.HEADER_USER_ID);
                return userId != null ? userId : "SYSTEM";
            }
        } catch (Exception e) {
            log.debug("获取操作人失败", e);
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
            // DTO 对象，尝试获取第一个参数的字符串表示
            try {
                return objectMapper.writeValueAsString(firstArg).substring(0,
                        Math.min(128, objectMapper.writeValueAsString(firstArg).length()));
            } catch (Exception e) {
                return firstArg.toString();
            }
        }
        return "unknown";
    }

    /**
     * 构建操作详情
     */
    private String buildDetail(ProceedingJoinPoint pjp) {
        try {
            Object[] args = pjp.getArgs();
            String methodName = pjp.getSignature().getName();
            String argsJson = objectMapper.writeValueAsString(args);
            // 限制长度
            if (argsJson.length() > 2000) {
                argsJson = argsJson.substring(0, 2000) + "...";
            }
            return String.format("{\"method\":\"%s\",\"args\":%s}", methodName, argsJson);
        } catch (Exception e) {
            return null;
        }
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
                // 多个代理时取第一个
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

