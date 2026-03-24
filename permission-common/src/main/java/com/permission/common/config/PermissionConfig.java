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
     * SSO 回调地址白名单（逗号分隔），防止开放重定向攻击
     * 支持精确匹配和域名匹配，如：http://localhost:3000,https://example.com
     */
    private String ssoRedirectWhitelist = "http://localhost:3000,http://localhost:5173";

    /**
     * 解析后的超级管理员集合：含 sys_{login} 与历史 JWT sub=admin 兼容
     */
    private Set<String> superAdminSet = Set.of("sys_admin", "admin");

    /**
     * 解析后的SSO白名单集合
     */
    private Set<String> ssoRedirectWhitelistSet;

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

    public void setSsoRedirectWhitelist(String ssoRedirectWhitelist) {
        this.ssoRedirectWhitelist = ssoRedirectWhitelist;
        // 解析逗号分隔的字符串为 Set
        this.ssoRedirectWhitelistSet = Arrays.stream(ssoRedirectWhitelist.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }

    /**
     * 判断SSO回调地址是否在白名单中
     */
    public boolean isSsoRedirectAllowed(String redirectUri) {
        if (redirectUri == null || redirectUri.isEmpty()) {
            return false;
        }
        // 精确匹配
        if (ssoRedirectWhitelistSet.contains(redirectUri)) {
            return true;
        }
        // 域名匹配：检查是否以白名单中的某个域名为前缀
        for (String allowed : ssoRedirectWhitelistSet) {
            if (redirectUri.startsWith(allowed)) {
                // 确保后面是斜杠、问号或结束，防止部分匹配漏洞
                char nextChar = redirectUri.charAt(allowed.length());
                return nextChar == '/' || nextChar == '?' || nextChar == '#';
            }
        }
        return false;
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
        log.info("权限配置初始化: 组织最大层级深度={}, 超级管理员={}, SSO白名单={}",
                orgMaxDepth, superAdminSet, ssoRedirectWhitelistSet);
    }
}
