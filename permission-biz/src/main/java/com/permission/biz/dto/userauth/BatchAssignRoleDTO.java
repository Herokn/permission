package com.permission.biz.dto.userauth;

import lombok.Data;

import java.util.List;

/**
 * 批量分配角色 DTO
 */
@Data
public class BatchAssignRoleDTO {

    /**
     * 用户ID列表
     */
    private List<String> userIds;

    /**
     * 角色ID
     */
    private Long roleId;

    /**
     * 项目ID（可选）
     */
    private String projectId;
}
