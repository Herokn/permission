package com.permission.test.biz.manager.impl;

import com.permission.biz.dto.auth.LoginDTO;
import com.permission.biz.dto.auth.RefreshTokenDTO;
import com.permission.biz.manager.impl.LoginManagerImpl;
import com.permission.biz.vo.auth.LoginVO;
import com.permission.biz.vo.auth.UserInfoVO;
import com.permission.common.config.PermissionConfig;
import com.permission.common.enums.SessionStatusEnum;
import com.permission.common.exception.BusinessException;
import com.permission.common.util.JwtUtil;
import com.permission.dal.dataobject.LoginSessionDO;
import com.permission.service.AuthzService;
import com.permission.service.LoginSessionService;
import com.permission.service.PasswordService;
import com.permission.test.base.BaseTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * 登录 Manager 单元测试
 */
@DisplayName("登录 Manager 单元测试")
class LoginManagerImplTest extends BaseTest {

    @Mock
    private LoginSessionService loginSessionService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordService passwordService;

    @Mock
    private AuthzService authzService;

    @Spy
    private PermissionConfig permissionConfig = new PermissionConfig();

    @InjectMocks
    private LoginManagerImpl loginManager;

    private static final String TEST_USER = "admin";
    private static final String TEST_PASSWORD = "admin123";
    private static final String TEST_USER_ID = "admin";
    private static final String TEST_SESSION_ID = "test-session-id";
    private static final String TEST_ACCESS_TOKEN = "test-access-token";
    private static final String TEST_REFRESH_TOKEN = "test-refresh-token";

    @BeforeEach
    void setUpLoginManager() {
        Map<String, String> configuredUsers = new HashMap<>();
        configuredUsers.put(TEST_USER, "$2a$10$encodedpassword");
        ReflectionTestUtils.setField(loginManager, "configuredUsers", configuredUsers);
        // 设置超级管理员配置
        permissionConfig.setSuperAdmins("admin");
    }

