package com.permission.service.cache;

import com.permission.service.model.AuthzResult;

import java.util.List;
import java.util.Map;

/**
 * 鉴权缓存服务接口
 */
public interface AuthzCacheService {

    /**
     * 带缓存的鉴权
     */
    AuthzResult checkWithCache(String userId, String permissionCode, String projectId);

    /**
     * 批量带缓存的鉴权（优化：批量从Redis获取缓存，减少网络IO）
     */
    Map<String, AuthzResult> checkBatchWithCache(String userId, List<String> permissionCodes, String projectId);

    /**
     * 清除指定用户的所有缓存
     */
    void evictUser(String userId);

    /**
     * 批量清除多个用户的缓存
     */
    void evictUsers(List<String> userIds);

    /**
     * 清除与指定权限编码相关的所有缓存
     */
    void evictPermission(String permissionCode);

    /**
     * 清除所有缓存
     */
    void evictAll();
}

