package com.permission.biz.vo.userauth;

import lombok.Data;

import java.util.List;

/**
 * 用户授权详情 VO
 */
@Data
public class UserAuthDetailVO {

    private String userId;
    private List<UserRoleVO> roles;
    private List<UserDirectPermissionVO> directPermissions;
}

