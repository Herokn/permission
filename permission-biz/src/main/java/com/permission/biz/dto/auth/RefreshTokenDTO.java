package com.permission.biz.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 刷新Token请求 DTO
 */
@Data
@Schema(description = "刷新Token请求")
public class RefreshTokenDTO {

    @Schema(description = "Refresh Token", required = true)
    @NotBlank(message = "Refresh Token不能为空")
    private String refreshToken;
}
