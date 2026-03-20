package com.permission.service.impl;

import com.permission.common.enums.SessionStatusEnum;
import com.permission.dal.dataobject.LoginSessionDO;
import com.permission.dal.mapper.LoginSessionMapper;
import com.permission.service.LoginSessionService;
import com.permission.service.dto.SessionCacheDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 登录会话 Service 实现（Redis 缓存 + 数据库持久化）
 *
 * 存储策略：
 * 1. Redis：存储活跃会话，支持快速读写
 * 2. MySQL：持久化所有会话记录，用于审计和查询历史
 *
 * Key 格式：
 * - session:sessionId -> SessionCacheDTO
 * - session:user:userId -> Set<sessionId>  (用户的所有活跃会话)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginSessionServiceImpl implements LoginSessionService {

    private final LoginSessionMapper loginSessionMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    /** Redis Key 前缀 */
    private static final String SESSION_KEY_PREFIX = "session:";
    private static final String USER_SESSION_KEY_PREFIX = "session:user:";

    /** Access Token 默认过期时间（秒）：2小时 */
    private static final long DEFAULT_ACCESS_TOKEN_TTL = 7200;
    /** Refresh Token 默认过期时间（秒）：7天 */
    private static final long DEFAULT_REFRESH_TOKEN_TTL = 604800;

    @Override
    public void save(LoginSessionDO session) {
        // 1. 保存到数据库（持久化）
        loginSessionMapper.insert(session);

        // 2. 保存到 Redis（快速访问）
        saveToRedis(session);
    }

    /**
     * 保存会话到 Redis
     */
    private void saveToRedis(LoginSessionDO session) {
        String sessionId = session.getSessionId();

        // 构建 Redis 存储的 DTO
        SessionCacheDTO cacheDTO = new SessionCacheDTO();
        cacheDTO.setSessionId(sessionId);
        cacheDTO.setUserId(session.getUserId());
        cacheDTO.setUserName(session.getUserName());
        cacheDTO.setLoginType(session.getLoginType());
        cacheDTO.setAccessToken(session.getAccessToken());
        cacheDTO.setRefreshToken(session.getRefreshToken());
        cacheDTO.setExpiresAt(session.getExpiresAt());
        cacheDTO.setRefreshExpiresAt(session.getRefreshExpiresAt());
        cacheDTO.setLoginIp(session.getLoginIp());
        cacheDTO.setStatus(session.getStatus());
        cacheDTO.setGmtCreate(session.getGmtCreate());

        // 计算 TTL（使用 Refresh Token 过期时间）
        long ttlSeconds = calculateTtl(session.getRefreshExpiresAt());
        if (ttlSeconds <= 0) {
            ttlSeconds = DEFAULT_REFRESH_TOKEN_TTL;
        }

        long ttlFinal = ttlSeconds;
        runRedis("save session", () -> {
            String sessionKey = SESSION_KEY_PREFIX + sessionId;
            redisTemplate.opsForValue().set(sessionKey, cacheDTO, ttlFinal, TimeUnit.SECONDS);
            String userSessionKey = USER_SESSION_KEY_PREFIX + session.getUserId();
            redisTemplate.opsForSet().add(userSessionKey, sessionId);
            redisTemplate.expire(userSessionKey, ttlFinal, TimeUnit.SECONDS);
            log.debug("Session saved to Redis: sessionId={}, userId={}, ttl={}s",
                    sessionId, session.getUserId(), ttlFinal);
        });
    }

    @Override
    public LoginSessionDO getBySessionId(String sessionId) {
        // 1. 先查 Redis
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        SessionCacheDTO cacheDTO = getRedis("get session",
                () -> (SessionCacheDTO) redisTemplate.opsForValue().get(sessionKey), null);

        if (cacheDTO != null) {
            log.debug("Session hit Redis cache: sessionId={}", sessionId);
            return convertToDO(cacheDTO);
        }

        // 2. Redis 未命中，查数据库（可能是会话刚过期但还在数据库中）
        log.debug("Session miss Redis cache, fallback to DB: sessionId={}", sessionId);
        LoginSessionDO session = loginSessionMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getSessionId, sessionId));

        // 3. 如果数据库有且状态为活跃，重新缓存到 Redis
        if (session != null && SessionStatusEnum.ACTIVE.getCode().equals(session.getStatus())) {
            saveToRedis(session);
        }

        return session;
    }

    @Override
    public LoginSessionDO getByRefreshToken(String refreshToken) {
        // Redis 不支持按 Refresh Token 直接查询，回退到数据库
        return loginSessionMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getRefreshToken, refreshToken));
    }

    @Override
    public LoginSessionDO getByAccessToken(String accessToken) {
        // Redis 不支持按 Access Token 直接查询，回退到数据库
        return loginSessionMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getAccessToken, accessToken));
    }

    @Override
    public List<LoginSessionDO> listActiveByUserId(String userId) {
        // 1. 从 Redis 获取用户的所有活跃会话ID
        String userSessionKey = USER_SESSION_KEY_PREFIX + userId;
        Set<Object> sessionIds = getRedis("list user sessions",
                () -> redisTemplate.opsForSet().members(userSessionKey), null);

        if (sessionIds != null && !sessionIds.isEmpty()) {
            List<LoginSessionDO> sessions = new java.util.ArrayList<>();
            for (Object sessionId : sessionIds) {
                LoginSessionDO session = getBySessionId((String) sessionId);
                if (session != null && SessionStatusEnum.ACTIVE.getCode().equals(session.getStatus())) {
                    sessions.add(session);
                }
            }
            return sessions;
        }

        // 2. Redis 无数据，从数据库查询
        return loginSessionMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getUserId, userId)
                        .eq(LoginSessionDO::getStatus, SessionStatusEnum.ACTIVE.getCode())
                        .orderByDesc(LoginSessionDO::getGmtCreate));
    }

    @Override
    public void updateStatus(String sessionId, String status) {
        // 1. 更新数据库
        loginSessionMapper.update(null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getSessionId, sessionId)
                        .set(LoginSessionDO::getStatus, status));

        // 2. 更新 Redis
        if (SessionStatusEnum.REVOKED.getCode().equals(status) ||
            SessionStatusEnum.EXPIRED.getCode().equals(status)) {
            // 撤销或过期，直接删除 Redis 缓存
            deleteFromRedis(sessionId);
        }
    }

    @Override
    public void updateAccessToken(String sessionId, String accessToken, LocalDateTime expiresAt) {
        // 1. 更新数据库
        loginSessionMapper.update(null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getSessionId, sessionId)
                        .set(LoginSessionDO::getAccessToken, accessToken)
                        .set(LoginSessionDO::getExpiresAt, expiresAt));

        // 2. 更新 Redis 缓存
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        runRedis("update access token cache", () -> {
            SessionCacheDTO cacheDTO = (SessionCacheDTO) redisTemplate.opsForValue().get(sessionKey);
            if (cacheDTO != null) {
                cacheDTO.setAccessToken(accessToken);
                cacheDTO.setExpiresAt(expiresAt);
                long ttlSeconds = calculateTtl(cacheDTO.getRefreshExpiresAt());
                if (ttlSeconds > 0) {
                    redisTemplate.opsForValue().set(sessionKey, cacheDTO, ttlSeconds, TimeUnit.SECONDS);
                }
            }
        });
    }

    @Override
    public void revokeSession(String sessionId) {
        updateStatus(sessionId, SessionStatusEnum.REVOKED.getCode());
    }

    @Override
    public void revokeAllSessions(String userId) {
        // 1. 获取用户所有活跃会话（Redis 不可用时仅依赖数据库）
        String userSessionKey = USER_SESSION_KEY_PREFIX + userId;
        Set<Object> sessionIds = getRedis("revoke all list",
                () -> redisTemplate.opsForSet().members(userSessionKey), null);

        // 2. 批量撤销
        if (sessionIds != null && !sessionIds.isEmpty()) {
            for (Object sessionId : sessionIds) {
                revokeSession((String) sessionId);
            }
        }

        // 3. 更新数据库
        loginSessionMapper.update(null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<LoginSessionDO>()
                        .eq(LoginSessionDO::getUserId, userId)
                        .eq(LoginSessionDO::getStatus, SessionStatusEnum.ACTIVE.getCode())
                        .set(LoginSessionDO::getStatus, SessionStatusEnum.REVOKED.getCode()));
    }

    @Override
    public int cleanExpiredSessions() {
        // Redis 中的过期会话由 TTL 自动清理
        // 这里只清理数据库中的过期会话
        int count = loginSessionMapper.update(null,
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<LoginSessionDO>()
                        .lt(LoginSessionDO::getRefreshExpiresAt, LocalDateTime.now())
                        .eq(LoginSessionDO::getStatus, SessionStatusEnum.ACTIVE.getCode())
                        .set(LoginSessionDO::getStatus, SessionStatusEnum.EXPIRED.getCode()));

        log.info("Cleaned {} expired sessions from database", count);
        return count;
    }

    /**
     * 删除 Redis 中的会话缓存
     */
    private void deleteFromRedis(String sessionId) {
        String sessionKey = SESSION_KEY_PREFIX + sessionId;
        runRedis("delete session", () -> {
            SessionCacheDTO cacheDTO = (SessionCacheDTO) redisTemplate.opsForValue().get(sessionKey);
            if (cacheDTO != null) {
                String userSessionKey = USER_SESSION_KEY_PREFIX + cacheDTO.getUserId();
                redisTemplate.opsForSet().remove(userSessionKey, sessionId);
            }
            redisTemplate.delete(sessionKey);
            redisTemplate.delete("session:valid:" + sessionId);
            log.debug("Session deleted from Redis: sessionId={}", sessionId);
        });
    }

    private void runRedis(String operation, Runnable action) {
        try {
            action.run();
        } catch (Exception e) {
            log.warn("Redis {} failed (session cache degraded, DB still authoritative): {}", operation, e.getMessage());
        }
    }

    private <T> T getRedis(String operation, Supplier<T> supplier, T defaultValue) {
        try {
            return supplier.get();
        } catch (Exception e) {
            log.warn("Redis {} read failed: {}", operation, e.getMessage());
            return defaultValue;
        }
    }

    /**
     * 计算剩余 TTL（秒）
     */
    private long calculateTtl(LocalDateTime expiresAt) {
        if (expiresAt == null) {
            return DEFAULT_REFRESH_TOKEN_TTL;
        }
        return expiresAt.toEpochSecond(ZoneOffset.UTC) - 
               LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
    }

    /**
     * 转换 DTO 到 DO
     */
    private LoginSessionDO convertToDO(SessionCacheDTO dto) {
        LoginSessionDO entity = new LoginSessionDO();
        entity.setSessionId(dto.getSessionId());
        entity.setUserId(dto.getUserId());
        entity.setUserName(dto.getUserName());
        entity.setLoginType(dto.getLoginType());
        entity.setAccessToken(dto.getAccessToken());
        entity.setRefreshToken(dto.getRefreshToken());
        entity.setExpiresAt(dto.getExpiresAt());
        entity.setRefreshExpiresAt(dto.getRefreshExpiresAt());
        entity.setLoginIp(dto.getLoginIp());
        entity.setStatus(dto.getStatus());
        entity.setGmtCreate(dto.getGmtCreate());
        return entity;
    }
}
