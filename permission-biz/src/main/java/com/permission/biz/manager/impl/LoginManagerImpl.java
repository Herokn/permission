package com.permission.biz.manager.impl;

import com.permission.biz.dto.auth.LoginDTO;
import com.permission.biz.dto.auth.RefreshTokenDTO;
import com.permission.biz.dto.auth.SsoLoginDTO;
import com.permission.biz.manager.LoginManager;
import com.permission.biz.vo.auth.LoginVO;
import com.permission.biz.vo.auth.SsoLoginVO;
import com.permission.biz.vo.auth.UserInfoVO;
import com.permission.common.config.PermissionConfig;
import com.permission.common.enums.LoginTypeEnum;
import com.permission.common.enums.SessionStatusEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.exception.ErrorCode;
import com.permission.common.util.JwtUtil;
import com.permission.dal.dataobject.LoginSessionDO;
import com.permission.service.AuthzService;
import com.permission.service.LoginSessionService;
import com.permission.service.PasswordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * 登录 Manager 实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginManagerImpl implements LoginManager {

    private final LoginSessionService loginSessionService;
    private final JwtUtil jwtUtil;
    private final PasswordService passwordService;
    private final AuthzService authzService;
    private final PermissionConfig permissionConfig;

    @Value("${auth.users.admin:}")
    private String adminPassword;

    @Value("${auth.users.user1:}")
    private String user1Password;

    private Map<String, String> configuredUsers;

    @jakarta.annotation.PostConstruct
    public void init() {
        configuredUsers = new HashMap<>();
        if (StringUtils.hasText(adminPassword)) {
            configuredUsers.put("admin", encodeIfNeeded(adminPassword));
        }
        if (StringUtils.hasText(user1Password)) {
            configuredUsers.put("user1", encodeIfNeeded(user1Password));
        }
        log.info("已加载 {} 个预配置用户", configuredUsers.size());
    }

    private String encodeIfNeeded(String password) {
        if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
            return password;
        }
        return passwordService.encode(password);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO login(LoginDTO dto) {
        String userName = dto.getUserName();
        String password = dto.getPassword();

        if (!validatePassword(userName, password)) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        String sessionId = UUID.randomUUID().toString();
        String userId = generateUserId(userName);

        long now = System.currentTimeMillis();
        long expiresAt = now + jwtUtil.getDefaultAccessTokenExpireMillis();
        long refreshExpiresAt = now + jwtUtil.getDefaultRefreshTokenExpireMillis();

        String accessToken = jwtUtil.generateAccessToken(userId, sessionId, expiresAt);
        String refreshToken = jwtUtil.generateRefreshToken(userId, sessionId, refreshExpiresAt);

        LoginSessionDO session = new LoginSessionDO();
        session.setSessionId(sessionId);
        session.setUserId(userId);
        session.setUserName(userName);
        session.setLoginType(LoginTypeEnum.PASSWORD.getCode());
        session.setAccessToken(accessToken);
        session.setRefreshToken(refreshToken);
        session.setExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(expiresAt), ZoneId.systemDefault()));
        session.setRefreshExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(refreshExpiresAt), ZoneId.systemDefault()));
        session.setStatus(SessionStatusEnum.ACTIVE.getCode());
        loginSessionService.save(session);

        return buildLoginVO(session);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SsoLoginVO ssoLogin(SsoLoginDTO dto) {
        if (dto.getCode() == null || dto.getCode().isEmpty()) {
            String authUrl = buildSsoAuthUrl(dto.getRedirectUri());
            SsoLoginVO vo = new SsoLoginVO();
            vo.setAuthUrl(authUrl);
            return vo;
        }

        throw new BusinessException(ErrorCode.SSO_AUTH_FAILED, "SSO认证暂未实现");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void logout(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            return;
        }
        loginSessionService.revokeSession(sessionId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public LoginVO refresh(RefreshTokenDTO dto) {
        String refreshToken = dto.getRefreshToken();

        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        String sessionId = jwtUtil.getSessionId(refreshToken);
        if (sessionId == null) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        LoginSessionDO session = loginSessionService.getBySessionId(sessionId);
        if (session == null) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        if (SessionStatusEnum.REVOKED.getCode().equals(session.getStatus())) {
            throw new BusinessException(ErrorCode.SESSION_REVOKED);
        }

        if (SessionStatusEnum.EXPIRED.getCode().equals(session.getStatus())) {
            throw new BusinessException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        long now = System.currentTimeMillis();
        long expiresAt = now + jwtUtil.getDefaultAccessTokenExpireMillis();

        String newAccessToken = jwtUtil.generateAccessToken(
                session.getUserId(), sessionId, expiresAt);

        loginSessionService.updateAccessToken(sessionId, newAccessToken,
                LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(expiresAt), ZoneId.systemDefault()));

        session.setAccessToken(newAccessToken);
        session.setExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(expiresAt), ZoneId.systemDefault()));
        return buildLoginVO(session);
    }

    @Override
    public UserInfoVO getCurrentUser(String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        LoginSessionDO session = loginSessionService.getBySessionId(sessionId);
        if (session == null || !SessionStatusEnum.ACTIVE.getCode().equals(session.getStatus())) {
            throw new BusinessException(ErrorCode.SESSION_REVOKED);
        }

        UserInfoVO vo = new UserInfoVO();
        vo.setUserId(session.getUserId());
        vo.setUserName(session.getUserName());
        vo.setLoginType(session.getLoginType());
        vo.setAdmin(permissionConfig.isSuperAdmin(session.getUserId()));

        Set<String> permissions = authzService.getUserPermissionCodes(session.getUserId(), null);
        vo.setPermissions(permissions.stream().toList());

        return vo;
    }

    private boolean validatePassword(String userName, String password) {
        String encodedPassword = configuredUsers.get(userName);
        if (encodedPassword == null) {
            log.warn("用户不存在: {}", userName);
            return false;
        }
        boolean result = passwordService.matches(password, encodedPassword);
        if (!result) {
            log.warn("密码校验失败: {}", userName);
        }
        return result;
    }

    private String generateUserId(String userName) {
        return userName;
    }

    private LoginVO buildLoginVO(LoginSessionDO session) {
        LoginVO vo = new LoginVO();
        vo.setSessionId(session.getSessionId());
        vo.setAccessToken(session.getAccessToken());
        vo.setRefreshToken(session.getRefreshToken());
        vo.setExpiresAt(session.getExpiresAt().atZone(ZoneId.systemDefault()).toEpochSecond());
        vo.setRefreshExpiresAt(session.getRefreshExpiresAt().atZone(ZoneId.systemDefault()).toEpochSecond());

        UserInfoVO userInfo = new UserInfoVO();
        userInfo.setUserId(session.getUserId());
        userInfo.setUserName(session.getUserName());
        userInfo.setLoginType(session.getLoginType());
        userInfo.setAdmin(permissionConfig.isSuperAdmin(session.getUserId()));
        Set<String> permissions = authzService.getUserPermissionCodes(session.getUserId(), null);
        userInfo.setPermissions(permissions.stream().toList());
        vo.setUserInfo(userInfo);
        return vo;
    }

    private String buildSsoAuthUrl(String redirectUri) {
        return String.format("https://sso.example.com/oauth/authorize?client_id=your-client-id&redirect_uri=%s&response_type=code",
                redirectUri);
    }
}