    @Test
    @DisplayName("登录成功-返回有效Token和会话信息")
    void testLogin_Success_ShouldReturnValidTokenAndSession() {
        LoginDTO dto = new LoginDTO();
        dto.setUserName(TEST_USER);
        dto.setPassword(TEST_PASSWORD);

        when(passwordService.matches(TEST_PASSWORD, "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtil.getDefaultAccessTokenExpireMillis()).thenReturn(7200000L);
        when(jwtUtil.getDefaultRefreshTokenExpireMillis()).thenReturn(604800000L);
        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyLong())).thenReturn(TEST_ACCESS_TOKEN);
        when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyLong())).thenReturn(TEST_REFRESH_TOKEN);

        LoginVO result = loginManager.login(dto);

        assertNotNull(result);
        assertEquals(36, result.getSessionId().length()); // UUID length
        assertEquals(TEST_ACCESS_TOKEN, result.getAccessToken());
        assertEquals(TEST_REFRESH_TOKEN, result.getRefreshToken());
        assertNotNull(result.getUserInfo());
        assertEquals(TEST_USER_ID, result.getUserInfo().getUserId());
        assertEquals(TEST_USER, result.getUserInfo().getUserName());

        verify(loginSessionService).save(any(LoginSessionDO.class));
    }

    @Test
    @DisplayName("登录失败-用户不存在应抛出异常")
    void testLogin_WhenUserNotFound_ShouldThrowException() {
        LoginDTO dto = new LoginDTO();
        dto.setUserName("nonexistent");
        dto.setPassword(TEST_PASSWORD);

        assertThrows(BusinessException.class, () -> loginManager.login(dto));

        verify(loginSessionService, never()).save(any());
    }

    @Test
    @DisplayName("登录失败-密码错误应抛出异常")
    void testLogin_WhenPasswordWrong_ShouldThrowException() {
        LoginDTO dto = new LoginDTO();
        dto.setUserName(TEST_USER);
        dto.setPassword("wrongpassword");

        when(passwordService.matches("wrongpassword", "$2a$10$encodedpassword")).thenReturn(false);

        assertThrows(BusinessException.class, () -> loginManager.login(dto));

        verify(loginSessionService, never()).save(any());
    }

    @Test
    @DisplayName("登出成功-会话应被撤销")
    void testLogout_Success_ShouldRevokeSession() {
        loginManager.logout(TEST_SESSION_ID);

        verify(loginSessionService).revokeSession(TEST_SESSION_ID);
    }

    @Test
    @DisplayName("登出-空sessionId应直接返回")
    void testLogout_WhenSessionIdNull_ShouldReturnDirectly() {
        loginManager.logout(null);
        loginManager.logout("");

        verify(loginSessionService, never()).revokeSession(any());
    }

    @Test
    @DisplayName("刷新Token成功-返回新AccessToken")
    void testRefresh_Success_ShouldReturnNewAccessToken() {
        RefreshTokenDTO dto = new RefreshTokenDTO();
        dto.setRefreshToken(TEST_REFRESH_TOKEN);

        LoginSessionDO session = createTestSession();

        when(jwtUtil.validateToken(TEST_REFRESH_TOKEN)).thenReturn(true);
        when(jwtUtil.isRefreshToken(TEST_REFRESH_TOKEN)).thenReturn(true);
        when(jwtUtil.getSessionId(TEST_REFRESH_TOKEN)).thenReturn(TEST_SESSION_ID);
        when(loginSessionService.getBySessionId(TEST_SESSION_ID)).thenReturn(session);
        when(jwtUtil.getDefaultAccessTokenExpireMillis()).thenReturn(7200000L);
        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyLong())).thenReturn("new-access-token");

        LoginVO result = loginManager.refresh(dto);

        assertNotNull(result);
        assertEquals("new-access-token", result.getAccessToken());

        verify(loginSessionService).updateAccessToken(eq(TEST_SESSION_ID), anyString(), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("刷新Token失败-Token无效应抛出异常")
    void testRefresh_WhenTokenInvalid_ShouldThrowException() {
        RefreshTokenDTO dto = new RefreshTokenDTO();
        dto.setRefreshToken("invalid-token");

        when(jwtUtil.validateToken("invalid-token")).thenReturn(false);

        assertThrows(BusinessException.class, () -> loginManager.refresh(dto));
    }

    @Test
    @DisplayName("刷新Token失败-Token不是RefreshToken应抛出异常")
    void testRefresh_WhenNotRefreshToken_ShouldThrowException() {
        RefreshTokenDTO dto = new RefreshTokenDTO();
        dto.setRefreshToken(TEST_ACCESS_TOKEN);

        when(jwtUtil.validateToken(TEST_ACCESS_TOKEN)).thenReturn(true);
        when(jwtUtil.isRefreshToken(TEST_ACCESS_TOKEN)).thenReturn(false);

        assertThrows(BusinessException.class, () -> loginManager.refresh(dto));
    }

    @Test
    @DisplayName("刷新Token失败-会话已撤销应抛出异常")
    void testRefresh_WhenSessionRevoked_ShouldThrowException() {
        RefreshTokenDTO dto = new RefreshTokenDTO();
        dto.setRefreshToken(TEST_REFRESH_TOKEN);

        LoginSessionDO session = createTestSession();
        session.setStatus(SessionStatusEnum.REVOKED.getCode());

        when(jwtUtil.validateToken(TEST_REFRESH_TOKEN)).thenReturn(true);
        when(jwtUtil.isRefreshToken(TEST_REFRESH_TOKEN)).thenReturn(true);
        when(jwtUtil.getSessionId(TEST_REFRESH_TOKEN)).thenReturn(TEST_SESSION_ID);
        when(loginSessionService.getBySessionId(TEST_SESSION_ID)).thenReturn(session);

        assertThrows(BusinessException.class, () -> loginManager.refresh(dto));
    }

    @Test
    @DisplayName("获取当前用户成功-返回用户信息")
    void testGetCurrentUser_Success_ShouldReturnUserInfo() {
        LoginSessionDO session = createTestSession();

        when(loginSessionService.getBySessionId(TEST_SESSION_ID)).thenReturn(session);

        UserInfoVO result = loginManager.getCurrentUser(TEST_SESSION_ID);

        assertNotNull(result);
        assertEquals(TEST_USER_ID, result.getUserId());
        assertEquals(TEST_USER, result.getUserName());
    }

    @Test
    @DisplayName("获取当前用户失败-会话不存在应抛出异常")
    void testGetCurrentUser_WhenSessionNotFound_ShouldThrowException() {
        when(loginSessionService.getBySessionId(TEST_SESSION_ID)).thenReturn(null);

        assertThrows(BusinessException.class, () -> loginManager.getCurrentUser(TEST_SESSION_ID));
    }

    @Test
    @DisplayName("获取当前用户失败-会话非ACTIVE状态应抛出异常")
    void testGetCurrentUser_WhenSessionNotActive_ShouldThrowException() {
        LoginSessionDO session = createTestSession();
        session.setStatus(SessionStatusEnum.REVOKED.getCode());

        when(loginSessionService.getBySessionId(TEST_SESSION_ID)).thenReturn(session);

        assertThrows(BusinessException.class, () -> loginManager.getCurrentUser(TEST_SESSION_ID));
    }

    @Test
    @DisplayName("会话保存-状态应为ACTIVE")
    void testLogin_SessionStatusShouldBeActive() {
        LoginDTO dto = new LoginDTO();
        dto.setUserName(TEST_USER);
        dto.setPassword(TEST_PASSWORD);

        when(passwordService.matches(TEST_PASSWORD, "$2a$10$encodedpassword")).thenReturn(true);
        when(jwtUtil.getDefaultAccessTokenExpireMillis()).thenReturn(7200000L);
        when(jwtUtil.getDefaultRefreshTokenExpireMillis()).thenReturn(604800000L);
        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyLong())).thenReturn(TEST_ACCESS_TOKEN);
        when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyLong())).thenReturn(TEST_REFRESH_TOKEN);

        loginManager.login(dto);

        verify(loginSessionService).save(argThat(session ->
            SessionStatusEnum.ACTIVE.getCode().equals(session.getStatus())
        ));
    }

    private LoginSessionDO createTestSession() {
        LoginSessionDO session = new LoginSessionDO();
        session.setSessionId(TEST_SESSION_ID);
        session.setUserId(TEST_USER_ID);
        session.setUserName(TEST_USER);
        session.setLoginType("PASSWORD");
        session.setAccessToken(TEST_ACCESS_TOKEN);
        session.setRefreshToken(TEST_REFRESH_TOKEN);
        session.setStatus(SessionStatusEnum.ACTIVE.getCode());
        session.setExpiresAt(LocalDateTime.now().plusHours(2));
        session.setRefreshExpiresAt(LocalDateTime.now().plusDays(7));
        return session;
    }
}
