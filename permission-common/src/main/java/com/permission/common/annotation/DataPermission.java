package com.permission.common.annotation;

import java.lang.annotation.*;

/**
 * 数据权限注解
 * 标注在 Controller 方法上，声明该接口需要进行数据权限校验
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataPermission {

    /**
     * 资源类型
     * 用于匹配数据权限规则中的 resourceType
     */
    String resourceType() default "";

    /**
     * 是否启用数据权限
     */
    boolean enabled() default true;
}
