package com.permission.biz.manager.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.permission.biz.config.AuthUsersConfig;
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
import com.permission.dal.dataobject.UserDO;
import com.permission.dal.mapper.UserMapper;
import com.permission.service.AuthzService;
import com.permission.service.LoginSessionService;
import com.permission.service.PasswordService;
import com.permission.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
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

    private static final int USER_TYPE_BUSINESS = 0;

    private final LoginSessionService loginSessionService;
    private final JwtUtil jwtUtil;
    private final PasswordService passwordService;
    private final AuthzService authzService;
    private final PermissionConfig permissionConfig;
    private final AuthUsersConfig authUsersConfig;
    private final RateLimitService rateLimitService;
    private final UserMapper userMapper;

    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOGIN_WINDOW_SECONDS = 300;

    private Map<String, String> configuredUsers;

    @jakarta.annotation.PostConstruct
    public void init() {
        configuredUsers = new HashMap<>();

        Map<String, String> authUsersMap = authUsersConfig.getUsers();
        if (authUsersMap != null) {
            for (Map.Entry<String, String> entry : authUsersMap.entrySet()) {
                String username = entry.getKey();
                String pwd = entry.getValue();
                if (StringUtils.hasText(username) && StringUtils.hasText(pwd)) {
                    configuredUsers.put(username, encodeIfNeeded(pwd));
                    log.debug("加载预配置用户: {}", username);
                }
            }
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
        String loginAccount = dto.getUserName();
        String password = dto.getPassword();

        if (!rateLimitService.allowLogin(loginAccount, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_SECONDS)) {
            long remaining = rateLimitService.getRemainingTime(loginAccount);
            throw new BusinessException(ErrorCode.TOO_MANY_REQUESTS,
                    "登录尝试次数过多，请 " + remaining + " 秒后重试");
        }

        String jwtUserId = resolveAuthenticatedUser(loginAccount, password);
        if (jwtUserId == null) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        rateLimitService.reset(loginAccount);

        String sessionId = UUID.randomUUID().toString();

        long now = System.currentTimeMillis();
        long expiresAt = now + jwtUtil.getDefaultAccessTokenExpireMillis();
        long refreshExpiresAt = now + jwtUtil.getDefaultRefreshTokenExpireMillis();

        String accessToken = jwtUtil.generateAccessToken(jwtUserId, sessionId, expiresAt);
        String refreshToken = jwtUtil.generateRefreshToken(jwtUserId, sessionId, refreshExpiresAt);

        LoginSessionDO session = new LoginSessionDO();
        session.setSessionId(sessionId);
        session.setUserId(jwtUserId);
        session.setUserName(loginAccount);
        session.setLoginType(LoginTypeEnum.PASSWORD.getCode());
        session.setAccessToken(accessToken);
        session.setRefreshToken(refreshToken);
        session.setExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(expiresAt), ZoneOffset.UTC));
        session.setRefreshExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(refreshExpiresAt), ZoneOffset.UTC));
        session.setStatus(SessionStatusEnum.ACTIVE.getCode());
        loginSessionService.save(session);

        return buildLoginVO(session);
    }

    /**
     * 配置账号：JWT 业务 userId 固定为 sys_{loginAccount}，与登录账号分离（如 admin → sys_admin）。
     * 业务用户：JWT subject 为表 user.user_id（服务端生成）。
     */
    private static String configuredAccountToUserId(String loginAccount) {
        return "sys_" + loginAccount;
    }

    private String resolveAuthenticatedUser(String loginAccount, String password) {
        String encoded = configuredUsers.get(loginAccount);
        if (encoded != null) {
            if (passwordService.matches(password, encoded)) {
                return configuredAccountToUserId(loginAccount);
            }
            log.warn("密码校验失败(配置用户): {}", loginAccount);
            return null;
        }

        UserDO u = userMapper.selectOne(
                new LambdaQueryWrapper<UserDO>()
                        .eq(UserDO::getLoginAccount, loginAccount)
                        .eq(UserDO::getUserType, USER_TYPE_BUSINESS)
        );
        if (u == null) {
            log.warn("用户不存在: {}", loginAccount);
            return null;
        }
        if (u.getStatus() != null && u.getStatus() != 1) {
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }
        if (!StringUtils.hasText(u.getPasswordHash()) || !passwordService.matches(password, u.getPasswordHash())) {
            log.warn("密码校验失败(业务用户): {}", loginAccount);
            return null;
        }
        return u.getUserId();
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
                LocalDateTime.ofInstant(java.time.Instant.ofEpochMilli(expiresAt), ZoneOffset.UTC));

        session.setAccessToken(newAccessToken);
        session.setExpiresAt(LocalDateTime.ofInstant(
                java.time.Instant.ofEpochMilli(expiresAt), ZoneOffset.UTC));
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

        return buildUserInfo(session);
    }

    private LoginVO buildLoginVO(LoginSessionDO session) {
        LoginVO vo = new LoginVO();
        vo.setSessionId(session.getSessionId());
        vo.setAccessToken(session.getAccessToken());
        vo.setRefreshToken(session.getRefreshToken());
        vo.setExpiresAt(session.getExpiresAt().atZone(ZoneId.systemDefault()).toEpochSecond());
        vo.setRefreshExpiresAt(session.getRefreshExpiresAt().atZone(ZoneId.systemDefault()).toEpochSecond());

        UserInfoVO userInfo = buildUserInfo(session);
        vo.setUserInfo(userInfo);
        return vo;
    }

    private UserInfoVO buildUserInfo(LoginSessionDO session) {
        UserInfoVO userInfo = new UserInfoVO();
        userInfo.setUserId(session.getUserId());
        userInfo.setUserName(session.getUserName());
        userInfo.setLoginType(session.getLoginType());
        userInfo.setAdmin(permissionConfig.isSuperAdmin(session.getUserId()));

        Set<String> permissions = authzService.getUserPermissionCodes(session.getUserId(), null);
        userInfo.setPermissions(permissions.stream().toList());
        userInfo.setModules(calculateModules(permissions, userInfo.isAdmin()));

        return userInfo;
    }

    private Set<String> calculateModules(Set<String> permissions, boolean superAdmin) {
        Set<String> modules = new java.util.HashSet<>();
        if (superAdmin) {
            modules.add("user-center");
            modules.add("permission-center");
            return modules;
        }
        boolean uc = permissions.stream().anyMatch(p ->
                p.startsWith("USER_CENTER") || "SYS_USER_MANAGEMENT_ACCESS".equals(p));
        if (uc) {
            modules.add("user-center");
        }
        boolean pc = permissions.stream().anyMatch(LoginManagerImpl::isPermissionCenterPermission);
        if (pc) {
            modules.add("permission-center");
        }
        return modules;
    }

    private static boolean isPermissionCenterPermission(String p) {
        return p.startsWith("PERMISSION_CENTER")
                || p.startsWith("ROLE_")
                || p.startsWith("USER_AUTH_")
                || p.startsWith("PERMISSION_MANAGE")
                || p.startsWith("PERM_CENTER")
                || p.equals("PERMISSION_MANAGE");
    }

    private String buildSsoAuthUrl(String redirectUri) {
        // 白名单校验，防止开放重定向攻击
        if (!permissionConfig.isSsoRedirectAllowed(redirectUri)) {
            log.warn("SSO回调地址不在白名单中: {}", redirectUri);
            throw new BusinessException(ErrorCode.INVALID_PARAM, "SSO回调地址不在允许的白名单中");
        }
        try {
            // URL编码redirectUri
            String encodedRedirectUri = java.net.URLEncoder.encode(redirectUri, "UTF-8");
            return String.format("https://sso.example.com/oauth/authorize?client_id=your-client-id&redirect_uri=%s&response_type=code",
                    encodedRedirectUri);
        } catch (java.io.UnsupportedEncodingException e) {
            log.error("URL编码失败: {}", redirectUri, e);
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "SSO回调地址编码失败");
        }
    }
}
