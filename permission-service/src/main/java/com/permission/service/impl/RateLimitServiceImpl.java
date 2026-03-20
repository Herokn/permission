package com.permission.service.impl;

import com.permission.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 基于 Redis 的限流服务实现（滑动窗口）；Redis 不可用时降级为进程内计数，避免登录完全不可用。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitServiceImpl implements RateLimitService {

    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "rate_limit:login:";

    private static final class LocalWindow {
        final long windowStartMs;
        final AtomicInteger count = new AtomicInteger(0);

        LocalWindow(long windowStartMs) {
            this.windowStartMs = windowStartMs;
        }
    }

    private final ConcurrentHashMap<String, LocalWindow> localWindows = new ConcurrentHashMap<>();
    private final Object localFallbackLock = new Object();

    @Override
    public boolean allowLogin(String key, int maxAttempts, int windowSeconds) {
        try {
            return allowLoginRedis(key, maxAttempts, windowSeconds);
        } catch (Exception e) {
            log.warn("Redis rate limit unavailable, using in-process fallback: {}", e.toString());
            return allowLoginLocal(key, maxAttempts, windowSeconds);
        }
    }

    private boolean allowLoginRedis(String key, int maxAttempts, int windowSeconds) {
        String redisKey = PREFIX + key;
        String countStr = redisTemplate.opsForValue().get(redisKey);
        int count = countStr == null ? 0 : Integer.parseInt(countStr);

        if (count >= maxAttempts) {
            Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            log.warn("登录限流触发: key={}, count={}, remaining={}s", key, count, ttl);
            return false;
        }

        Long newCount = redisTemplate.opsForValue().increment(redisKey);
        if (newCount != null && newCount == 1) {
            redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
        }
        return true;
    }

    private boolean allowLoginLocal(String key, int maxAttempts, int windowSeconds) {
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;
        synchronized (localFallbackLock) {
            LocalWindow w = localWindows.get(key);
            if (w == null || now - w.windowStartMs >= windowMs) {
                w = new LocalWindow(now);
                w.count.set(1);
                localWindows.put(key, w);
                return true;
            }
            if (w.count.get() >= maxAttempts) {
                return false;
            }
            w.count.incrementAndGet();
            return true;
        }
    }

    @Override
    public long getRemainingTime(String key) {
        try {
            String redisKey = PREFIX + key;
            Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
            return ttl != null && ttl > 0 ? ttl : 0;
        } catch (Exception e) {
            log.debug("Redis getRemainingTime skip: {}", e.getMessage());
            return 0;
        }
    }

    @Override
    public void reset(String key) {
        try {
            redisTemplate.delete(PREFIX + key);
        } catch (Exception e) {
            log.debug("Redis reset skip: {}", e.getMessage());
        }
        synchronized (localFallbackLock) {
            localWindows.remove(key);
        }
    }
}
