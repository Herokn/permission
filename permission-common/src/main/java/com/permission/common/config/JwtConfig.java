package com.permission.common.config;

import com.permission.common.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import java.util.Set;

/**
 * JWT 配置
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "auth.jwt")
public class JwtConfig {

    private static final int MIN_SECRET_LENGTH = 32;

    /**
     * 曾在配置模板中出现的弱/固定密钥（勿用于任何环境）。
     */
    private static final Set<String> FORBIDDEN_SECRETS = Set.of(
            "permission-center-default-jwt-secret-key-2024",
            "your-jwt-secret-at-least-32-characters-long"
    );

    private String secret;

    private long accessTokenExpire = 7200000;

    private long refreshTokenExpire = 604800000;

    private String issuer = "permission-center";

    @PostConstruct
    public void validateConfig() {
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException(
                    "JWT secret must be configured via environment variable JWT_SECRET or property auth.jwt.secret "
                            + "(local dev: activate profile 'dev' in application-dev.yml or export JWT_SECRET)");
        }
        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException("JWT secret must be at least " + MIN_SECRET_LENGTH
                    + " characters, current: " + secret.length());
        }
        String trimmed = secret.trim();
        for (String bad : FORBIDDEN_SECRETS) {
            if (bad.equalsIgnoreCase(trimmed)) {
                throw new IllegalStateException(
                        "JWT secret matches a known weak/default value; set a unique JWT_SECRET");
            }
        }
        log.info("JWT configuration validated, secret length: {}", secret.length());
    }

    @Bean
    public JwtUtil jwtUtil() {
        return new JwtUtil(secret, issuer, accessTokenExpire, refreshTokenExpire);
    }
}
