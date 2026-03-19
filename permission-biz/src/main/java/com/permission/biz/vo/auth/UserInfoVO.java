package com.permission.biz.vo.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 用户信息 VO
 */
@Data
@Schema(description = "用户信息")
public class UserInfoVO {

    @Schema(description = "用户ID")
    private String userId;

    @Schema(description = "用户名")
    private String userName;

    @Schema(description = "登录类型")
    private String loginType;

    @Schema(description = "用户权限编码列表")
    private List<String> permissions;

    @Schema(description = "是否为超级管理员")
    private boolean admin;
}
