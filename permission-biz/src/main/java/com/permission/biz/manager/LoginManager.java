package com.permission.biz.manager;

import com.permission.biz.dto.auth.LoginDTO;
import com.permission.biz.dto.auth.RefreshTokenDTO;
import com.permission.biz.dto.auth.SsoLoginDTO;
import com.permission.biz.vo.auth.LoginVO;
import com.permission.biz.vo.auth.SsoLoginVO;
import com.permission.biz.vo.auth.UserInfoVO;

/**
 * 登录 Manager 接口
 */
public interface LoginManager {

    /**
     * 账号密码登录
     *
     * @param dto 登录请求
     * @return 登录结果
     */
    LoginVO login(LoginDTO dto);

    /**
     * SSO登录
     *
     * @param dto SSO登录请求
     * @return SSO登录结果
     */
    SsoLoginVO ssoLogin(SsoLoginDTO dto);

    /**
     * 登出
     *
     * @param sessionId 会话ID
     */
    void logout(String sessionId);

    /**
     * 刷新Token
     *
     * @param dto 刷新Token请求
     * @return 新的登录信息
     */
    LoginVO refresh(RefreshTokenDTO dto);

    /**
     * 获取当前用户信息
     *
     * @param sessionId 会话ID
     * @return 用户信息
     */
    UserInfoVO getCurrentUser(String sessionId);
}
