package com.permission.common.config;

import com.permission.common.util.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

/**
 * JWT 配置
 */
@Slf4j
@Data
@Configuration
@ConfigurationProperties(prefix = "auth.jwt")
public class JwtConfig {

    private static final int MIN_SECRET_LENGTH = 32;

    private String secret;

    private long accessTokenExpire = 7200000;

    private long refreshTokenExpire = 604800000;

    private String issuer = "permission-center";

    @PostConstruct
    public void validateConfig() {
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException("JWT secret must be configured via environment variable JWT_SECRET or property auth.jwt.secret");
        }
        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException("JWT secret must be at least " + MIN_SECRET_LENGTH + " characters, current: " + secret.length());
        }
        log.info("JWT configuration validated, secret length: {}", secret.length());
    }

    @Bean
    public JwtUtil jwtUtil() {
        return new JwtUtil(secret, issuer, accessTokenExpire, refreshTokenExpire);
    }
}
