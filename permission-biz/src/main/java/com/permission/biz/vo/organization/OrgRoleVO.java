package com.permission.biz.vo.organization;

import lombok.Data;

/**
 * 组织角色 VO
 */
@Data
public class OrgRoleVO {

    private Long roleId;
    private String roleCode;
    private String roleName;
    private String roleScope;
    private String status;
}

