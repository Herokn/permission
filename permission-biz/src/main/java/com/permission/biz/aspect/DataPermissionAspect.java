package com.permission.biz.aspect;

import com.permission.common.annotation.DataPermission;
import com.permission.common.context.DataPermissionContext;
import com.permission.common.context.DataPermissionContextHolder;
import com.permission.common.context.UserContextHolder;
import com.permission.common.context.UserInfoDTO;
import com.permission.common.enums.DataScopeTypeEnum;
import com.permission.dal.dataobject.DataPermissionRuleDO;
import com.permission.dal.dataobject.UserOrgDO;
import com.permission.service.DataPermissionRuleService;
import com.permission.service.UserOrgService;
import com.permission.service.UserRoleService;
import com.permission.dal.dataobject.UserRoleDO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 数据权限切面
 * 拦截标注了 @DataPermission 的方法，自动注入数据权限上下文
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class DataPermissionAspect {

    private final DataPermissionRuleService dataPermissionRuleService;
    private final UserRoleService userRoleService;
    private final UserOrgService userOrgService;

    @Around("@annotation(dataPermission)")
    public Object around(ProceedingJoinPoint pjp, DataPermission dataPermission) throws Throwable {
        if (!dataPermission.enabled()) {
            return pjp.proceed();
        }

        String resourceType = dataPermission.resourceType();
        if (resourceType.isEmpty()) {
            // 尝试从方法名推断资源类型
            MethodSignature signature = (MethodSignature) pjp.getSignature();
            String methodName = signature.getMethod().getName();
            resourceType = inferResourceType(methodName);
        }

        try {
            // 构建数据权限上下文
            DataPermissionContext context = buildContext(resourceType);
            DataPermissionContextHolder.setContext(context);

            return pjp.proceed();
        } finally {
            DataPermissionContextHolder.clear();
        }
    }

    /**
     * 构建数据权限上下文
     */
    private DataPermissionContext buildContext(String resourceType) {
        DataPermissionContext context = new DataPermissionContext();
        context.setResourceType(resourceType);

        // 获取当前用户信息
        UserInfoDTO user = UserContextHolder.getUser();
        if (user == null) {
            // 未登录用户，默认无权限
            context.setScopeType(DataScopeTypeEnum.SELF);
            return context;
        }

        context.setUserId(user.getUserId());

        // 获取用户的角色列表
        List<UserRoleDO> userRoles = userRoleService.listByUserId(user.getUserId());
        if (userRoles.isEmpty()) {
            context.setScopeType(DataScopeTypeEnum.SELF);
            return context;
        }

        // 获取角色ID列表
        List<Long> roleIds = userRoles.stream()
                .map(UserRoleDO::getRoleId)
                .collect(Collectors.toList());

        // 查询数据权限规则
        List<DataPermissionRuleDO> rules = dataPermissionRuleService.listByRoleIds(roleIds);
        if (rules.isEmpty()) {
            // 无数据权限规则，默认只能看自己的数据
            context.setScopeType(DataScopeTypeEnum.SELF);
            return context;
        }

        // 查找匹配当前资源类型的规则，优先级：ALL > CUSTOM > DEPARTMENT > SELF
        DataPermissionRuleDO matchedRule = findBestRule(rules, resourceType);
        if (matchedRule != null) {
            context.setScopeType(DataScopeTypeEnum.fromCode(matchedRule.getScopeType()));
            if (matchedRule.getScopeValue() != null) {
                context.setScopeValues(parseScopeValue(matchedRule.getScopeValue()));
            }
        } else {
            context.setScopeType(DataScopeTypeEnum.SELF);
        }

        // 获取用户所属组织
        List<UserOrgDO> userOrgs = userOrgService.listByUserId(user.getUserId());
        context.setUserOrgIds(userOrgs.stream()
                .map(UserOrgDO::getOrgId)
                .collect(Collectors.toList()));

        return context;
    }

    /**
     * 查找最佳匹配规则
     * 优先级：ALL > CUSTOM > DEPARTMENT > SELF
     */
    private DataPermissionRuleDO findBestRule(List<DataPermissionRuleDO> rules, String resourceType) {
        // 先找精确匹配资源类型的规则
        List<DataPermissionRuleDO> matchedRules = rules.stream()
                .filter(r -> resourceType.equals(r.getResourceType()))
                .collect(Collectors.toList());

        if (matchedRules.isEmpty()) {
            return null;
        }

        // 按优先级排序
        Map<String, Integer> priority = Map.of(
                "ALL", 4,
                "CUSTOM", 3,
                "DEPARTMENT", 2,
                "DEPARTMENT_AND_SUB", 2,
                "SELF", 1
        );

        return matchedRules.stream()
                .max(Comparator.comparingInt(r -> priority.getOrDefault(r.getScopeType(), 0)))
                .orElse(null);
    }

    /**
     * 解析范围值
     */
    private Set<String> parseScopeValue(String scopeValue) {
        if (scopeValue == null || scopeValue.isEmpty()) {
            return Collections.emptySet();
        }
        // JSON 数组格式: ["1", "2", "3"]
        String values = scopeValue.replace("[", "").replace("]", "").replace("\"", "");
        return Arrays.stream(values.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    /**
     * 从方法名推断资源类型
     */
    private String inferResourceType(String methodName) {
        // 简单实现：list* -> List, get* -> Get 等
        // 实际项目中可以结合 Controller 类名推断
        return "DEFAULT";
    }
}
