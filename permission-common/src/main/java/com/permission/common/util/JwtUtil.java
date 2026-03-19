package com.permission.common.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 工具类
 */
@Slf4j
public class JwtUtil {

    private static final String TOKEN_TYPE = "type";
    private static final String SESSION_ID = "sid";
    private static final String ACCESS_TYPE = "access";
    private static final String REFRESH_TYPE = "refresh";

    private final SecretKey secretKey;
    private final String issuer;
    private final long accessTokenExpireMillis;
    private final long refreshTokenExpireMillis;

    public JwtUtil(String secret, String issuer, long accessTokenExpireMillis, long refreshTokenExpireMillis) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.issuer = issuer;
        this.accessTokenExpireMillis = accessTokenExpireMillis;
        this.refreshTokenExpireMillis = refreshTokenExpireMillis;
    }

    /**
     * 生成 Access Token
     *
     * @param userId    用户ID
     * @param sessionId 会话ID
     * @param expiresAt 过期时间（毫秒时间戳）
     * @return Access Token
     */
    public String generateAccessToken(String userId, String sessionId, long expiresAt) {
        return Jwts.builder()
                .subject(userId)
                .claim(TOKEN_TYPE, ACCESS_TYPE)
                .claim(SESSION_ID, sessionId)
                .issuer(issuer)
                .issuedAt(new Date())
                .expiration(new Date(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 生成 Refresh Token
     *
     * @param userId    用户ID
     * @param sessionId 会话ID
     * @param expiresAt 过期时间（毫秒时间戳）
     * @return Refresh Token
     */
    public String generateRefreshToken(String userId, String sessionId, long expiresAt) {
        return Jwts.builder()
                .subject(userId)
                .claim(TOKEN_TYPE, REFRESH_TYPE)
                .claim(SESSION_ID, sessionId)
                .issuer(issuer)
                .issuedAt(new Date())
                .expiration(new Date(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 解析 Token
     *
     * @param token JWT Token
     * @return Claims
     */
    public Claims parseToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("Token已过期: {}", e.getMessage());
            return null;
        } catch (JwtException e) {
            log.warn("Token解析失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 验证 Token 是否有效
     *
     * @param token JWT Token
     * @return 是否有效
     */
    public boolean validateToken(String token) {
        return parseToken(token) != null;
    }

    /**
     * 从 Token 中获取用户ID
     *
     * @param token JWT Token
     * @return 用户ID
     */
    public String getUserId(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    /**
     * 从 Token 中获取会话ID
     *
     * @param token JWT Token
     * @return 会话ID
     */
    public String getSessionId(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.get(SESSION_ID, String.class) : null;
    }

    /**
     * 检查是否是 Access Token
     *
     * @param token JWT Token
     * @return 是否是 Access Token
     */
    public boolean isAccessToken(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return false;
        }
        return ACCESS_TYPE.equals(claims.get(TOKEN_TYPE, String.class));
    }

    /**
     * 检查是否是 Refresh Token
     *
     * @param token JWT Token
     * @return 是否是 Refresh Token
     */
    public boolean isRefreshToken(String token) {
        Claims claims = parseToken(token);
        if (claims == null) {
            return false;
        }
        return REFRESH_TYPE.equals(claims.get(TOKEN_TYPE, String.class));
    }

    /**
     * 获取 Token 过期时间（毫秒时间戳）
     *
     * @param token JWT Token
     * @return 过期时间，如果无效返回 null
     */
    public Long getExpiration(String token) {
        Claims claims = parseToken(token);
        return claims != null ? claims.getExpiration().getTime() : null;
    }

    /**
     * 获取默认 Access Token 过期时间（毫秒）
     */
    public long getDefaultAccessTokenExpireMillis() {
        return accessTokenExpireMillis;
    }

    /**
     * 获取默认 Refresh Token 过期时间（毫秒）
     */
    public long getDefaultRefreshTokenExpireMillis() {
        return refreshTokenExpireMillis;
    }
}
