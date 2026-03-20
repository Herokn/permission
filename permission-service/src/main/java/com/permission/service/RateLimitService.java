package com.permission.service;

/**
 * 限流服务接口
 */
public interface RateLimitService {

    /**
     * 检查是否允许登录尝试
     *
     * @param key      限流key（如 IP 或 用户名）
     * @param maxAttempts 最大允许次数
     * @param windowSeconds 时间窗口（秒）
     * @return true=允许，false=被限流
     */
    boolean allowLogin(String key, int maxAttempts, int windowSeconds);

    /**
     * 获取剩余等待时间
     *
     * @param key 限流key
     * @return 剩余秒数，0表示未被限流
     */
    long getRemainingTime(String key);

    /**
     * 重置限流计数
     *
     * @param key 限流key
     */
    void reset(String key);
}
