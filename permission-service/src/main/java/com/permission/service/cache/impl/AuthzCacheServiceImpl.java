package com.permission.service.cache.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.permission.service.AuthzService;
import com.permission.service.cache.AuthzCacheService;
import com.permission.service.model.AuthzResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 鉴权缓存实现（Redis）
 */
@Slf4j
@Service
public class AuthzCacheServiceImpl implements AuthzCacheService {

    private static final String CACHE_PREFIX = "authz:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);
    private static final int SCAN_COUNT = 1000;

    private final StringRedisTemplate redisTemplate;
    private final AuthzService authzService;
    private final ObjectMapper objectMapper;

    public AuthzCacheServiceImpl(StringRedisTemplate redisTemplate,
                                  AuthzService authzService) {
        this.redisTemplate = redisTemplate;
        this.authzService = authzService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 空值标记，用于防止缓存穿透
     * 当用户无权限时缓存此标记，避免重复查询 DB
     */
    private static final String NULL_CACHE_MARKER = "__NULL__";
    private static final Duration NULL_CACHE_TTL = Duration.ofMinutes(1);

    @Override
    public AuthzResult checkWithCache(String userId, String permissionCode, String projectId) {
        String key = buildKey(userId, permissionCode, projectId);

        String cached = redisTemplate.opsForValue().get(key);
        if (cached != null) {
            // 空值标记处理：返回默认拒绝（防止缓存穿透）
            if (NULL_CACHE_MARKER.equals(cached)) {
                return AuthzResult.denied("缓存空值：无权限");
            }
            try {
                CacheEntry entry = objectMapper.readValue(cached, CacheEntry.class);
                return entry.allowed ? AuthzResult.allowed(entry.reason) : AuthzResult.denied(entry.reason);
            } catch (JsonProcessingException e) {
                log.warn("反序列化鉴权缓存失败, key={}", key, e);
                redisTemplate.delete(key);
            }
        }

        AuthzResult result = authzService.check(userId, permissionCode, projectId);

        try {
            // 空值保护：对拒绝结果缓存空值标记，防止缓存穿透
            if (!result.isAllowed()) {
                redisTemplate.opsForValue().set(key, NULL_CACHE_MARKER, NULL_CACHE_TTL);
            } else {
                CacheEntry entry = new CacheEntry(result.isAllowed(), result.getReason());
                String json = objectMapper.writeValueAsString(entry);
                redisTemplate.opsForValue().set(key, json, CACHE_TTL);
            }
        } catch (JsonProcessingException e) {
            log.warn("序列化鉴权缓存失败, key={}", key, e);
        }

        return result;
    }

    @Override
    public Map<String, AuthzResult> checkBatchWithCache(String userId, List<String> permissionCodes, String projectId) {
        if (permissionCodes == null || permissionCodes.isEmpty()) {
            return Map.of();
        }

        // 1. 批量构建缓存key
        List<String> keys = permissionCodes.stream()
                .map(code -> buildKey(userId, code, projectId))
                .collect(Collectors.toList());

        // 2. 批量从Redis获取缓存
        List<String> cachedValues = redisTemplate.opsForValue().multiGet(keys);
        Map<String, AuthzResult> results = new LinkedHashMap<>(permissionCodes.size());
        Set<Integer> missedIndices = new HashSet<>();

        for (int i = 0; i < permissionCodes.size(); i++) {
            String permissionCode = permissionCodes.get(i);
            String cached = cachedValues != null ? cachedValues.get(i) : null;

            if (cached != null) {
                if (NULL_CACHE_MARKER.equals(cached)) {
                    results.put(permissionCode, AuthzResult.denied("缓存空值：无权限"));
                } else {
                    try {
                        CacheEntry entry = objectMapper.readValue(cached, CacheEntry.class);
                        results.put(permissionCode,
                                entry.allowed ? AuthzResult.allowed(entry.reason)
                                        : AuthzResult.denied(entry.reason));
                    } catch (JsonProcessingException e) {
                        log.warn("反序列化鉴权缓存失败, userId={}, permissionCode={}", userId, permissionCode, e);
                        missedIndices.add(i);
                    }
                }
            } else {
                missedIndices.add(i);
            }
        }

        // 3. 对于缓存未命中的，批量调用AuthzService
        if (!missedIndices.isEmpty()) {
            for (int i : missedIndices) {
                String permissionCode = permissionCodes.get(i);
                AuthzResult result = authzService.check(userId, permissionCode, projectId);
                results.put(permissionCode, result);

                // 回填缓存
                String key = buildKey(userId, permissionCode, projectId);
                try {
                    if (!result.isAllowed()) {
                        redisTemplate.opsForValue().set(key, NULL_CACHE_MARKER, NULL_CACHE_TTL);
                    } else {
                        CacheEntry entry = new CacheEntry(result.isAllowed(), result.getReason());
                        String json = objectMapper.writeValueAsString(entry);
                        redisTemplate.opsForValue().set(key, json, CACHE_TTL);
                    }
                } catch (JsonProcessingException e) {
                    log.warn("序列化鉴权缓存失败, userId={}, permissionCode={}", userId, permissionCode, e);
                }
            }
        }

        return results;
    }

    @Override
    public void evictUser(String userId) {
        String pattern = CACHE_PREFIX + userId + ":*";
        Set<String> keys = scanKeys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.debug("清除用户 {} 的鉴权缓存，共 {} 条", userId, keys.size());
        }
    }

    @Override
    public void evictUsers(List<String> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        Set<String> allKeys = new HashSet<>();
        for (String userId : userIds) {
            String pattern = CACHE_PREFIX + userId + ":*";
            allKeys.addAll(scanKeys(pattern));
        }
        if (!allKeys.isEmpty()) {
            redisTemplate.delete(allKeys);
            log.debug("批量清除 {} 个用户的鉴权缓存，共 {} 条", userIds.size(), allKeys.size());
        }
    }

    @Override
    public void evictPermission(String permissionCode) {
        String pattern = CACHE_PREFIX + "*:" + permissionCode + ":*";
        Set<String> keys = scanKeys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.debug("清除权限 {} 相关的鉴权缓存，共 {} 条", permissionCode, keys.size());
        }
    }

    @Override
    public void evictAll() {
        String pattern = CACHE_PREFIX + "*";
        Set<String> keys = scanKeys(pattern);
        if (!keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.debug("清除所有鉴权缓存，共 {} 条", keys.size());
        }
    }

    private Set<String> scanKeys(String pattern) {
        Set<String> keys = new HashSet<>();
        try (Cursor<String> cursor = redisTemplate.scan(ScanOptions.scanOptions()
                .match(pattern)
                .count(SCAN_COUNT)
                .build())) {
            while (cursor.hasNext()) {
                keys.add(cursor.next());
            }
        } catch (Exception e) {
            log.error("SCAN 扫描 Redis key 失败, pattern={}", pattern, e);
        }
        return keys;
    }

    private String buildKey(String userId, String permissionCode, String projectId) {
        return CACHE_PREFIX + userId + ":" + permissionCode + ":" + (projectId == null ? "_GLOBAL_" : projectId);
    }

    private static class CacheEntry {
        private boolean allowed;
        private String reason;

        CacheEntry() { }

        CacheEntry(boolean allowed, String reason) {
            this.allowed = allowed;
            this.reason = reason;
        }

        public boolean isAllowed() {
            return allowed;
        }

        public String getReason() {
            return reason;
        }
    }
}

