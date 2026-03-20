package com.permission.service.impl;

import com.permission.common.config.SessionValidator;
import com.permission.dal.dataobject.LoginSessionDO;
import com.permission.service.LoginSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 会话验证器实现
 * 支持降级：Redis 异常时直接查询数据库，避免因 Redis 故障导致所有请求失败
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionValidatorImpl implements SessionValidator {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String SESSION_CACHE_PREFIX = "session:valid:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(30);

    private final LoginSessionService loginSessionService;
    private final StringRedisTemplate redisTemplate;

    @Override
    public boolean isValid(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return false;
        }

        // 优先从 Redis 缓存读取
        String cacheKey = SESSION_CACHE_PREFIX + sessionId;
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if ("1".equals(cached)) {
                return true;
            }
        } catch (Exception e) {
            // Redis 读取失败，降级到数据库查询
            log.warn("Redis 缓存读取失败，降级到数据库验证: sessionId={}, error={}", sessionId, e.getMessage());
        }

        // 从数据库查询会话状态
        LoginSessionDO session = loginSessionService.getBySessionId(sessionId);
        if (session == null || !STATUS_ACTIVE.equals(session.getStatus())) {
            return false;
        }

        if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.debug("会话已过期: sessionId={}, expiresAt={}", sessionId, session.getExpiresAt());
            return false;
        }

        // 会话有效，异步更新 Redis 缓存（失败不影响主流程）
        try {
            redisTemplate.opsForValue().set(cacheKey, "1", CACHE_TTL);
        } catch (Exception e) {
            log.warn("Redis 缓存写入失败，不影响验证结果: sessionId={}, error={}", sessionId, e.getMessage());
        }
        return true;
    }

    public void evictCache(String sessionId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            try {
                redisTemplate.delete(SESSION_CACHE_PREFIX + sessionId);
                log.debug("清除会话缓存: sessionId={}", sessionId);
            } catch (Exception e) {
                log.warn("Redis 缓存删除失败: sessionId={}, error={}", sessionId, e.getMessage());
            }
        }
    }
}
