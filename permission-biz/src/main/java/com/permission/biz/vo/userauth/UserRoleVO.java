package com.permission.biz.vo.userauth;

import lombok.Data;

/**
 * 用户角色 VO
 */
@Data
public class UserRoleVO {

    private Long roleId;
    private String roleCode;
    private String roleName;
    private String roleScope;
    private String projectId;
    private String status;
}

