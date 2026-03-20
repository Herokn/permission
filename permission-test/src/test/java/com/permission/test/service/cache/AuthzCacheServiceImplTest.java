package com.permission.test.service.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.permission.service.AuthzService;
import com.permission.service.cache.impl.AuthzCacheServiceImpl;
import com.permission.service.model.AuthzResult;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AuthzCacheServiceImpl 单元测试
 */
@DisplayName("鉴权缓存 Service 单元测试")
class AuthzCacheServiceImplTest extends BaseTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private AuthzService authzService;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AuthzCacheServiceImpl authzCacheService;

    @BeforeEach
    public void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    @DisplayName("checkWithCache - 缓存命中返回缓存结果")
    void testCheckWithCache_CacheHit() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String projectId = "UC";
        String key = "authz:user1:USER_CENTER_USER_VIEW:UC";
        String cachedJson = "{\"allowed\":true,\"reason\":\"来自角色 PROJECT_MANAGER\"}";

        when(valueOperations.get(key)).thenReturn(cachedJson);

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, projectId);

        assertTrue(result.isAllowed());
        assertEquals("来自角色 PROJECT_MANAGER", result.getReason());
        verify(authzService, never()).check(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("checkWithCache - 缓存未命中调用鉴权服务并缓存结果")
    void testCheckWithCache_CacheMiss() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String projectId = "UC";
        String key = "authz:user1:USER_CENTER_USER_VIEW:UC";

        when(valueOperations.get(key)).thenReturn(null);
        when(authzService.check(userId, permissionCode, projectId))
                .thenReturn(AuthzResult.allowed("来自角色 ADMIN"));

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, projectId);

        assertTrue(result.isAllowed());
        verify(authzService).check(userId, permissionCode, projectId);
        verify(valueOperations).set(eq(key), anyString(), any(Duration.class));
    }

    @Test
    @DisplayName("checkWithCache - 缓存反序列化失败删除缓存并重新鉴权")
    void testCheckWithCache_InvalidCache() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String projectId = "UC";
        String key = "authz:user1:USER_CENTER_USER_VIEW:UC";
        String invalidJson = "{invalid json";

        when(valueOperations.get(key)).thenReturn(invalidJson);
        when(authzService.check(userId, permissionCode, projectId))
                .thenReturn(AuthzResult.denied("无权限"));

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, projectId);

        assertFalse(result.isAllowed());
        verify(redisTemplate).delete(key);
        verify(authzService).check(userId, permissionCode, projectId);
    }

    @Test
    @DisplayName("checkWithCache - projectId 为 null 时使用全局标识")
    void testCheckWithCache_NullProjectId() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String key = "authz:user1:USER_CENTER_USER_VIEW:_GLOBAL_";

        when(valueOperations.get(key)).thenReturn(null);
        when(authzService.check(userId, permissionCode, null))
                .thenReturn(AuthzResult.allowed("全局角色授权"));

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, null);

        assertTrue(result.isAllowed());
        verify(valueOperations).set(eq(key), anyString(), any(Duration.class));
    }

    @Test
    @DisplayName("checkWithCache - 拒绝结果缓存空值标记防止穿透")
    void testCheckWithCache_DeniedResultCachedAsNullMarker() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String projectId = "UC";
        String key = "authz:user1:USER_CENTER_USER_VIEW:UC";

        // Mock 缓存未命中
        when(valueOperations.get(key)).thenReturn(null);
        
        // Mock 鉴权服务返回拒绝结果
        AuthzResult deniedResult = AuthzResult.denied("无权限");
        assertFalse(deniedResult.isAllowed(), "预检查：denied 结果 should not be allowed");
        when(authzService.check(userId, permissionCode, projectId)).thenReturn(deniedResult);

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, projectId);

        assertFalse(result.isAllowed());
        // 验证缓存了空值标记（TTL 是 1 分钟）
        verify(valueOperations).set(eq(key), eq("__NULL__"), eq(Duration.ofMinutes(1)));
        // 验证没有使用 JSON 格式缓存
        verify(valueOperations, never()).set(eq(key), contains("allowed"), any(Duration.class));
    }

    @Test
    @DisplayName("checkWithCache - 空值标记命中直接返回拒绝")
    void testCheckWithCache_NullMarkerHit() throws Exception {
        String userId = "user1";
        String permissionCode = "USER_CENTER_USER_VIEW";
        String projectId = "UC";
        String key = "authz:user1:USER_CENTER_USER_VIEW:UC";

        when(valueOperations.get(key)).thenReturn("__NULL__");

        AuthzResult result = authzCacheService.checkWithCache(userId, permissionCode, projectId);

        assertNotNull(result);
        assertFalse(result.isAllowed());
        assertEquals("缓存空值：无权限", result.getReason());
        // 空值标记命中，不调用鉴权服务
        verify(authzService, never()).check(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("evictUser - 清除用户所有缓存")
    void testEvictUser() {
        String userId = "user1";
        Set<String> keys = new HashSet<>(Arrays.asList(
                "authz:user1:USER_CENTER_USER_VIEW:UC",
                "authz:user1:USER_CENTER_USER_VIEW:_GLOBAL_"
        ));

        mockScanKeys("authz:user1:*", keys);

        authzCacheService.evictUser(userId);

        verify(redisTemplate).delete(keys);
    }

    @Test
    @DisplayName("evictUser - 无缓存时不执行删除")
    void testEvictUser_NoCache() {
        String userId = "user2";

        mockScanKeys("authz:user2:*", new HashSet<>());

        authzCacheService.evictUser(userId);

        verify(redisTemplate, never()).delete(anySet());
    }

    @Test
    @DisplayName("evictPermission - 清除权限相关缓存")
    void testEvictPermission() {
        String permissionCode = "USER_CENTER_USER_VIEW";
        Set<String> keys = new HashSet<>(Arrays.asList(
                "authz:user1:USER_CENTER_USER_VIEW:UC",
                "authz:user2:USER_CENTER_USER_VIEW:PC"
        ));

        mockScanKeys("authz:*:USER_CENTER_USER_VIEW:*", keys);

        authzCacheService.evictPermission(permissionCode);

        verify(redisTemplate).delete(keys);
    }

    @Test
    @DisplayName("evictAll - 清除所有鉴权缓存")
    void testEvictAll() {
        Set<String> keys = new HashSet<>(Arrays.asList(
                "authz:user1:USER_CENTER_USER_VIEW:UC",
                "authz:user2:USER_CENTER_USER_VIEW:_GLOBAL_"
        ));

        mockScanKeys("authz:*", keys);

        authzCacheService.evictAll();

        verify(redisTemplate).delete(keys);
    }

    @SuppressWarnings("unchecked")
    private void mockScanKeys(String pattern, Set<String> keys) {
        Cursor<String> mockCursor = mock(Cursor.class);
        when(redisTemplate.scan(any(ScanOptions.class))).thenReturn(mockCursor);

        Iterator<String> iterator = keys.iterator();
        when(mockCursor.hasNext()).thenAnswer(invocation -> iterator.hasNext());
        lenient().when(mockCursor.next()).thenAnswer(invocation -> iterator.next());
    }
}