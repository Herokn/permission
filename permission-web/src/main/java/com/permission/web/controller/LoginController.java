package com.permission.web.controller;

import com.permission.biz.dto.auth.LoginDTO;
import com.permission.biz.dto.auth.RefreshTokenDTO;
import com.permission.biz.dto.auth.SsoLoginDTO;
import com.permission.biz.manager.LoginManager;
import com.permission.biz.vo.auth.LoginVO;
import com.permission.biz.vo.auth.SsoLoginVO;
import com.permission.biz.vo.auth.UserInfoVO;
import com.permission.common.config.AuthInterceptor;
import com.permission.common.result.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

/**
 * 登录认证 Controller
 */
@Tag(name = "登录认证")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class LoginController {

    private final LoginManager loginManager;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Operation(summary = "账号密码登录")
    @PostMapping("/login")
    public ApiResponse<UserInfoVO> login(@RequestBody @Valid LoginDTO dto, HttpServletResponse response) {
        LoginVO loginVO = loginManager.login(dto);
        
        long nowSeconds = System.currentTimeMillis() / 1000;
        setCookie(response, "access_token", loginVO.getAccessToken(), 
                (int) (loginVO.getExpiresAt() - nowSeconds));
        setCookie(response, "refresh_token", loginVO.getRefreshToken(),
                (int) (loginVO.getRefreshExpiresAt() - nowSeconds));
        
        return ApiResponse.success(loginVO.getUserInfo());
    }

    @Operation(summary = "SSO登录")
    @PostMapping("/sso-login")
    public ApiResponse<SsoLoginVO> ssoLogin(@RequestBody @Valid SsoLoginDTO dto) {
        return ApiResponse.success(loginManager.ssoLogin(dto));
    }

    @Operation(summary = "登出")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = (String) request.getAttribute(AuthInterceptor.SESSION_ID_ATTRIBUTE);
        loginManager.logout(sessionId);
        
        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");
        
        return ApiResponse.success();
    }

    @Operation(summary = "刷新Token")
    @PostMapping("/refresh")
    public ApiResponse<UserInfoVO> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = getCookieValue(request, "refresh_token");
        if (refreshToken == null) {
            return ApiResponse.fail("401", "Refresh Token不存在");
        }
        
        RefreshTokenDTO dto = new RefreshTokenDTO();
        dto.setRefreshToken(refreshToken);
        
        LoginVO loginVO = loginManager.refresh(dto);
        
        long nowSeconds = System.currentTimeMillis() / 1000;
        setCookie(response, "access_token", loginVO.getAccessToken(),
                (int) (loginVO.getExpiresAt() - nowSeconds));
        
        return ApiResponse.success(loginVO.getUserInfo());
    }

    @Operation(summary = "获取当前登录用户信息")
    @GetMapping("/current-user")
    public ApiResponse<UserInfoVO> getCurrentUser(HttpServletRequest request) {
        String sessionId = (String) request.getAttribute(AuthInterceptor.SESSION_ID_ATTRIBUTE);
        return ApiResponse.success(loginManager.getCurrentUser(sessionId));
    }

    private void setCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(Math.max(maxAgeSeconds, 0));
        response.addCookie(cookie);
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
