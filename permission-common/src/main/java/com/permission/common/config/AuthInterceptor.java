package com.permission.common.config;

import com.permission.common.context.UserInfoDTO;
import com.permission.common.context.UserContextHolder;
import com.permission.common.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 认证拦截器
 * 支持从 Header 或 Cookie 读取 Token
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final SessionValidator sessionValidator;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String ACCESS_TOKEN_COOKIE = "access_token";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_SESSION_ID = "sid";
    public static final String USER_ID_ATTRIBUTE = "userId";
    public static final String SESSION_ID_ATTRIBUTE = "sessionId";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        String token = extractToken(request);
        
        if (token == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":143009,\"message\":\"未登录或登录已过期\",\"data\":null}");
            return false;
        }

        Claims claims = jwtUtil.parseToken(token);
        if (claims == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":143008,\"message\":\"Token无效\",\"data\":null}");
            return false;
        }

        String tokenType = claims.get(CLAIM_TYPE, String.class);
        if (!TOKEN_TYPE_ACCESS.equals(tokenType)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":143008,\"message\":\"请使用Access Token访问接口\",\"data\":null}");
            return false;
        }

        String userId = claims.getSubject();
        String sessionId = claims.get(CLAIM_SESSION_ID, String.class);

        if (!sessionValidator.isValid(sessionId)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":143010,\"message\":\"会话已失效，请重新登录\",\"data\":null}");
            return false;
        }

        request.setAttribute(USER_ID_ATTRIBUTE, userId);
        request.setAttribute(SESSION_ID_ATTRIBUTE, sessionId);

        UserInfoDTO userInfo = new UserInfoDTO();
        userInfo.setUserId(userId);
        userInfo.setSessionId(sessionId);
        UserContextHolder.setUser(userInfo);

        return true;
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            return authHeader.substring(BEARER_PREFIX.length());
        }
        
        String cookieToken = getCookieValue(request, ACCESS_TOKEN_COOKIE);
        if (cookieToken != null) {
            return cookieToken;
        }
        
        return null;
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) throws Exception {
        UserContextHolder.clear();
    }
}
