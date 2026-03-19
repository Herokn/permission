package com.permission.web.aspect;

import com.permission.common.annotation.RequirePermission;
import com.permission.common.config.PermissionConfig;
import com.permission.common.context.UserContextHolder;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.service.AuthzService;
import com.permission.service.model.AuthzResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

@Slf4j
@Aspect
@Component
@Order(1)
@RequiredArgsConstructor
public class RequirePermissionAspect {

    private final AuthzService authzService;
    private final PermissionConfig permissionConfig;

    @Around("@annotation(requirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, RequirePermission requirePermission) throws Throwable {
        String userId = UserContextHolder.getUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.AUTH_NOT_LOGIN);
        }

        if (permissionConfig.isSuperAdmin(userId)) {
            log.debug("超级管理员跳过权限校验: userId={}", userId);
            return joinPoint.proceed();
        }

        String permissionCode = requirePermission.value();
        String projectId = resolveProjectId(joinPoint, requirePermission.projectId());

        AuthzResult result = authzService.check(userId, permissionCode, projectId);
        if (!result.isAllowed()) {
            log.warn("权限校验失败: userId={}, permissionCode={}, projectId={}, reason={}",
                    userId, permissionCode, projectId, result.getReason());
            // 对外不暴露详细原因，防止信息泄露
            throw new BusinessException(ErrorCode.AUTH_FORBIDDEN, "无权访问此资源");
        }

        return joinPoint.proceed();
    }

    private String resolveProjectId(ProceedingJoinPoint joinPoint, String paramRef) {
        if (paramRef.isEmpty()) {
            return null;
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Parameter[] parameters = method.getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < parameters.length; i++) {
            if (parameters[i].getName().equals(paramRef)) {
                return args[i] != null ? String.valueOf(args[i]) : null;
            }
        }
        return null;
    }
}
