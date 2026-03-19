package com.permission.common.context;

import lombok.Data;

import java.util.List;

/**
 * 用户信息 DTO
 * 用于在上下文中存储当前登录用户信息
 */
@Data
public class UserInfoDTO {

    /**
     * 用户ID
     */
    private String userId;

    /**
     * 会话ID
     */
    private String sessionId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 用户角色编码列表
     */
    private List<String> roleCodes;

    /**
     * 是否管理员
     */
    private boolean admin;
}
