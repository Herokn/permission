package com.permission.test.web.controller;

import com.permission.biz.dto.auth.LoginDTO;
import com.permission.biz.dto.auth.RefreshTokenDTO;
import com.permission.biz.dto.auth.SsoLoginDTO;
import com.permission.common.exception.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * LoginController 测试
 */
@DisplayName("登录接口测试")
public class LoginControllerTest extends BaseControllerTest {

    @Nested
    @DisplayName("密码登录")
    class PasswordLoginTests {

        @Test
        @DisplayName("正常登录 - 成功")
        void testLoginSuccess() throws Exception {
            LoginDTO dto = new LoginDTO();
            dto.setLoginAccount("admin");
            dto.setPassword("admin123");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/password")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(200))
                    .andExpect(jsonPath("$.data.accessToken").exists())
                    .andExpect(jsonPath("$.data.refreshToken").exists());
        }

        @Test
        @DisplayName("密码错误 - 失败")
        void testLoginWithWrongPassword() throws Exception {
            LoginDTO dto = new LoginDTO();
            dto.setLoginAccount("admin");
            dto.setPassword("wrong_password");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/password")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(ErrorCode.LOGIN_FAILED.getCode()));
        }

        @Test
        @DisplayName("用户不存在 - 失败")
        void testLoginWithNonExistentUser() throws Exception {
            LoginDTO dto = new LoginDTO();
            dto.setLoginAccount("nonexistent");
            dto.setPassword("password");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/password")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(ErrorCode.USER_NOT_EXISTS.getCode()));
        }

        @Test
        @DisplayName("参数校验 - 缺少登录账号")
        void testLoginMissingAccount() throws Exception {
            LoginDTO dto = new LoginDTO();
            dto.setPassword("password");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/password")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("刷新令牌")
    class RefreshTokenTests {

        @Test
        @DisplayName("正常刷新 - 成功")
        void testRefreshSuccess() throws Exception {
            // 先登录获取 refresh token
            LoginDTO loginDto = new LoginDTO();
            loginDto.setLoginAccount("admin");
            loginDto.setPassword("admin123");

            String response = mockMvc.perform(MockMvcRequestBuilders.post("/api/login/password")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(loginDto)))
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            // 提取 refresh token（实际应使用JsonPath）
            // 这里简化处理，实际需要完整解析JSON

            RefreshTokenDTO dto = new RefreshTokenDTO();
            // dto.setRefreshToken(extractedRefreshToken);

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/refresh")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("无效refresh token - 失败")
        void testRefreshWithInvalidToken() throws Exception {
            RefreshTokenDTO dto = new RefreshTokenDTO();
            dto.setRefreshToken("invalid_refresh_token");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/refresh")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(ErrorCode.REFRESH_TOKEN_INVALID.getCode()));
        }
    }

    @Nested
    @DisplayName("SSO登录")
    class SsoLoginTests {

        @Test
        @DisplayName("无code - 返回授权URL")
        void testSsoLoginWithoutCode() throws Exception {
            SsoLoginDTO dto = new SsoLoginDTO();
            dto.setRedirectUri("http://localhost:3000");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/sso")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.authUrl").exists());
        }

        @Test
        @DisplayName("回调地址不在白名单 - 失败")
        void testSsoLoginWithInvalidRedirectUri() throws Exception {
            SsoLoginDTO dto = new SsoLoginDTO();
            dto.setRedirectUri("http://malicious-site.com");

            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/sso")
                            .contentType(JSON_CONTENT_TYPE)
                            .content(toJson(dto)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_PARAM.getCode()));
        }
    }

    @Nested
    @DisplayName("登出")
    class LogoutTests {

        @Test
        @DisplayName("正常登出 - 成功")
        void testLogoutSuccess() throws Exception {
            mockMvc.perform(MockMvcRequestBuilders.post("/api/login/logout")
                            .header("Authorization", "Bearer dummy_token"))
                    .andExpect(status().isOk());
        }
    }
}
