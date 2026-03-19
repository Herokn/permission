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

        String cacheKey = SESSION_CACHE_PREFIX + sessionId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if ("1".equals(cached)) {
            return true;
        }

        LoginSessionDO session = loginSessionService.getBySessionId(sessionId);
        if (session == null || !STATUS_ACTIVE.equals(session.getStatus())) {
            return false;
        }

        if (session.getExpiresAt() != null && session.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.debug("会话已过期: sessionId={}, expiresAt={}", sessionId, session.getExpiresAt());
            return false;
        }

        redisTemplate.opsForValue().set(cacheKey, "1", CACHE_TTL);
        return true;
    }

    public void evictCache(String sessionId) {
        if (sessionId != null && !sessionId.isEmpty()) {
            redisTemplate.delete(SESSION_CACHE_PREFIX + sessionId);
            log.debug("清除会话缓存: sessionId={}", sessionId);
        }
    }
}
