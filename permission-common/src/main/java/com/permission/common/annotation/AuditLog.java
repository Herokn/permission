package com.permission.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 审计日志注解
 * 标注在 Manager 层方法上，自动记录操作审计日志
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {

    /** 模块：PERMISSION / ROLE / USER_AUTH */
    String module();

    /** 操作：CREATE / UPDATE / DELETE / ASSIGN / REVOKE */
    String action();

    /** 目标类型：permission / role / user_role / user_permission */
    String targetType();

    /** 操作描述 */
    String description() default "";
}

