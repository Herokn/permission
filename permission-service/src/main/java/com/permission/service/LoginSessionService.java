package com.permission.service;

import com.permission.dal.dataobject.LoginSessionDO;

import java.util.List;

/**
 * 登录会话 Service 接口
 */
public interface LoginSessionService {

    /**
     * 保存登录会话
     *
     * @param session 登录会话
     */
    void save(LoginSessionDO session);

    /**
     * 根据会话ID查询
     *
     * @param sessionId 会话ID
     * @return 登录会话
     */
    LoginSessionDO getBySessionId(String sessionId);

    /**
     * 根据Refresh Token查询
     *
     * @param refreshToken Refresh Token
     * @return 登录会话
     */
    LoginSessionDO getByRefreshToken(String refreshToken);

    /**
     * 根据Access Token查询
     *
     * @param accessToken Access Token
     * @return 登录会话
     */
    LoginSessionDO getByAccessToken(String accessToken);

    /**
     * 查询用户的所有有效会话
     *
     * @param userId 用户ID
     * @return 会话列表
     */
    List<LoginSessionDO> listActiveByUserId(String userId);

    /**
     * 更新会话状态
     *
     * @param sessionId 会话ID
     * @param status    状态
     */
    void updateStatus(String sessionId, String status);

    /**
     * 更新Access Token
     *
     * @param sessionId   会话ID
     * @param accessToken 新的Access Token
     * @param expiresAt   新的过期时间
     */
    void updateAccessToken(String sessionId, String accessToken, java.time.LocalDateTime expiresAt);

    /**
     * 使会话失效（登出）
     *
     * @param sessionId 会话ID
     */
    void revokeSession(String sessionId);

    /**
     * 使用户所有会话失效
     *
     * @param userId 用户ID
     */
    void revokeAllSessions(String userId);

    /**
     * 清理过期会话
     *
     * @return 清理的会话数量
     */
    int cleanExpiredSessions();
}
