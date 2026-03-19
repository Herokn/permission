package com.permission.biz.dto.userauth;

import lombok.Data;

import java.util.List;

/**
 * 批量授予权限 DTO
 */
@Data
public class BatchGrantPermissionDTO {

    /**
     * 用户ID列表
     */
    private List<String> userIds;

    /**
     * 权限编码
     */
    private String permissionCode;

    /**
     * 效果：ALLOW/DENY
     */
    private String effect;

    /**
     * 项目ID（可选）
     */
    private String projectId;
}
