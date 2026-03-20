package com.permission.common.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 权限相关配置
 */
@Slf4j
@Data
@Component
@ConfigurationProperties(prefix = "permission")
public class PermissionConfig {

    /**
     * 超级管理员用户ID列表（逗号分隔）
     */
    private String superAdmins = "sys_admin,admin";

    /**
     * 组织层级最大深度，防止循环引用导致无限递归
     * 大型企业可能需要调整此值
     */
    private int orgMaxDepth = 20;

    /**
     * 解析后的超级管理员集合：含 sys_{login} 与历史 JWT sub=admin 兼容
     */
    private Set<String> superAdminSet = Set.of("sys_admin", "admin");

    public int getOrgMaxDepth() {
        return orgMaxDepth;
    }

    public void setOrgMaxDepth(int orgMaxDepth) {
        this.orgMaxDepth = orgMaxDepth;
    }

    public void setSuperAdmins(String superAdmins) {
        this.superAdmins = superAdmins;
        // 解析逗号分隔的字符串为 Set
        this.superAdminSet = Arrays.stream(superAdmins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    /**
     * 判断用户是否为超级管理员
     */
    public boolean isSuperAdmin(String userId) {
        return superAdminSet.contains(userId);
    }

    /**
     * 获取超级管理员集合
     */
    public Set<String> getSuperAdminSet() {
        return Set.copyOf(superAdminSet);
    }

    @PostConstruct
    public void logConfig() {
        log.info("权限配置初始化: 组织最大层级深度={}, 超级管理员={}", orgMaxDepth, superAdminSet);
    }
}
