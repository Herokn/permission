package com.permission.biz.vo.userauth;

import lombok.Data;

/**
 * 用户直接权限 VO
 */
@Data
public class UserDirectPermissionVO {

    private String permissionCode;
    private String permissionName;
    private String effect;
    private String projectId;
    private String status;
}

