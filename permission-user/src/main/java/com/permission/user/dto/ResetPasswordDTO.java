package com.permission.user.dto;

import lombok.Data;

/**
 * 重置密码DTO
 */
@Data
public class ResetPasswordDTO {

    /**
     * 新密码，如果不传则自动生成
     */
    private String newPassword;
}
