package com.permission.service.cache;

import com.permission.service.model.AuthzResult;

import java.util.List;

/**
 * 鉴权缓存服务接口
 */
public interface AuthzCacheService {

    /**
     * 带缓存的鉴权
     */
    AuthzResult checkWithCache(String userId, String permissionCode, String projectId);

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

